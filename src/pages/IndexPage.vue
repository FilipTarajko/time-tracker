<template>
  Current: {{ currentTimerName }}
  <q-select
    v-model="currentTimerName"
    :options="filteredTasks"
    :option-label="(task) => generateLabel(task)"
    use-input
    hide-selected
    fill-input
    @filter="filterTasksByName"
    outlined
  ></q-select>
  <!--  TODO: https://quasar.dev/vue-components/select#customizing-menu-options -->
</template>

<script setup lang="ts">
import { reactive, Ref, ref } from 'vue';

const currentTimerName = ref('');

function generateLabel(originalTask: Task): string {
  let currentTask = originalTask;
  const result = [currentTask.name];
  while (currentTask.parentTaskId) {
    currentTask = tasks.find(task => task.id === currentTask.parentTaskId)!;
    result.push(currentTask.name);
  }
  return result.reverse().join('::');
}

const filteredTasks: Ref<Task[]> = ref([]);

function filterTasksByName (val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    filteredTasks.value = tasks.filter(task => generateLabel(task).toLowerCase().includes(needle))
  })
}

defineOptions({
  name: 'IndexPage',
});

interface Task {
  id: number;
  name: string;
  parentTaskId?: number;
}

const tasks: Task[] = reactive([
  {
    id: 1,
    name: 'IT',
  },
  {
    id: 2,
    name: 'JavaScript',
    parentTaskId: 1,
  },
  {
    id: 3,
    name: 'CSS',
    parentTaskId: 1,
  },
  {
    id: 4,
    name: 'Vue',
    parentTaskId: 2,
  },
  {
    id: 5,
    name: 'Quasar',
    parentTaskId: 4,
  },
  {
    id: 6,
    name: 'Nuxt',
    parentTaskId: 4,
  },
]);
</script>
