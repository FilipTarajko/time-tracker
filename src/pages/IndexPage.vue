<template>
  <Suspense>
    <!-- TODO: adjust this "temporary" solution -->
    <SupabasePlayground />
  </Suspense>
  <template v-if="useAuthStore().isLoggedIn">
    <ShortcutsComponent />
    <CurrentEntry />
    <SettingsComponent />
    <FinishedEntries />
    <TaskEditDialog />
    <TaskDeletionConfirmationDialog />
  </template>
</template>

<script setup lang="ts">
import SupabasePlayground from 'components/AuthComponent.vue';
import { useAuthStore } from 'stores/authStore';
import ShortcutsComponent from 'components/ShortcutsComponent.vue';
import CurrentEntry from 'components/CurrentEntry.vue';
import SettingsComponent from 'components/SettingsComponent.vue';
import FinishedEntries from 'components/FinishedEntries.vue';
import TaskEditDialog from 'components/TaskEditDialog.vue';
import TaskDeletionConfirmationDialog from 'components/TaskDeletionConfirmationDialog.vue';

defineOptions({
  name: 'IndexPage',
});
</script>

<style lang="scss">
.description-and-style-container {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;

  @media (width >= 500px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
}

.timestamps-and-duration-flex {
  justify-items: end;

  @media (width >= 600px) {
    display: flex;
    flex-direction: row;
    gap: 1.6em;
  }
}
</style>
