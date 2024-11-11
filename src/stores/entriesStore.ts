import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface Entry {
  id: number;
  taskId: number;
  description: string;
  startTime: number;
  endTime?: number;
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

  const finishedEntries = computed<Entry[]>(() => {
    return entries.value.filter((entry) => entry.endTime);
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
      id: (entries.value?.at(-1)?.id ?? 0) + 1,
      taskId: taskId,
      description: description,
      startTime: new Date().getTime(),
      endTime: undefined,
    });
  }

  return { entries, finishedEntries, startNewEntry };
});
