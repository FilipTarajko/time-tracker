<script setup lang="ts">
import { Task } from 'stores/tasksStore';

defineProps<{
  task: Task | undefined;
}>();
</script>

<template>
  <img
    style="width: 36px"
    v-if="task?.imageSrc"
    :alt="task.name + ' category icon'"
    :src="task.imageSrc"
  />
  <q-icon
    :style="{ color: task?.color }"
    style="width: 36px; font-size: 36px"
    v-else-if="task?.icon"
    :name="task.icon"
  />
</template>

<style scoped lang="scss"></style>
