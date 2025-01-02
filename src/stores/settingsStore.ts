import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const dayEndOffset = ref(4);
  const goOver24WhenOffset = ref(true);
  const alsoGoOver24WhenMultiDay = ref(true);

  return { dayEndOffset, goOver24WhenOffset, alsoGoOver24WhenMultiDay };
});
