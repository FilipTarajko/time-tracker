import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface Task {
  id: number;
  name: string;
  parentTaskId?: number;
  icon?: string;
  imageSrc?: string;
  color?: string;
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([
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
      imageSrc:
        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/godot/godot-original.svg',
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
      imageSrc:
        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unity/unity-plain.svg',
      color: '#000000',
    },
  ]);

  const idToTaskMap = computed(() => {
    const result = new Map();
    for (const task of tasks.value) {
      result.set(task.id, task);
    }
    return result;
  });

  function getTaskById(id: number) {
    return idToTaskMap.value.get(id);
  }

  function generateLabel(originalTask: Task): string {
    let currentTask = originalTask;
    const result = [currentTask.name];
    while (currentTask.parentTaskId) {
      currentTask = tasks.value.find(
        (task) => task.id === currentTask.parentTaskId
      )!;
      result.push(currentTask.name);
    }
    return result.reverse().join('::');
  }

  function generateBackgroundColor(task?: Task): string | null {
    return task?.color + '16';
  }

  return { tasks, getTaskById, generateLabel, generateBackgroundColor };
});
