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
  >
    <template v-slot:prepend>
      <TasksImgOrIcon :task="currentTask"></TasksImgOrIcon>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
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
</template>

<script setup lang="ts">
import { reactive, Ref, ref } from 'vue';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';

const currentTask = ref<Task | null>(null);

function generateLabel(originalTask: Task): string {
  let currentTask = originalTask;
  const result = [currentTask.name];
  while (currentTask.parentTaskId) {
    currentTask = tasks.find((task) => task.id === currentTask.parentTaskId)!;
    result.push(currentTask.name);
  }
  return result.reverse().join('::');
}

const filteredTasks: Ref<Task[]> = ref([]);

function filterTasksByName(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredTasks.value = tasks.filter((task) =>
      generateLabel(task).toLowerCase().includes(needle)
    );
  });
}

defineOptions({
  name: 'IndexPage',
});

export interface Task {
  id: number;
  name: string;
  parentTaskId?: number;
  icon?: string;
  imageSrc?: string;
}

const tasks: Task[] = reactive([
  {
    id: 1,
    name: 'IT',
    // icon: 'terminal',
    icon: 'mdi-code-json',
  },
  {
    id: 2,
    name: 'JavaScript',
    parentTaskId: 1,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
  },
  {
    id: 3,
    name: 'CSS',
    parentTaskId: 1,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
  },
  {
    id: 4,
    name: 'Vue',
    parentTaskId: 2,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg',
  },
  {
    id: 5,
    name: 'Quasar',
    parentTaskId: 4,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/quasar/quasar-original.svg',
  },
  {
    id: 6,
    name: 'Nuxt',
    parentTaskId: 4,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg',
  },
  {
    id: 7,
    name: 'Gamedev',
    parentTaskId: 1,
    icon: 'sports_esports',
  },
  {
    id: 8,
    name: 'Godot',
    parentTaskId: 7,
    imageSrc: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/godot/godot-original.svg',
  },
  {
    id: 9,
    name: 'Languages',
    icon: 'translate',
  },
  {
    id: 10,
    name: 'Dutch',
    parentTaskId: 9,
    // icon: 'fa-solid fa-fan'
    icon: 'mdi-flower-tulip'
  },
]);
</script>
