<script setup lang="ts">
import { useTasksStore } from 'stores/tasksStore';
import TasksList from 'components/TasksList.vue';

const tasksStore = useTasksStore();
</script>

<template>
  <q-dialog
    v-if="tasksStore.taskForFilteredTasksList"
    v-model="tasksStore.doesTaskForFilteredTasksListExist"
  >
    <q-card class="q-pa-lg" style="max-width: 500px; width: 100%">
      <div>
        child tasks of task {{ tasksStore.taskForFilteredTasksList.name }}
      </div>
      <TasksList :filter-by-parent-task="tasksStore.taskForFilteredTasksList" />
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
