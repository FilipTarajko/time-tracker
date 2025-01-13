<template>
  <Suspense>
    <!-- TODO: adjust this "temporary" solution -->
    <SupabasePlayground />
  </Suspense>
  <template v-if="useAuthStore().isLoggedIn">
    <ShortcutsComponent />
    <CurrentEntry />
    <SettingsComponent />
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
                  ? Date.now() - entriesStore.ongoingEntry.startTime
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
            @openTaskEditing="editedTaskId = entry.taskId"
          ></TaskDisplay>
          <EntryDescription :entry />
        </div>
        <div style="display: flex; flex-direction: row; gap: 1.6em">
          <div class="timestamps-and-duration-flex">
            <EntryTimestamps :entry />
            <div class="entry-duration" style="width: fit-content">
              {{
                getTimestampDifferenceString(entry.endTime!, entry.startTime)
              }}
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
              @click="entryForDeletionConfirmation = entry"
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

    <q-dialog persistent v-if="editedTaskId" v-model="isTaskBeingEdited">
      <q-card class="q-pa-lg" style="width: fit-content">
        <TaskEditForm :editedTaskId />
      </q-card>
    </q-dialog>

    <q-dialog
      v-if="entryForDeletionConfirmation"
      v-model="doesEntryForDeletionConfirmationExist"
    >
      <q-card class="q-pa-lg" style="width: fit-content">
        <div class="q-mb-lg">
          Are you sure? This will permanently delete the entry.
          <q-item
            :style="{
              backgroundColor: tasksStore.generateBackgroundColor(
                tasksStore.getTaskById(entryForDeletionConfirmation.taskId)
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
                  tasksStore.getTaskById(entryForDeletionConfirmation.taskId)
                "
                @openTaskEditing="
                  editedTaskId = entryForDeletionConfirmation.taskId
                "
              ></TaskDisplay>
              <EntryDescription :entry="entryForDeletionConfirmation" />
            </div>
            <div style="display: flex; flex-direction: row; gap: 1.6em">
              <div class="timestamps-and-duration-flex">
                <EntryTimestamps :entry="entryForDeletionConfirmation" />
                <div class="entry-duration" style="width: fit-content">
                  {{
                    getTimestampDifferenceString(
                      entryForDeletionConfirmation.endTime!,
                      entryForDeletionConfirmation.startTime
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
          @click="entriesStore.deleteEntry(entryForDeletionConfirmation)"
          v-close-popup
          >delete entry
        </q-btn>
      </q-card>
    </q-dialog>
  </template>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from 'vue';
import { useTasksStore } from 'stores/tasksStore';
import { Entry, useEntriesStore } from 'stores/entriesStore';
import TaskDisplay from 'components/TaskDisplay.vue';
import EntryTimestamps from 'components/EntryTimestamps.vue';
import EntryDescription from 'components/EntryDescription.vue';
import SupabasePlayground from 'components/AuthComponent.vue';
import { useAuthStore } from 'stores/authStore';
import {
  formatDuration,
  getTimestampDifferenceString,
} from 'src/helpers/timeHelpers';
import TaskEditForm from 'components/TaskEditForm.vue';
import ShortcutsComponent from 'components/ShortcutsComponent.vue';
import CurrentEntry from 'components/CurrentEntry.vue';
import SettingsComponent from 'components/SettingsComponent.vue';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();

const editedTaskId: Ref<string | null> = ref(null);
const isTaskBeingEdited = computed({
  get() {
    return editedTaskId.value !== null;
  },
  set(x) {
    if (!x) {
      editedTaskId.value = null;
    }
  },
});

const entryForDeletionConfirmation: Ref<Entry | null> = ref(null);
const doesEntryForDeletionConfirmationExist = computed({
  get() {
    return entryForDeletionConfirmation.value !== null;
  },
  set(x) {
    if (!x) {
      entryForDeletionConfirmation.value = null;
    }
  },
});

defineOptions({
  name: 'IndexPage',
});
</script>

<style scoped lang="scss">
.description-and-style-container {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;

  @media (width >= 500px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
}

.timestamps-and-duration-flex {
  justify-items: end;

  @media (width >= 600px) {
    display: flex;
    flex-direction: row;
    gap: 1.6em;
  }
}
</style>
