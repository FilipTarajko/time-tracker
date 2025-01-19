<script setup lang="ts">
import { useTasksStore } from 'stores/tasksStore';
import EntriesList from 'components/EntriesList.vue';

const tasksStore = useTasksStore();
</script>

<template>
  <q-dialog
    v-if="tasksStore.taskForFilteredList"
    v-model="tasksStore.doesTaskForFilteredListExist"
  >
    <q-card class="q-pa-lg" style="max-width: 500px; width: 100%">
      <div>entries for task {{ tasksStore.taskForFilteredList.name }}</div>
      <EntriesList
        display-ongoing
        :filter-by-task="tasksStore.taskForFilteredList"
      />
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
