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
  color?: string;
}

const tasks: Task[] = reactive([
  {
    id: 1,
    name: 'IT',
    // icon: 'terminal',
    icon: 'mdi-code-json',
    color: '#0066ff',
  },
  {
    id: 2,
    name: 'JavaScript',
    parentTaskId: 1,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    color: '#ffcc00',
  },
  {
    id: 3,
    name: 'CSS',
    parentTaskId: 1,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    color: '#0000ff',
  },
  {
    id: 4,
    name: 'Vue',
    parentTaskId: 2,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg',
    color: '#00ff00',
  },
  {
    id: 5,
    name: 'Quasar',
    parentTaskId: 4,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/quasar/quasar-original.svg',
    color: '#0055ff',
  },
  {
    id: 6,
    name: 'Nuxt',
    parentTaskId: 4,
    imageSrc:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg',
    color: '#00cc00',
  },
  {
    id: 7,
    name: 'Gamedev',
    parentTaskId: 1,
    icon: 'sports_esports',
    color: '#000055',
  },
  {
    id: 8,
    name: 'Godot',
    parentTaskId: 7,
    imageSrc: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/godot/godot-original.svg',
    color: '#33aaff',
  },
  {
    id: 9,
    name: 'Languages',
    icon: 'translate',
    color: '#0c5050',
  },
  {
    id: 10,
    name: 'Dutch',
    parentTaskId: 9,
    // icon: 'fa-solid fa-fan'
    icon: 'mdi-flower-tulip',
    color: '#ff8800',
  },
  {
    id: 11,
    name: 'Unity',
    parentTaskId: 7,
    imageSrc: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unity/unity-plain.svg',
    color: '#000000',
  },
]);
</script>
