<script setup lang="ts">
import { useEntriesStore } from 'stores/entriesStore';
import { useTasksStore } from 'stores/tasksStore';

const entriesStore = useEntriesStore();
const tasksStore = useTasksStore();
</script>

<template>
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 0 12px">
    <div>total entries</div>
    <div>{{ entriesStore.entries.length }}</div>
    <div>total tasks</div>
    <div>{{ tasksStore.tasks.length }}</div>
    <div>top-level tasks</div>
    <div>
      {{ tasksStore.tasks.filter((task) => !task.parentTaskId).length }}
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
