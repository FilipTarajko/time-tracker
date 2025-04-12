<script setup lang="ts">
import { useTasksStore } from 'stores/tasksStore';
import { useEntriesStore } from 'stores/entriesStore';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();
</script>

<template>
  <div style="width: fit-content; margin: 0 auto">
    <div
      style="
        display: grid;
        grid-template-columns: repeat(2, max-content);
        gap: 0 20px;
        width: fit-content;
        margin: 24px auto;
      "
    >
      <div>total entries</div>
      <div>{{ entriesStore.entries.length }}</div>
      <div>total tasks</div>
      <div>{{ tasksStore.tasks.length }}</div>
      <div>top-level tasks</div>
      <div>
        {{ tasksStore.tasks.filter((task) => !task.parentTaskId).length }}
      </div>
      <div>deepest nesting</div>
      <div>
        {{ tasksStore.highestNumberOfAncestors }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
