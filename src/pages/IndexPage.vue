<template>
  <Suspense>
    <!-- TODO: adjust this "temporary" solution -->
    <SupabasePlayground />
  </Suspense>
  <template v-if="useAuthStore().isLoggedIn">
    Shortcuts
    <div v-if="tasksStore.tasks.length == 0">
      Shortcuts will appear once a task is created.
    </div>
    <div
      style="
        gap: 2px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      "
    >
      <div
        @click="tasksStore.currentTask = task"
        v-for="task in tasksStore.tasksList"
        :key="task.id"
        :style="{
          backgroundColor: tasksStore.generateBackgroundColor(task),
        }"
        style="border: 1px solid #3333; cursor: pointer; padding: 8px 12px"
      >
        <TaskDisplay :task="task"></TaskDisplay>
      </div>
    </div>
    <div class="current-entry">
      <q-select
        v-model="tasksStore.currentTask"
        :options="filteredTasks"
        :option-label="(task) => tasksStore.generateLabel(task)"
        :key="tasksStore.pickerRefreshCount"
        use-input
        hide-selected
        fill-input
        @filter="filterTasksByName"
        outlined
        :style="{
          backgroundColor: tasksStore.generateBackgroundColor(
            tasksStore.currentTask
          ),
        }"
        @new-value="createAndSelectNewTask"
      >
        <template v-slot:prepend>
          <TasksImgOrIcon :task="tasksStore.currentTask"></TasksImgOrIcon>
        </template>
        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
            :style="{
              backgroundColor: tasksStore.generateBackgroundColor(scope?.opt),
            }"
            style="border-top: 1px solid #3333"
          >
            <TaskDisplay :task="scope.opt"></TaskDisplay>
          </q-item>
        </template>
      </q-select>
      <q-input
        label="description"
        v-model="entriesStore.descriptionForNewEntry"
      >
      </q-input>
      <q-btn
        color="primary"
        @click="entriesStore.endOngoingEntry"
        :disabled="!tasksStore.currentTask"
      >
        end
      </q-btn>
    </div>
    <div
      v-if="entriesStore.ongoingEntry"
      style="display: flex; gap: 1.6em; margin: auto; width: fit-content"
    >
      <EntryTimestamps :entry="entriesStore.ongoingEntry" />
      <div class="entry-duration" style="width: 4em">
        {{ ongoingEntryCurrentTime }}
      </div>
    </div>
    <div class="column q-my-lg q-mx-auto" style="max-width: 300px">
      Settings
      <q-input
        label="day end offset (hours after midnight)"
        type="number"
        dense
        min="0"
        max="23"
        v-model="settingsStore.dayEndOffset"
      />
      <q-checkbox v-model="settingsStore.goOver24WhenOffset"
        >go over 24 when offset
      </q-checkbox>
      <q-checkbox
        v-model="settingsStore.alsoGoOver24WhenMultiDay"
        :disable="!settingsStore.goOver24WhenOffset"
        >also go over 24 when multi day
      </q-checkbox>
    </div>
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
import { computed, Ref, ref, watch } from 'vue';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
import { Task, useTasksStore } from 'stores/tasksStore';
import { Entry, useEntriesStore } from 'stores/entriesStore';
import TaskDisplay from 'components/TaskDisplay.vue';
import EntryTimestamps from 'components/EntryTimestamps.vue';
import EntryDescription from 'components/EntryDescription.vue';
import SupabasePlayground from 'components/AuthComponent.vue';
import { useAuthStore } from 'stores/authStore';
import { useSettingsStore } from 'stores/settingsStore';
import {
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
  SECONDS_IN_HOUR,
  MINUTES_IN_HOUR,
} from 'src/helpers/timeHelpers';
import TaskEditForm from 'components/TaskEditForm.vue';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();
const settingsStore = useSettingsStore();

const filteredTasks: Ref<Task[]> = ref([]);

function filterTasksByName(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredTasks.value = tasksStore.tasks.filter((task) =>
      tasksStore.generateLabel(task).toLowerCase().includes(needle)
    );
  });
}

function formatDuration(duration: number) {
  const durationSeconds = duration / MILLISECONDS_IN_SECOND;
  const secondsPart = Math.floor(durationSeconds % SECONDS_IN_MINUTE);
  const minutesPart = Math.floor(
    (durationSeconds / SECONDS_IN_MINUTE) % MINUTES_IN_HOUR
  );
  const hoursPart = Math.floor(durationSeconds / SECONDS_IN_HOUR);
  return `${hoursPart < 10 ? '0' : ''}${hoursPart}:${
    minutesPart < 10 ? '0' : ''
  }${minutesPart}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
}

function getTimestampDifferenceString(later: number, earlier: number): string {
  return formatDuration(later - earlier);
}

function createAndSelectNewTask(pullPath: string) {
  const newTask = tasksStore.createAndStartNewTaskByPath(pullPath);
  tasksStore.handleCurrentTaskChange(newTask);
}

const ongoingEntryCurrentTime = ref('-');

function updateOngoingEntryCurrentTime() {
  if (entriesStore.ongoingEntry) {
    ongoingEntryCurrentTime.value = getTimestampDifferenceString(
      Date.now(),
      entriesStore.ongoingEntry.startTime
    );
  } else {
    ongoingEntryCurrentTime.value = '-';
  }
}

setInterval(() => {
  updateOngoingEntryCurrentTime();
}, 100);

watch(
  () => entriesStore?.ongoingEntry?.startTime,
  updateOngoingEntryCurrentTime
);

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
.current-entry {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin: 32px auto;
  width: fit-content;

  @media (width >= 500px) {
    flex-direction: row;
  }
}

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
