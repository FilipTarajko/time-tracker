<script setup lang="ts">
import { Task, useTasksStore } from 'stores/tasksStore';
import TaskDisplay from 'components/TaskDisplay.vue';
import { useEntriesStore } from 'stores/entriesStore';
import { computed, ref } from 'vue';
import { formatDuration } from 'src/helpers/timeHelpers';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();

const props = defineProps<{
  filterByParentTask?: Task;
}>();

const MARGIN_PIXELS_PER_NESTING_LEVEL = 12;

const displayByHierarchy = ref(true);
const displayTotalTimes = ref(true);

const tasksToDisplay = computed(() => {
  const result = tasksStore.tasks.filter(
    (t) =>
      !props.filterByParentTask ||
      t.parentTaskId === props.filterByParentTask.id
  );

  if (displayByHierarchy.value) {
    result.sort((task1: Task, task2: Task) =>
      tasksStore.generateLabel(task1) > tasksStore.generateLabel(task2) ? 1 : -1
    );
  }

  return result;
});

const currentMarginPixelsPerNestingLevel = computed(() =>
  displayByHierarchy.value && !props.filterByParentTask
    ? MARGIN_PIXELS_PER_NESTING_LEVEL
    : 0
);

function totalTimeOfTaskEntries(task: Task) {
  return formatDuration(
    entriesStore.entries
      .filter((entry) => entry.taskId === task.id)
      .map((entry) => (entry?.endTime ?? Date.now()) - entry.startTime)
      .reduce((taskDuration, entryDuration) => taskDuration + entryDuration, 0)
  );
}

function totalTimeOfTaskAndDescendantsEntries(task: Task) {
  return formatDuration(
    entriesStore.entries
      .filter((entry) =>
        tasksStore.doesDependOn(
          tasksStore.getTaskById(entry.taskId),
          tasksStore.getTaskById(task.id)
        )
      )
      .map((entry) => (entry?.endTime ?? Date.now()) - entry.startTime)
      .reduce((taskDuration, entryDuration) => taskDuration + entryDuration, 0)
  );
}

function doesTaskHaveOngoingEntry(task: Task) {
  return entriesStore.entries
    .filter((entry) => entry.taskId === task.id)
    .some((entry) => entry.endTime == null);
}

function doesTaskOrDescendantHaveOngoingEntry(task: Task) {
  return entriesStore.entries
    .filter((entry) =>
      tasksStore.doesDependOn(
        tasksStore.getTaskById(entry.taskId),
        tasksStore.getTaskById(task.id)
      )
    )
    .some((entry) => entry.endTime == null);
}

function doesTaskHaveEntriesOrAncestors(task: Task) {
  return (
    entriesStore.entries.filter((entry) => entry.taskId === task.id).length ||
    tasksStore.tasks.filter((testedTask) => testedTask.parentTaskId === task.id)
      .length
  );
}
</script>

<template>
  <div>
    <div style="width: fit-content; margin: auto auto 20px">
      <q-toggle v-model="displayByHierarchy">display by hierarchy</q-toggle>
      <br />
      <q-toggle v-model="displayTotalTimes">display total times</q-toggle>
    </div>
    <div
      class="q-mt-md"
      style="
        display: grid;
        align-items: center;
        justify-items: end;
        gap: 0 20px;
        margin-left: 36px;
      "
      :style="`
        grid-template-columns: repeat(${4 + (displayTotalTimes ? 2 : 0)}, auto);
        margin-left: ${
          tasksStore.highestNumberOfAncestors *
          currentMarginPixelsPerNestingLevel
        }px`"
    >
      <div style="text-align: center; width: 100%">task</div>
      <div style="text-align: center; width: 100%">entries</div>
      <div style="text-align: center; width: 100%">child tasks</div>
      <template v-if="displayTotalTimes">
        <div style="text-align: center; width: 100%">
          total time
          <br />
          (without descendants)
        </div>
        <div style="text-align: center; width: 100%">
          total time
          <br />
          (with descendants)
        </div>
      </template>

      <div style="text-align: center; width: 100%">delete or merge</div>
      <template v-for="task in tasksToDisplay" :key="task.id">
        <div
          :style="`width: calc(100% - ${
            (tasksStore.getNumberOfAncestors(task) -
              tasksStore.highestNumberOfAncestors) *
            currentMarginPixelsPerNestingLevel
          }px)`"
        >
          <q-item
            :style="{
              backgroundColor: tasksStore.generateBackgroundColor(
                tasksStore.getTaskById(task.id)
              ),
            }"
            style="border: 1px solid #3333; width: 100%"
            class="q-mt-sm"
          >
            <TaskDisplay
              :task="tasksStore.getTaskById(task.id)"
              @openTaskEditing="tasksStore.editedTaskId = task.id"
            ></TaskDisplay>
          </q-item>
        </div>
        <q-btn
          padding="0"
          style="width: 5ch"
          color="primary"
          @click="tasksStore.taskForFilteredEntriesList = task"
          :disabled="
            !entriesStore.entries.filter((entry) => entry.taskId === task.id)
              .length
          "
        >
          {{
            entriesStore.entries.filter((entry) => entry.taskId === task.id)
              .length
          }}
        </q-btn>
        <q-btn
          padding="0"
          style="width: 5ch"
          color="primary"
          @click="tasksStore.taskForFilteredTasksList = task"
          :disabled="
            !tasksStore.tasks.filter(
              (testedTask) => testedTask.parentTaskId === task.id
            ).length
          "
        >
          {{
            tasksStore.tasks.filter(
              (testedTask) => testedTask.parentTaskId === task.id
            ).length
          }}
        </q-btn>
        <template v-if="displayTotalTimes">
          <div
            style="justify-self: center; align-self: center"
            :style="{ color: doesTaskHaveOngoingEntry(task) ? 'red' : '' }"
          >
            {{ totalTimeOfTaskEntries(task) }}
          </div>
          <div
            style="justify-self: center; align-self: center"
            :style="{
              color: doesTaskOrDescendantHaveOngoingEntry(task) ? 'red' : '',
            }"
          >
            {{ totalTimeOfTaskAndDescendantsEntries(task) }}
          </div>
        </template>
        <div style="justify-self: center; align-self: center">
          <q-btn
            v-if="doesTaskHaveEntriesOrAncestors(task)"
            @click="tasksStore.taskForMerging = task"
            flat
            round
            color="orange"
            size="10px"
            icon="merge"
          />
          <q-btn
            v-else
            @click="tasksStore.taskForDeletionConfirmation = task"
            flat
            round
            color="red"
            size="10px"
            icon="delete"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
