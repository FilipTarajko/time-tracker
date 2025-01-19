<script setup lang="ts">
import TaskDisplay from 'components/TaskDisplay.vue';
import { useTasksStore } from 'stores/tasksStore';

const tasksStore = useTasksStore();
</script>

<template>
  <q-dialog
    v-if="tasksStore.taskForDeletionConfirmation"
    v-model="tasksStore.doesTaskForDeletionConfirmationExist"
  >
    <q-card class="q-pa-lg" style="width: fit-content">
      <div class="q-mb-lg">
        Are you sure? This will permanently delete the task.
        <q-item
          :style="{
            backgroundColor: tasksStore.generateBackgroundColor(
              tasksStore.taskForDeletionConfirmation
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
              :task="tasksStore.taskForDeletionConfirmation"
            ></TaskDisplay>
          </div>
        </q-item>
      </div>
      <q-btn color="warning" v-close-popup class="q-mr-md">cancel</q-btn>
      <q-btn
        color="red"
        @click="tasksStore.deleteTask(tasksStore.taskForDeletionConfirmation)"
        v-close-popup
        >delete task
      </q-btn>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
