<template>
  <template v-if="useAuthStore().isLoggedIn">
    <ShortcutsComponent />
    <CurrentEntry />
    <EntriesList :display-ongoing="false" />
    <TaskEditDialog />
    <EntryDeletionConfirmationDialog />
  </template>
</template>

<script setup lang="ts">
import { useAuthStore } from 'stores/authStore';
import ShortcutsComponent from 'components/ShortcutsComponent.vue';
import CurrentEntry from 'components/CurrentEntry.vue';
import EntriesList from 'components/EntriesList.vue';
import TaskEditDialog from 'components/TaskEditDialog.vue';
import EntryDeletionConfirmationDialog from 'components/EntryDeletionConfirmationDialog.vue';

defineOptions({
  name: 'IndexPage',
});
</script>
