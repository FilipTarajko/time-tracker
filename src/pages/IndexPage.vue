<template>
  Current: {{ currentTimerName }}
  <q-select
    v-model="currentTimerName"
    :options="tasks"
    :option-label="(task) => generateLabel(task)"
    outlined
  ></q-select>
  <!--  TODO: https://quasar.dev/vue-components/select#customizing-menu-options -->
  <!--  TODO: https://quasar.dev/vue-components/select#example--basic-filtering -->
  <!--  TODO: https://quasar.dev/vue-components/select#example--text-autocomplete -->
  <!--  TODO: https://quasar.dev/vue-components/select#example--selecting-option-after-filtering -->
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const currentTimerName = ref('');

function generateLabel(originalTask: Task): string {
  let currentTask = originalTask;
  const result = [currentTask.name];
  while (currentTask.parentTaskId) {
    currentTask = tasks.find(task => task.id === currentTask.parentTaskId)!;
    result.push(currentTask.name);
  }
  return result.reverse().join(' → ');
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
]);
</script>
