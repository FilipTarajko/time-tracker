import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Entry {
  id: number;
  taskId: number;
  description: string;
  startTime: number;
  endTime?: number;
}

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<Entry[]>([]);

  function endLastEntryIfOngoing() {
    const atLeastOneEntryExists = entries.value.length > 0;
    if (atLeastOneEntryExists) {
      const lastEntry = entries.value[entries.value.length - 1];
      if (lastEntry && !lastEntry?.endTime) {
        lastEntry.endTime = new Date().getTime();
      }
    }
  }

  function startNewEntry(taskId: number, description: string) {
    endLastEntryIfOngoing();

    entries.value.push({
      id: (entries.value?.at(-1)?.id ?? 0) + 1,
      taskId: taskId,
      description: description,
      startTime: new Date().getTime(),
      endTime: undefined,
    });
  }

  return { entries, startNewEntry };
});
