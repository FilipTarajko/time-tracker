<script setup lang="ts">
import { useSettingsStore } from 'stores/settingsStore';

const settingsStore = useSettingsStore();
</script>

<template>
  <div class="column q-my-lg q-mx-auto" style="max-width: 300px">
    Settings
    <q-input
      label="day end offset (hours after midnight)"
      type="number"
      dense
      min="0"
      max="23"
      v-model="settingsStore.dayEndOffset"
    />
    <q-checkbox v-model="settingsStore.goOver24WhenOffset"
      >go over 24 when offset
    </q-checkbox>
    <q-checkbox
      v-model="settingsStore.alsoGoOver24WhenMultiDay"
      :disable="!settingsStore.goOver24WhenOffset"
      >also go over 24 when multi day
    </q-checkbox>
    <q-checkbox
      v-model="settingsStore.displayUpdatedAt"
    >display updated_at
    </q-checkbox>
  </div>
</template>

<style scoped lang="scss"></style>
