<script setup lang="ts">
import { getTimestampDifferenceString } from 'src/helpers/timeHelpers';
import EntryTimestamps from 'components/EntryTimestamps.vue';
import TaskDisplay from 'components/TaskDisplay.vue';
import EntryDescription from 'components/EntryDescription.vue';
import { useTasksStore } from 'stores/tasksStore';
import { useEntriesStore } from 'stores/entriesStore';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();
</script>

<template>
  <q-dialog
    v-if="entriesStore.entryForDeletionConfirmation"
    v-model="entriesStore.doesEntryForDeletionConfirmationExist"
  >
    <q-card class="q-pa-lg" style="width: fit-content">
      <div class="q-mb-lg">
        Are you sure? This will permanently delete the entry.
        <q-item
          :style="{
            backgroundColor: tasksStore.generateBackgroundColor(
              tasksStore.getTaskById(
                entriesStore.entryForDeletionConfirmation.taskId
              )
            ),
          }"
          style="
            border: 1px solid #3333;
            display: grid;
            grid-template-columns: 1fr auto;
            pointer-events: none;
          "
          class="q-mt-sm"
        >
          <div class="description-and-style-container">
            <TaskDisplay
              :task="
                tasksStore.getTaskById(
                  entriesStore.entryForDeletionConfirmation.taskId
                )
              "
            ></TaskDisplay>
            <EntryDescription
              :entry="entriesStore.entryForDeletionConfirmation"
            />
          </div>
          <div style="display: flex; flex-direction: row; gap: 1.6em">
            <div class="timestamps-and-duration-flex">
              <EntryTimestamps
                :entry="entriesStore.entryForDeletionConfirmation"
              />
              <div class="entry-duration" style="width: fit-content">
                {{
                  getTimestampDifferenceString(
                    entriesStore.entryForDeletionConfirmation.endTime!,
                    entriesStore.entryForDeletionConfirmation.startTime
                  )
                }}
              </div>
            </div>
            <div
              style="
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              "
            ></div>
          </div>
        </q-item>
      </div>
      <q-btn color="warning" v-close-popup class="q-mr-md">cancel</q-btn>
      <q-btn
        color="red"
        @click="
          entriesStore.deleteEntry(entriesStore.entryForDeletionConfirmation)
        "
        v-close-popup
        >delete entry
      </q-btn>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
