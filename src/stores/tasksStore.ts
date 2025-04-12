import { defineStore } from 'pinia';
import { computed, Ref, ref } from 'vue';
import { supabase } from 'src/lib/supabaseClient';
import { useEntriesStore } from 'stores/entriesStore';
import { Notify } from 'quasar';

const TASK_COLOR_OPACITY_HEX = '16';

export interface Task {
  dbid?: string;
  id: string;
  name: string;
  parentTaskId?: string;
  icon?: string;
  imageSrc?: string;
  color?: string;
  defaultDescription?: string;
  // TODO: add last_edited
}

// TODO: add actions and ui for editing tasks

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const pickerRefreshCount = ref(0);

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

  function getTaskById(id: string) {
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

  function getNumberOfAncestors(originalTask: Task): number {
    let traversedTask = originalTask;
    let result = 0;
    while (traversedTask.parentTaskId) {
      traversedTask = tasks.value.find(
        (task) => task.id === traversedTask.parentTaskId
      )!;
      result++;
    }
    return result;
  }

  function generateBackgroundColor(task?: Task): string | null {
    return (task?.color ?? '#ffffff') + TASK_COLOR_OPACITY_HEX;
  }

  function createNewTask(name: string, parentTaskId: string | undefined) {
    const newTask = {
      id: crypto.randomUUID(),
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
    let parentTaskId: string | undefined = undefined;
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
    tasks.value = data as Task[];
  }

  function handleCurrentTaskChange(task: Task) {
    useEntriesStore().startNewEntry(task.id);
  }

  async function upsertTask(task: Task) {
    // TODO: automatically upsert all edited after last sync?

    const { data, error } = await supabase.from('tasks').upsert(task).select();

    if (error) {
      Notify.create({ message: error.message, type: 'negative' });
      return;
    }

    Notify.create({ message: 'Upserted tasks', type: 'positive' });
    task.dbid = data[0].dbid;
  }

  function doesDependOn(checkedTask: Task, potentialAncestor: Task): boolean {
    let traversedTask = checkedTask;
    while (true) {
      if (potentialAncestor.id == traversedTask.id) {
        return true;
      }

      if (!traversedTask.parentTaskId) {
        return false;
      }

      traversedTask = getTaskById(traversedTask.parentTaskId);
    }
  }

  const tasksList = computed<Task[]>(() => {
    // TODO: wouldn't it be better to count by grouping all entries instead?
    const sortedTasks = tasks.value.toSorted(
      (a, b) =>
        useEntriesStore().countEntriesByTask(b) -
        useEntriesStore().countEntriesByTask(a)
    );
    return sortedTasks.slice(0, 6);
  });

  function createAndSelectNewTask(pullPath: string) {
    const newTask = createAndStartNewTaskByPath(pullPath);
    handleCurrentTaskChange(newTask);
  }

  const editedTaskId: Ref<string | null> = ref(null);
  const isTaskBeingEdited = computed({
    get() {
      return editedTaskId.value !== null;
    },
    set(x) {
      if (!x) {
        editedTaskId.value = null;
      }
    },
  });

  const taskForDeletionConfirmation: Ref<Task | null> = ref(null);
  const doesTaskForDeletionConfirmationExist = computed({
    get() {
      return taskForDeletionConfirmation.value !== null;
    },
    set(x) {
      if (!x) {
        taskForDeletionConfirmation.value = null;
      }
    },
  });

  async function deleteTask(task: Task) {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('dbid', task.dbid)
      .select();

    if (error) {
      Notify.create({ message: error.message, type: 'negative' });
      return;
    }

    Notify.create({ message: 'Deleted task', type: 'positive' });
    tasks.value = tasks.value.filter((t) => t.dbid != data[0].dbid);
  }

  const taskForFilteredEntriesList: Ref<Task | null> = ref(null);
  const doesTaskForFilteredEntriesListExist = computed({
    get() {
      return taskForFilteredEntriesList.value !== null;
    },
    set(x) {
      if (!x) {
        taskForFilteredEntriesList.value = null;
      }
    },
  });

  const taskForFilteredTasksList: Ref<Task | null> = ref(null);
  const doesTaskForFilteredTasksListExist = computed({
    get() {
      return taskForFilteredTasksList.value !== null;
    },
    set(x) {
      if (!x) {
        taskForFilteredTasksList.value = null;
      }
    },
  });

  const highestNumberOfAncestors = computed(() => {
    return Math.max(...tasks.value.map((task) => getNumberOfAncestors(task)));
  });

  return {
    tasks,
    getTaskById,
    generateLabel,
    generateBackgroundColor,
    createAndStartNewTaskByPath,
    initFromSupabase,
    currentTask,
    handleCurrentTaskChange,
    upsertTask,
    pickerRefreshCount,
    doesDependOn,
    tasksList,
    createAndSelectNewTask,
    editedTaskId,
    isTaskBeingEdited,
    taskForDeletionConfirmation,
    doesTaskForDeletionConfirmationExist,
    deleteTask,
    taskForFilteredEntriesList,
    doesTaskForFilteredEntriesListExist,
    taskForFilteredTasksList,
    doesTaskForFilteredTasksListExist,
    getNumberOfAncestors,
    highestNumberOfAncestors,
  };
});
