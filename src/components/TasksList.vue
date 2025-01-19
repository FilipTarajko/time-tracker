<script setup lang="ts">
import { Task, useTasksStore } from 'stores/tasksStore';
import TaskDisplay from 'components/TaskDisplay.vue';
import { useEntriesStore } from 'stores/entriesStore';
import { computed } from 'vue';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();

const props = defineProps<{
  filterByParentTask?: Task;
}>();

const tasksToDisplay = computed(() => {
  return tasksStore.tasks.filter(
    (t) =>
      !props.filterByParentTask ||
      t.parentTaskId === props.filterByParentTask.id
  );
});
</script>

<template>
  <div
    class="q-mt-md"
    style="
      display: grid;
      grid-template-columns: repeat(4, auto);
      align-items: center;
      justify-items: end;
      gap: 0 20px;
    "
  >
    <div style="text-align: center; width: 100%">task</div>
    <div style="text-align: center; width: 100%">entries</div>
    <div style="text-align: center; width: 100%">child tasks</div>
    <div style="text-align: center; width: 100%">delete</div>
    <template v-for="task in tasksToDisplay" :key="task.id">
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
      <div style="justify-self: center; align-self: center">
        <q-btn
          :disabled="
            entriesStore.entries.filter((entry) => entry.taskId === task.id)
              .length ||
            tasksStore.tasks.filter(
              (testedTask) => testedTask.parentTaskId === task.id
            ).length
          "
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
</template>

<style scoped lang="scss"></style>
