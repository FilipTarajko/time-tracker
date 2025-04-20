import { defineStore } from 'pinia';
import { computed, Ref, ref } from 'vue';
import { supabase } from 'src/lib/supabaseClient';
import { useEntriesStore } from 'stores/entriesStore';
import { Notify } from 'quasar';

const TASK_NESTING_INDICATOR = '::';
const TASK_COLOR_OPACITY_HEX = '16';

export interface Task {
  dbid?: string;
  id: string;
  name: string;
  parentTaskId: string | null;
  icon?: string;
  imageSrc?: string;
  color?: string;
  defaultDescription?: string;
  updated_at?: string;
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
    return result.reverse().join(TASK_NESTING_INDICATOR);
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

  function createNewTask(name: string, parentTaskId: string | null = null) {
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

  function findOrCreateTaskByName(name: string) {
    let matchedTask = tasks.value.find(
      (task) =>
        task.name.toLowerCase() === name.toLowerCase() &&
        task.parentTaskId == null
    );

    if (!matchedTask) {
      matchedTask = tasks.value.find(
        (task) => task.name.toLowerCase() === name.toLowerCase()
      );
    }

    return matchedTask ?? createNewTask(name, null);
  }

  function findOrCreateTaskByFullOrPartialPath(fullOrPartialPath: string) {
    const names = fullOrPartialPath.split(TASK_NESTING_INDICATOR);
    let resultTask: Task | null = findOrCreateTaskByName(names[0]);
    let parentTaskId: string = resultTask.id;

    for (let i = 1; i < names.length; i++) {
      const name = names[i];
      const matchedTask = tasks.value.find(
        (task) =>
          task.name.toLowerCase() === name.toLowerCase() &&
          task.parentTaskId == parentTaskId
      );

      resultTask = matchedTask ?? createNewTask(name, parentTaskId);
      parentTaskId = resultTask.id;
    }

    return resultTask!;
  }

  function findOrCreateTaskByNameOrFullOrPartialPath(
    fullOrPartialPathOrName: string
  ) {
    if (!fullOrPartialPathOrName.includes(TASK_NESTING_INDICATOR)) {
      return findOrCreateTaskByName(fullOrPartialPathOrName);
    }

    return findOrCreateTaskByFullOrPartialPath(fullOrPartialPathOrName);
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

  function selectTaskAndCreateIfDoesntExist(pathOrName: string) {
    const newTask = findOrCreateTaskByNameOrFullOrPartialPath(pathOrName);
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

  const taskForMerging: Ref<Task | null> = ref(null);
  const doesTaskForMergingExist = computed({
    get() {
      return taskForMerging.value !== null;
    },
    set(x) {
      if (!x) {
        taskForMerging.value = null;
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

  function changeParentOfTasks(tasks: Task[], newParentTaskId: string) {
    tasks.forEach((task) => {
      task.parentTaskId = newParentTaskId;
      upsertTask(task);
    });
  }

  function mergeTask(taskToMergeFrom: Task, taskToMergeInto: Task) {
    if (taskToMergeFrom === taskToMergeInto) {
      console.log('cannot merge task into itself!');
      return false;
    }

    const entriesOfTaskMergedFrom = useEntriesStore().entries.filter(
      (entry) => entry.taskId === taskToMergeFrom.id
    );
    useEntriesStore().changeTaskOfEntries(
      entriesOfTaskMergedFrom,
      taskToMergeInto.id
    );

    const childrenOfTaskMergedFrom = tasks.value.filter(
      (task) => task.parentTaskId === taskToMergeFrom.id
    );
    changeParentOfTasks(childrenOfTaskMergedFrom, taskToMergeInto.id);

    deleteTask(taskToMergeFrom);
  }

  return {
    tasks,
    getTaskById,
    generateLabel,
    generateBackgroundColor,
    initFromSupabase,
    currentTask,
    handleCurrentTaskChange,
    upsertTask,
    pickerRefreshCount,
    doesDependOn,
    tasksList,
    selectTaskAndCreateIfDoesntExist,
    editedTaskId,
    isTaskBeingEdited,
    taskForDeletionConfirmation,
    doesTaskForDeletionConfirmationExist,
    taskForMerging,
    doesTaskForMergingExist,
    deleteTask,
    taskForFilteredEntriesList,
    doesTaskForFilteredEntriesListExist,
    taskForFilteredTasksList,
    doesTaskForFilteredTasksListExist,
    getNumberOfAncestors,
    highestNumberOfAncestors,
    mergeTask,
  };
});
