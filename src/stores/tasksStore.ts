import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { supabase } from 'src/lib/supabaseClient';
import { useEntriesStore } from 'stores/entriesStore';
import { Notify } from 'quasar';

export interface Task {
  dbid?: string;
  id: number; // TODO: change from autoincrement to uuid
  name: string;
  parentTaskId?: number;
  icon?: string;
  imageSrc?: string;
  color?: string;
  // TODO: add last_edited
}

// TODO: add actions and ui for editing tasks

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>(
    []
    // [
    // {
    //   id: 1,
    //   name: 'IT',
    //   // icon: 'terminal',
    //   icon: 'mdi-code-json',
    //   color: '#0066ff',
    // },
    // {
    //   id: 2,
    //   name: 'JavaScript',
    //   parentTaskId: 1,
    //   imageSrc:
    //     'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    //   color: '#ffcc00',
    // },
    // {
    //   id: 3,
    //   name: 'CSS',
    //   parentTaskId: 1,
    //   imageSrc:
    //     'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    //   color: '#0000ff',
    // },
    // {
    //   id: 4,
    //   name: 'Vue',
    //   parentTaskId: 2,
    //   imageSrc:
    //     'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg',
    //   color: '#00ff00',
    // },
    // {
    //   id: 5,
    //   name: 'Quasar',
    //   parentTaskId: 4,
    //   imageSrc:
    //     'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/quasar/quasar-original.svg',
    //   color: '#0055ff',
    // },
    // {
    //   id: 6,
    //   name: 'Nuxt',
    //   parentTaskId: 4,
    //   imageSrc:
    //     'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg',
    //   color: '#00cc00',
    // },
    // {
    //   id: 7,
    //   name: 'Gamedev',
    //   parentTaskId: 1,
    //   icon: 'sports_esports',
    //   color: '#000055',
    // },
    // {
    //   id: 8,
    //   name: 'Godot',
    //   parentTaskId: 7,
    //   imageSrc:
    //     'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/godot/godot-original.svg',
    //   color: '#33aaff',
    // },
    // {
    //   id: 9,
    //   name: 'Languages',
    //   icon: 'translate',
    //   color: '#0c5050',
    // },
    // {
    //   id: 10,
    //   name: 'Dutch',
    //   parentTaskId: 9,
    //   // icon: 'fa-solid fa-fan'
    //   icon: 'mdi-flower-tulip',
    //   color: '#ff8800',
    // },
    // {
    //   id: 11,
    //   name: 'Unity',
    //   parentTaskId: 7,
    //   imageSrc:
    //     'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unity/unity-plain.svg',
    //   color: '#000000',
    // },
    // ]
  );

  const idToTaskMap = computed(() => {
    const result = new Map();
    for (const task of tasks.value) {
      result.set(task.id, task);
    }
    return result;
  });

  const currentTask = computed<Task | undefined>({
    get() {
      const currentEntry = useEntriesStore().entries.find(
        (entry) => entry.endTime == null
      );

      if (!currentEntry) {
        return undefined;
      }

      return getTaskById(currentEntry.taskId);
    },
    set(task: Task | undefined) {
      if (task) {
        handleCurrentTaskChange(task);
      } else {
        console.error('oops'); // TODO: handle
      }
    },
  });

  function getTaskById(id: number) {
    return idToTaskMap.value.get(id);
  }

  function generateLabel(originalTask: Task): string {
    let traversedTask = originalTask;
    const result = [traversedTask.name];
    while (traversedTask.parentTaskId) {
      traversedTask = tasks.value.find(
        (task) => task.id === traversedTask.parentTaskId
      )!;
      result.push(traversedTask.name);
    }
    return result.reverse().join('::');
  }

  function generateBackgroundColor(task?: Task): string | null {
    return (task?.color ?? '#ffffff') + '16';
  }

  function createNewTask(name: string, parentTaskId: number | undefined) {
    const newTask = {
      id: (tasks.value.at(-1)?.id ?? 0) + 1,
      parentTaskId,
      name,
      color: '#ffffff',
    };

    tasks.value.push(newTask);
    upsertTask(newTask);

    return newTask;
  }

  function createAndStartNewTaskByPath(fullPath: string) {
    const names = fullPath.split('::');
    let parentTaskId: number | undefined = undefined;
    let resultTask: Task | undefined = undefined;

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const matchedTask = tasks.value.find(
        (task) =>
          task.name.toLowerCase() === name.toLowerCase() &&
          task.parentTaskId === parentTaskId
      );

      resultTask = matchedTask ?? createNewTask(name, parentTaskId);
      parentTaskId = resultTask.id;
    }

    return resultTask!;
  }

  async function initFromSupabase() {
    const { data } = await supabase.from('tasks').select();
    tasks.value = (data as Task[]).sort((a, b) => a.id - b.id);
  }

  function handleCurrentTaskChange(task: Task) {
    useEntriesStore().startNewEntry(task.id);
  }

  async function upsertTask(task: Task) {
    // TODO: automatically upsert all edited after last sync?

    const { data, error } = await supabase
      .from('tasks')
      .upsert(task)
      .select();

    if (error) {
      Notify.create({ message: error.message, type: 'negative' });
      return;
    }

    Notify.create({ message: 'Upserted tasks', type: 'positive' });
    task.dbid = data[0].dbid;
  }

  return {
    tasks,
    getTaskById,
    generateLabel,
    generateBackgroundColor,
    createAndStartNewTaskByPath,
    initFromSupabase,
    currentTask,
    handleCurrentTaskChange,
  };
});
