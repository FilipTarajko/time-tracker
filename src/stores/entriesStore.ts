import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { date } from 'quasar';
import { supabase } from 'src/lib/supabaseClient';

import { Notify } from 'quasar';

export interface Entry {
  dbid?: string;
  id: number; // TODO: change from autoincrement to uuid
  taskId: number;
  description: string;
  startTime: number;
  endTime?: number;
  date?: string;
  user_id?: string;
  // TODO: add last_edited
}

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<Entry[]>([
    // {
    //   id: 3,
    //   taskId: 3,
    //   description: 'Lorem',
    //   startTime: 1731333541000,
    //   endTime: 1731333773809,
    // },
    // {
    //   id: 2,
    //   taskId: 2,
    //   description: 'Placeholder',
    //   startTime: 1731329941000,
    //   endTime: 1731333541000,
    // },
    // {
    //   id: 1,
    //   taskId: 1,
    //   description: 'Todo',
    //   startTime: 1731315035000,
    //   endTime: 1731329941000,
    // },
  ]);

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

  function endMostRecentEntryIfOngoing() {
    const atLeastOneEntryExists = entries.value.length > 0;
    if (atLeastOneEntryExists) {
      const mostRecentEntry = entries.value[0];
      if (mostRecentEntry && !mostRecentEntry?.endTime) {
        mostRecentEntry.endTime = new Date().getTime();
      }

      upsertEntry(mostRecentEntry);
    }
  }

  async function startNewEntry(taskId: number, description: string) {
    endMostRecentEntryIfOngoing();

    const newEntry = {
      id: (entries.value[0]?.id ?? 0) + 1,
      taskId: taskId,
      description: description,
      startTime: new Date().getTime(),
      endTime: undefined,
    }

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

    const valueOnEntry = date.formatDate(entry![editedProperty], 'HH:mm');
    if (valueOnEntry == updatedFormattedTime) {
      return;
    }

    const newValueMinuteOfDay = getMinuteOfDayFromHHmm(updatedFormattedTime);
    const entryValueMinuteOfDay = getMinuteOfDayFromHHmm(valueOnEntry);
    const minutesToAdd = newValueMinuteOfDay - entryValueMinuteOfDay;
    entry![editedProperty] += minutesToAdd * MILLISECONDS_IN_MINUTE;

    const startOfEntry = entry!.startTime;
    const endOfEntry = entry!.endTime;

    if (endOfEntry) {
      if (startOfEntry > endOfEntry) {
        if (isStartTimeEdited) {
          entry!.startTime -= MILLISECONDS_IN_DAY;
        } else {
          entry!.endTime! += MILLISECONDS_IN_DAY;
        }
      }

      if (startOfEntry <= endOfEntry - MILLISECONDS_IN_DAY) {
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

  return {
    entries,
    finishedEntriesWithDates,
    startNewEntry,
    updateDescriptionOfEntry,
    updateTimestampOfEntry,
    initFromSupabase,
    endMostRecentEntryIfOngoing,
  };
});
