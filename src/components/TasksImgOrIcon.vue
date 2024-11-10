<script setup lang="ts">
import { Task } from 'pages/IndexPage.vue';

defineProps<{
  task: Task | null;
}>();
</script>

<template>
  <img
    style="width: 36px;"
    v-if="task?.imageSrc"
    :alt="task.name + ' category icon'"
    :src="task.imageSrc"
  />
  <q-icon style="width: 36px; font-size: 36px;" v-else-if="task?.icon" :name="task.icon" />
</template>

<style scoped lang="scss">

</style>
