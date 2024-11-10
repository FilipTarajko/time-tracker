<template>
  Current: {{ currentTask?.name }}
  <q-select
    v-model="currentTask"
    :options="filteredTasks"
    :option-label="(task) => generateLabel(task)"
    use-input
    hide-selected
    fill-input
    @filter="filterTasksByName"
    outlined
    :style="{backgroundColor: currentTask?.color+'16'}"
    @update:model-value="(task: Task) => handleCurrentTaskChange(task)"
  >
    <template v-slot:prepend>
      <TasksImgOrIcon :task="currentTask"></TasksImgOrIcon>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" :style="{backgroundColor: scope?.opt.color+'16'}" style="border-top: 1px solid #3333;">
        <q-item-section avatar>
          <TasksImgOrIcon :task="scope.opt"></TasksImgOrIcon>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
          <q-item-label v-if="scope.opt.parentTaskId" caption>{{
            generateLabel(scope.opt)
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
  {{ JSON.stringify(entriesStore.entries) }}
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
import { Task, useTasksStore } from 'stores/tasksStore';
import { useEntriesStore } from 'stores/entriesStore';

const tasksStore = useTasksStore();
const entriesStore = useEntriesStore();

const currentTask = ref<Task | null>(null);

function generateLabel(originalTask: Task): string {
  let currentTask = originalTask;
  const result = [currentTask.name];
  while (currentTask.parentTaskId) {
    currentTask = tasksStore.tasks.find((task) => task.id === currentTask.parentTaskId)!;
    result.push(currentTask.name);
  }
  return result.reverse().join('::');
}

const filteredTasks: Ref<Task[]> = ref([]);

function filterTasksByName(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredTasks.value = tasksStore.tasks.filter((task) =>
      generateLabel(task).toLowerCase().includes(needle)
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
