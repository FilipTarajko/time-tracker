import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export const useSettingsStore = defineStore('settings', () => {
  const dayEndOffset = useLocalStorage('settings:dayEndOffset', 4);
  const goOver24WhenOffset = useLocalStorage('settings:goOver24WhenOffset', true);
  const alsoGoOver24WhenMultiDay = useLocalStorage('settings:alsoGoOver24WhenMultiDay', true);
  const displayUpdatedAt = useLocalStorage('settings:displayUpdatedAt', false);
  const displayTasksByHierarchy = useLocalStorage('settings:displayTasksByHierarchy', true);
  const displayTasksTotalTimes = useLocalStorage('settings:displayTasksTotalTimes', true);

  return {
    dayEndOffset,
    goOver24WhenOffset,
    alsoGoOver24WhenMultiDay,
    displayUpdatedAt,
    displayTasksByHierarchy,
    displayTasksTotalTimes,
  };
});
