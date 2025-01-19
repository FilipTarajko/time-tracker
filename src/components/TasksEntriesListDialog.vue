<script setup lang="ts">
import { useTasksStore } from 'stores/tasksStore';
import EntriesList from 'components/EntriesList.vue';

const tasksStore = useTasksStore();
</script>

<template>
  <q-dialog
    v-if="tasksStore.taskForFilteredEntriesList"
    v-model="tasksStore.doesTaskForFilteredEntriesListExist"
  >
    <q-card class="q-pa-lg" style="max-width: 500px; width: 100%">
      entries for task {{ tasksStore.taskForFilteredEntriesList.name }}
      <EntriesList
        display-ongoing
        :filter-by-task="tasksStore.taskForFilteredEntriesList"
      />
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
