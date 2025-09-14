<template>
  <div>
    <template v-if="tasksStore.tasks.length >= 1"> Shortcuts</template>
    <template v-else> Shortcuts will appear once a task is created.</template>
    <div
      style="
        gap: 2px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      "
    >
      <div
        @click="tasksStore.currentTask = task"
        v-for="task in tasksStore.tasksList"
        :key="task.id"
        :style="{
          backgroundColor: tasksStore.generateBackgroundColor(task),
        }"
        style="border: 1px solid #3333; cursor: pointer; padding: 8px 12px"
      >
        <TaskDisplay :task="task"></TaskDisplay>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useTasksStore } from 'stores/tasksStore';
import TaskDisplay from 'components/TaskDisplay.vue';

const tasksStore = useTasksStore();
</script>
