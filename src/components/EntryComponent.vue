<script setup lang="ts">
import EntryTimestamps from 'components/EntryTimestamps.vue';
import EntryDescription from 'components/EntryDescription.vue';
import TaskDisplay from 'components/TaskDisplay.vue';
import { getTimestampDifferenceString } from 'src/helpers/timeHelpers';
import { useTasksStore } from 'stores/tasksStore';
import { useEntriesStore, Entry } from 'stores/entriesStore';
import { useSettingsStore } from 'stores/settingsStore';

const entriesStore = useEntriesStore();
const tasksStore = useTasksStore();
const settingsStore = useSettingsStore();

defineProps<{
  entry: Entry;
}>();
</script>

<template>
  <q-item
    :style="{
      backgroundColor: tasksStore.generateBackgroundColor(
        tasksStore.getTaskById(entry.taskId)
      ),
    }"
    style="
      border: 1px solid #3333;
      display: grid;
      grid-template-columns: 1fr auto;
    "
    class="q-mt-sm"
  >
    <div class="description-and-style-container">
      <TaskDisplay
        :task="tasksStore.getTaskById(entry.taskId)"
        @openTaskEditing="tasksStore.editedTaskId = entry.taskId"
      ></TaskDisplay>
      <EntryDescription :entry />
      <div v-if="settingsStore.displayUpdatedAt">
        {{ entry.updated_at }}
      </div>
    </div>
    <div style="display: flex; flex-direction: row; gap: 1.6em">
      <div class="timestamps-and-duration-flex">
        <EntryTimestamps :entry />
        <div class="entry-duration" style="width: fit-content">
          {{ getTimestampDifferenceString(entry.endTime!, entry.startTime) }}
        </div>
      </div>
      <div
        style="
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        "
      >
        <q-btn
          @click="entriesStore.startCopyOfEntry(entry)"
          flat
          round
          color="primary"
          padding="0"
          size="10px"
          icon="play_arrow"
        />
        <q-btn
          @click="entriesStore.entryForDeletionConfirmation = entry"
          flat
          round
          color="red"
          padding="0"
          size="10px"
          icon="delete"
        />
      </div>
    </div>
  </q-item>
</template>

<style scoped lang="scss"></style>
