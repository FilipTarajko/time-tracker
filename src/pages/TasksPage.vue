<script setup lang="ts">
import { useTasksStore } from 'stores/tasksStore';
import TaskDisplay from 'components/TaskDisplay.vue';
import TaskEditDialog from 'components/TaskEditDialog.vue';
import TaskDeletionConfirmationDialog from 'components/TaskDeletionConfirmationDialog.vue';
import { useEntriesStore } from 'stores/entriesStore';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();
</script>

<template>
  <div style="width: fit-content; margin: 0 auto">
    <div
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
      <!--      TODO: make order consistent, or add sorting options -->
      <template v-for="task in tasksStore.tasks" :key="task.id">
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
        <div>
          {{
            entriesStore.entries.filter((entry) => entry.taskId === task.id)
              .length
          }}
        </div>
        <div>
          {{
            tasksStore.tasks.filter(
              (testedTask) => testedTask.parentTaskId === task.id
            ).length
          }}
        </div>
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
  </div>
  <TaskEditDialog />
  <TaskDeletionConfirmationDialog />
</template>

<style scoped lang="scss"></style>
