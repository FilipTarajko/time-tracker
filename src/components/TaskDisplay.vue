<script setup lang="ts">
import { Task, useTasksStore } from 'stores/tasksStore';

const tasksStore = useTasksStore();

defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  openTaskEditing: [];
}>();

import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
</script>

<template>
  <div class="flex">
    <q-item-section avatar>
      <TasksImgOrIcon
        :task="task"
        @click="emit('openTaskEditing')"
      ></TasksImgOrIcon>
    </q-item-section>
    <q-item-section>
      <q-item-label @click="emit('openTaskEditing')"
        >{{ task.name }}
      </q-item-label>
      <q-item-label v-if="task.parentTaskId" caption
        >{{ tasksStore.generateLabel(task) }}
      </q-item-label>
    </q-item-section>
  </div>
</template>

<style scoped lang="scss"></style>
