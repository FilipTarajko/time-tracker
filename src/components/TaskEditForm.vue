<script setup lang="ts">
import { useTasksStore } from 'stores/tasksStore';

const props = defineProps<{
  editedTaskId: string;
}>();

const tasksStore = useTasksStore();

const editedTask = tasksStore.getTaskById(props.editedTaskId);

let editedTaskBeforeChanges = JSON.stringify(editedTask);

function revertChanges() {
  const previousState = JSON.parse(editedTaskBeforeChanges);
  editedTask.name = previousState.name;
  editedTask.parentTaskId = previousState.parentTaskId;
  editedTask.color = previousState.color;
  editedTask.icon = previousState.icon;
  editedTask.imageSrc = previousState.imageSrc;
}
</script>

<template>
  <div
    style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px"
  >
    <q-input outlined v-model="editedTask.name" label="name" />
    <!--    TODO: add a select for this -->
    <!--    <q-input v-model="editedTask.parentTaskId" />-->
    <q-color v-model="editedTask.color" class="my-picker" />
    <q-input outlined v-model="editedTask.icon" label="icon" />
    <q-input outlined v-model="editedTask.imageSrc" label="image src" />
  </div>
  <q-btn class="q-mr-md" @click="revertChanges" color="warning" v-close-popup
    >cancel
  </q-btn>
  <q-btn
    color="primary"
    @click="tasksStore.upsertTask(editedTask)"
    v-close-popup
    >save
  </q-btn>
</template>
