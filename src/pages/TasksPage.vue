<script setup lang="ts">
import TaskEditDialog from 'components/TaskEditDialog.vue';
import TaskDeletionConfirmationDialog from 'components/TaskDeletionConfirmationDialog.vue';
import TasksEntriesListDialog from 'components/TasksEntriesListDialog.vue';
import EntryDeletionConfirmationDialog from 'components/EntryDeletionConfirmationDialog.vue';
import TasksList from 'components/TasksList.vue';
import TasksChildTasksListDialog from 'components/TasksChildTasksListDialog.vue';
</script>

<template>
  <div style="width: fit-content; margin: 0 auto">
    <TasksList />
  </div>
  <TaskEditDialog />
  <TaskDeletionConfirmationDialog />
  <TasksEntriesListDialog />
  <TasksChildTasksListDialog />
  <EntryDeletionConfirmationDialog />
</template>

<style scoped lang="scss"></style>
