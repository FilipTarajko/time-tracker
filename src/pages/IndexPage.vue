<template>
  <Suspense>
    <SupabasePlayground />
  </Suspense>
  <template v-if="useAuthStore().isLoggedIn">
    <div class="current-entry">
      <q-select
        v-model="tasksStore.currentTask"
        :options="filteredTasks"
        :option-label="(task) => tasksStore.generateLabel(task)"
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
        @click="entriesStore.endMostRecentEntryIfOngoing"
        :disabled="!tasksStore.currentTask"
      >
        end
      </q-btn>
    </div>
    <div
      v-for="dateAndEntries in entriesStore.finishedEntriesWithDates"
      :key="dateAndEntries[0]"
    >
      <div style="margin-top: 8px">
        {{ dateAndEntries[0] }}
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
          ></TaskDisplay>
          <EntryDescription :entry />
        </div>
        <div class="timestamps-and-duration-flex">
          <EntryTimestamps :entry />
          <div class="entry-duration" style="width: 4em">
            {{ getTimestampDifferenceString(entry.endTime!, entry.startTime) }}
          </div>
        </div>
      </q-item>
    </div>
  </template>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
import { Task, useTasksStore } from 'stores/tasksStore';
import { useEntriesStore } from 'stores/entriesStore';
import TaskDisplay from 'components/TaskDisplay.vue';
import EntryTimestamps from 'components/EntryTimestamps.vue';
import EntryDescription from 'components/EntryDescription.vue';
import SupabasePlayground from 'components/AuthComponent.vue';
import { useAuthStore } from 'stores/authStore';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();

const filteredTasks: Ref<Task[]> = ref([]);

function filterTasksByName(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredTasks.value = tasksStore.tasks.filter((task) =>
      tasksStore.generateLabel(task).toLowerCase().includes(needle)
    );
  });
}

function getTimestampDifferenceString(later: number, earlier: number): string {
  const secondsDifference = (later - earlier) / 1000;
  const secondsPart = Math.floor(secondsDifference % 60);
  const minutesPart = Math.floor((secondsDifference / 60) % 60);
  const hoursPart = Math.floor(secondsDifference / 3600);
  return `${hoursPart < 10 ? '0' : ''}${hoursPart}:${
    minutesPart < 10 ? '0' : ''
  }${minutesPart}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
}

function createAndSelectNewTask(pullPath: string) {
  const newTask = tasksStore.createAndStartNewTaskByPath(pullPath);
  tasksStore.handleCurrentTaskChange(newTask);
}

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
