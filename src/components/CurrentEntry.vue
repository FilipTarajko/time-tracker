<template>
  <div>
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
        @new-value="tasksStore.createAndSelectNewTask"
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
        debounce="300"
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
  </div>
</template>
<script setup lang="ts">
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
import TaskDisplay from 'components/TaskDisplay.vue';
import { useEntriesStore } from 'stores/entriesStore';
import { Task, useTasksStore } from 'stores/tasksStore';
import { ref, Ref, watch } from 'vue';
import EntryTimestamps from 'components/EntryTimestamps.vue';
import { getTimestampDifferenceString } from 'src/helpers/timeHelpers';

const entriesStore = useEntriesStore();
const tasksStore = useTasksStore();

const filteredTasks: Ref<Task[]> = ref([]);

function filterTasksByName(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredTasks.value = tasksStore.tasks.filter((task) =>
      tasksStore.generateLabel(task).toLowerCase().includes(needle)
    );
  });
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
</style>
