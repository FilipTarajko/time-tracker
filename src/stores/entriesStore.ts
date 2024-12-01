import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { date } from 'quasar';

export interface Entry {
  id: number;
  taskId: number;
  description: string;
  startTime: number;
  endTime?: number;
  date?: string;
}

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<Entry[]>([
    {
      id: 3,
      taskId: 3,
      description: 'Lorem',
      startTime: 1731333541000,
      endTime: 1731333773809,
    },
    {
      id: 2,
      taskId: 2,
      description: 'Placeholder',
      startTime: 1731329941000,
      endTime: 1731333541000,
    },
    {
      id: 1,
      taskId: 1,
      description: 'Todo',
      startTime: 1731315035000,
      endTime: 1731329941000,
    },
  ]);

  function getLocalDateOfEntry(entry: Entry) {
    return date.formatDate(new Date(entry.startTime), 'YYYY-MM-DD');
  }

  const finishedEntriesWithDates = computed<Map<string, Entry[]>>(() => {
    const finishedEntries = entries.value
      .sort((a, b) => b.startTime - a.startTime)
      .filter((entry) => entry.endTime);
    const dates: Map<string, Entry[]> = new Map();

    for (let i=0; i<finishedEntries.length; i++) {
      const entry = finishedEntries[i];
      const dateOfThisEntry = getLocalDateOfEntry(entry);
      if (dates.has(dateOfThisEntry)) {
        dates.set(dateOfThisEntry, [...dates.get(dateOfThisEntry)!, entry])
      } else {
        dates.set(dateOfThisEntry, [entry])
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
    }
  }

  function startNewEntry(taskId: number, description: string) {
    endMostRecentEntryIfOngoing();

    entries.value.unshift({
      id: (entries.value[0]?.id ?? 0) + 1,
      taskId: taskId,
      description: description,
      startTime: new Date().getTime(),
      endTime: undefined,
    });
  }

  return { entries, finishedEntriesWithDates, startNewEntry };
});
