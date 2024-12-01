<script setup lang="ts">
import { Task } from 'stores/tasksStore';

defineProps<{
  task: Task | undefined;
}>();
</script>

<template>
  <div style="width: 36px; height: 36px;">
    <img
      v-if="task?.imageSrc"
      :alt="task.name + ' category icon'"
      :src="task.imageSrc"
    />
    <q-icon
      :style="{ color: task?.color }"
      style="font-size: 36px"
      v-else-if="task?.icon"
      :name="task.icon"
    />
  </div>
</template>

<style scoped lang="scss"></style>
