import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { date } from 'quasar';
import { supabase } from 'src/lib/supabaseClient';

import { Notify } from 'quasar';
import { useTasksStore } from 'stores/tasksStore';

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

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<Entry[]>([]);

  function getLocalDateOfEntry(entry: Entry) {
    return date.formatDate(new Date(entry.startTime), 'YYYY-MM-DD');
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
          useTasksStore().getTaskById(taskId).defaultDescription),
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
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
  const MILLISECONDS_IN_MINUTE = 60 * 1000;

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

    Notify.create({ message: 'Upserted entries', type: 'positive' });
    entry.dbid = data[0].dbid;
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
  };
});
