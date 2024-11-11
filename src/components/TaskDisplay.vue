<script setup lang="ts">
import { Task, useTasksStore } from 'stores/tasksStore';

const tasksStore = useTasksStore();

defineProps<{
  task: Task;
}>();
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
</script>

<template>
  <q-item-section avatar>
    <TasksImgOrIcon :task="task"></TasksImgOrIcon>
  </q-item-section>
  <q-item-section>
    <q-item-label>{{ task.name }}</q-item-label>
    <q-item-label v-if="task.parentTaskId" caption
    >{{ tasksStore.generateLabel(task) }}
    </q-item-label>
  </q-item-section>
</template>

<style scoped lang="scss">

</style>
