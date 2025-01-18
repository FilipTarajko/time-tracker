<script setup lang="ts">
import {
  formatDuration,
  getTimestampDifferenceString,
} from 'src/helpers/timeHelpers';
import EntryTimestamps from 'components/EntryTimestamps.vue';
import TaskDisplay from 'components/TaskDisplay.vue';
import EntryDescription from 'components/EntryDescription.vue';
import { useTasksStore } from 'stores/tasksStore';
import { useEntriesStore } from 'stores/entriesStore';
import { ref } from 'vue';

const entriesStore = useEntriesStore();
const tasksStore = useTasksStore();

const now = ref(Date.now());
setInterval(() => {
  now.value = Date.now();
}, 1000);
</script>

<template>
  <div
    v-for="dateAndEntries in entriesStore.finishedEntriesWithDates"
    :key="dateAndEntries[0]"
  >
    <div style="margin-top: 8px; display: flex; gap: 1.6em">
      <div>
        {{ dateAndEntries[0] }}
      </div>
      <div>
        {{
          formatDuration(
            dateAndEntries[1].reduce(
              (total, entry) => total + entry.endTime! - entry.startTime,
              0
            ) +
              (entriesStore.ongoingEntry &&
              entriesStore.getLocalDateOfEntry(entriesStore.ongoingEntry) ==
                dateAndEntries[0]
                ? now - entriesStore.ongoingEntry.startTime
                : 0)
          )
        }}
      </div>
    </div>
    <q-item
      v-for="entry in dateAndEntries[1]"
      :key="entry.id"
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
  </div>
</template>
