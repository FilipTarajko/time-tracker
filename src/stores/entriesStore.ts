import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { date } from 'quasar';
import { supabase } from 'src/lib/supabaseClient';

import { Notify } from 'quasar';
import { Task, useTasksStore } from 'stores/tasksStore';
import { useSettingsStore } from 'stores/settingsStore';
import {
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_HOUR,
  MILLISECONDS_IN_DAY,
  MINUTES_IN_HOUR,
} from 'src/helpers/timeHelpers';

export interface Entry {
  dbid?: string;
  id: string;
  taskId: string;
  description: string;
  startTime: number;
  endTime: number | null;
  date?: string;
  user_id?: string;
  // TODO: add last_edited
}

const settingsStore = useSettingsStore();

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<Entry[]>([]);

  const tasksStore = useTasksStore();

  function getLocalDateOfTimestampAccordingToSettings(timestamp: number) {
    return date.formatDate(
      new Date(timestamp - settingsStore.dayEndOffset * MILLISECONDS_IN_HOUR),
      'YYYY-MM-DD'
    );
  }

  function getLocalDateOfEntry(entry: Entry) {
    return getLocalDateOfTimestampAccordingToSettings(entry.startTime);
  }

  const finishedEntriesWithDates = computed<Map<string, Entry[]>>(() => {
    const finishedEntries = entries.value
      .sort((a, b) => b.startTime - a.startTime)
      .filter((entry) => entry.endTime);
    const dates: Map<string, Entry[]> = new Map();

    for (let i = 0; i < finishedEntries.length; i++) {
      const entry = finishedEntries[i];
      const dateOfThisEntry = getLocalDateOfEntry(entry);
      if (dates.has(dateOfThisEntry)) {
        dates.set(dateOfThisEntry, [...dates.get(dateOfThisEntry)!, entry]);
      } else {
        dates.set(dateOfThisEntry, [entry]);
      }
    }

    return dates;
  });

  const ongoingEntry = computed<Entry | null>(() => {
    return entries.value.find((entry) => !entry.endTime) ?? null;
  });

  function endOngoingEntry() {
    if (ongoingEntry.value) {
      const entryBeingEnded = ongoingEntry.value;
      entryBeingEnded.endTime = new Date().getTime();
      descriptionForNewEntry.value = '';
      upsertEntry(entryBeingEnded);
    }
  }

  async function startNewEntry(taskId: string, description?: string) {
    endOngoingEntry();

    const newEntry = {
      id: crypto.randomUUID(),
      taskId: taskId,
      description:
        description ??
        (descriptionForNewEntry.value ||
          tasksStore.getTaskById(taskId).defaultDescription),
      startTime: new Date().getTime(),
      endTime: null,
    };

    entries.value.unshift(newEntry);

    upsertEntry(newEntry);
  }

  function updateDescriptionOfEntry(entry: Entry, newDescription: string) {
    entry.description = newDescription;
    upsertEntry(entry);
  }

  function getMinuteOfDayFromHHmm(HHmm: string): number {
    const parts = HHmm.split(':');
    return MINUTES_IN_HOUR * Number(parts[0]) + Number(parts[1]);
  }

  function updateTimestampOfEntry(
    entry: Entry,
    updatedFormattedTime: string,
    isStartTimeEdited: boolean
  ) {
    const editedProperty = isStartTimeEdited ? 'startTime' : 'endTime';

    const valueOnEntry = date.formatDate(
      entry![editedProperty] ?? undefined,
      'HH:mm'
    );
    if (valueOnEntry == updatedFormattedTime) {
      return;
    }

    const newValueMinuteOfDay = getMinuteOfDayFromHHmm(updatedFormattedTime);
    const entryValueMinuteOfDay = getMinuteOfDayFromHHmm(valueOnEntry);
    const minutesToAdd = newValueMinuteOfDay - entryValueMinuteOfDay;
    entry![editedProperty] += minutesToAdd * MILLISECONDS_IN_MINUTE;

    const startOfEntry = entry!.startTime;
    const endOfEntryOrNow = entry!.endTime ?? Date.now();

    if (endOfEntryOrNow) {
      if (startOfEntry > endOfEntryOrNow) {
        if (isStartTimeEdited) {
          entry!.startTime -= MILLISECONDS_IN_DAY;
        } else {
          entry!.endTime! += MILLISECONDS_IN_DAY;
        }
      }

      if (startOfEntry <= endOfEntryOrNow - MILLISECONDS_IN_DAY) {
        if (isStartTimeEdited) {
          entry!.startTime += MILLISECONDS_IN_DAY;
        } else {
          entry!.endTime! -= MILLISECONDS_IN_DAY;
        }
      }
    }

    upsertEntry(entry);
  }

  async function initFromSupabase() {
    const { data } = await supabase.from('entries').select();
    entries.value = data as Entry[];
  }

  async function upsertEntry(entry: Entry) {
    // TODO: automatically upsert all edited after last sync?

    const { data, error } = await supabase
      .from('entries')
      .upsert(entry)
      .select();

    if (error) {
      Notify.create({ message: error.message, type: 'negative' });
      return;
    }

    Notify.create({ message: 'Upserted entry', type: 'positive' });
    entry.dbid = data[0].dbid;
  }

  async function deleteEntry(entry: Entry) {
    const { data, error } = await supabase
      .from('entries')
      .delete()
      .eq('dbid', entry.dbid)
      .select();

    if (error) {
      Notify.create({ message: error.message, type: 'negative' });
      return;
    }

    Notify.create({ message: 'Deleted entry', type: 'positive' });
    entries.value = entries.value.filter((e) => e.dbid != data[0].dbid);
  }

  const futureEntryDescription = ref('');
  const descriptionForNewEntry = computed<string>({
    get() {
      return ongoingEntry.value?.description ?? futureEntryDescription.value;
    },
    set(value) {
      if (ongoingEntry.value) {
        updateDescriptionOfEntry(ongoingEntry.value, value);
      } else {
        futureEntryDescription.value = value;
      }
    },
  });

  async function startCopyOfEntry(entry: Entry) {
    endOngoingEntry();
    futureEntryDescription.value = entry.description;
    tasksStore.currentTask = tasksStore.getTaskById(entry.taskId);
  }

  function countEntriesByTask(task: Task) {
    return entries.value.filter((entry) => entry.taskId === task.id).length;
  }

  return {
    entries,
    finishedEntriesWithDates,
    startNewEntry,
    updateDescriptionOfEntry,
    updateTimestampOfEntry,
    initFromSupabase,
    endOngoingEntry,
    ongoingEntry,
    descriptionForNewEntry,
    getLocalDateOfEntry,
    getLocalDateOfTimestampAccordingToSettings,
    deleteEntry,
    startCopyOfEntry,
    countEntriesByTask,
  };
});
