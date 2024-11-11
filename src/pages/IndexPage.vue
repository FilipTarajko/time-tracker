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
  <q-list>
    <q-item
      v-for="entry in entriesStore.finishedEntries"
      :key="entry.id"
      :style="{
        backgroundColor: tasksStore.generateBackgroundColor(
          tasksStore.getTaskById(entry.taskId)
        ),
      }"
      style="
        border: 1px solid #3333;
        display: grid;
        grid-template-columns: 1fr 2fr auto;
      "
      class="q-mt-sm"
    >
      <div style="width: auto">
        {{ entry.description }}
      </div>
      <TaskDisplay :task="tasksStore.getTaskById(entry.taskId)"></TaskDisplay>
      <div style="display: grid; grid-template-columns: 6em 1.6em 4em">
        <div>
          {{ date.formatDate(entry.startTime, 'HH:mm') }}
          - {{ date.formatDate(entry.endTime, 'HH:mm') }}
        </div>
        <div></div>
        <div>
          {{ getTimestampDifferenceString(entry.endTime!, entry.startTime) }}
        </div>
      </div>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
import { Task, useTasksStore } from 'stores/tasksStore';
import { useEntriesStore } from 'stores/entriesStore';
import TaskDisplay from 'components/TaskDisplay.vue';
import { date } from 'quasar';

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

function getTimestampDifferenceString(later: number, earlier: number): string {
  const secondsDifference = (later - earlier) / 1000;
  const secondsPart = Math.floor(secondsDifference % 60);
  const minutesPart = Math.floor((secondsDifference / 60) % 60);
  const hoursPart = Math.floor(secondsDifference / 3600);
  return `${hoursPart < 10 ? '0' : ''}${hoursPart}:${
    minutesPart < 10 ? '0' : ''
  }${minutesPart}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
}

defineOptions({
  name: 'IndexPage',
});
</script>
