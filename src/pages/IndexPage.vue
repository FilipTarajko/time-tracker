<template>
  Current: {{ currentTask?.name }}
  <q-select
    v-model="currentTask"
    :options="filteredTasks"
    :option-label="(task) => tasksStore.generateLabel(task)"
    use-input
    hide-selected
    fill-input
    @filter="filterTasksByName"
    outlined
    :style="{
      backgroundColor: tasksStore.generateBackgroundColor(currentTask),
    }"
    @update:model-value="(task: Task) => handleCurrentTaskChange(task)"
  >
    <template v-slot:prepend>
      <TasksImgOrIcon :task="currentTask"></TasksImgOrIcon>
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
  {{ JSON.stringify(entriesStore.entries) }}
  <div class="flex column reverse">
    <q-item
      v-for="entry in entriesStore.entries"
      :key="entry.id"
      :style="{
        backgroundColor: tasksStore.generateBackgroundColor(
          tasksStore.getTaskById(entry.taskId)
        ),
      }"
      style="border: 1px solid #3333"
      class="q-mt-sm"
    >
      <TaskDisplay :task="tasksStore.getTaskById(entry.taskId)"></TaskDisplay>
      {{ entry.description }}
    </q-item>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
import { Task, useTasksStore } from 'stores/tasksStore';
import { useEntriesStore } from 'stores/entriesStore';
import TaskDisplay from 'components/TaskDisplay.vue';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();

const currentTask = ref<Task | undefined>(undefined);

const filteredTasks: Ref<Task[]> = ref([]);

function filterTasksByName(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredTasks.value = tasksStore.tasks.filter((task) =>
      tasksStore.generateLabel(task).toLowerCase().includes(needle)
    );
  });
}

function handleCurrentTaskChange(task: Task) {
  entriesStore.startNewEntry(task.id, 'TODO');
}

defineOptions({
  name: 'IndexPage',
});
</script>
