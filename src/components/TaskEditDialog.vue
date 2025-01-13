<script setup lang="ts">
import TaskEditForm from 'components/TaskEditForm.vue';
import { useTasksStore } from 'stores/tasksStore';

const tasksStore = useTasksStore();
</script>

<template>
  <q-dialog
    persistent
    v-if="tasksStore.editedTaskId"
    v-model="tasksStore.isTaskBeingEdited"
  >
    <q-card class="q-pa-lg" style="width: fit-content">
      <TaskEditForm :edited-task-id="tasksStore.editedTaskId" />
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
