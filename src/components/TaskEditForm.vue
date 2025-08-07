<script setup lang="ts">
import { useTasksStore } from 'stores/tasksStore';
import { ref, Ref, watch } from 'vue';
import TaskDisplay from 'components/TaskDisplay.vue';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';

const props = defineProps<{
  editedTaskId: string;
}>();

const tasksStore = useTasksStore();

const editedTask = tasksStore.getTaskById(props.editedTaskId);

let editedTaskBeforeChanges = JSON.stringify(editedTask);

function revertChanges() {
  const previousState = JSON.parse(editedTaskBeforeChanges);
  editedTask.name = previousState.name;
  editedTask.parentTaskId = previousState.parentTaskId;
  editedTask.color = previousState.color;
  editedTask.icon = previousState.icon;
  editedTask.imageSrc = previousState.imageSrc;
}

const filteredTaskIds: Ref<string[]> = ref([]);

function filterTasksByNameAndNotDependingOnEditedTask(
  val: string,
  update: (cb: () => void) => void
) {
  update(() => {
    const needle = val.toLowerCase();
    filteredTaskIds.value = tasksStore.tasks
      .filter((task) =>
        tasksStore.generateLabel(task).toLowerCase().includes(needle)
      )
      .filter((task) => !tasksStore.doesDependOn(task, editedTask))
      .map((task) => task.id);
  });
}

watch(
  () => [editedTask.name, editedTask.parentTaskId],
  () => {
    tasksStore.pickerRefreshCount++;
  }
);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <q-input outlined v-model="editedTask.name" label="name" />
    <q-select
      clearable
      v-model="editedTask.parentTaskId"
      :option-label="
        (id) => tasksStore.generateLabel(tasksStore.getTaskById(id))
      "
      use-input
      hide-selected
      fill-input
      :options="filteredTaskIds"
      @filter="filterTasksByNameAndNotDependingOnEditedTask"
      outlined
      :style="{
        backgroundColor: tasksStore.generateBackgroundColor(
          editedTask?.parentTaskId &&
            tasksStore.getTaskById(editedTask?.parentTaskId)
        ),
      }"
    >
      <template v-slot:prepend v-if="editedTask?.parentTaskId">
        <TasksImgOrIcon
          :task="tasksStore.getTaskById(editedTask.parentTaskId)"
        ></TasksImgOrIcon>
      </template>
      <template v-slot:option="scope">
        <q-item
          v-bind="scope.itemProps"
          :style="{
            backgroundColor: tasksStore.generateBackgroundColor(
              tasksStore.getTaskById(scope?.opt)
            ),
          }"
          style="border-top: 1px solid #3333"
        >
          <TaskDisplay :task="tasksStore.getTaskById(scope.opt)"></TaskDisplay>
        </q-item>
      </template>
    </q-select>
    <q-color v-model="editedTask.color" class="my-picker" />
    <q-input outlined v-model="editedTask.icon" label="icon">
      <template v-slot:label>
        <!-- TODO: add more info from or a link to https://quasar.dev/vue-components/icon#webfont-usage -->
        <div class="row items-center all-pointer-events">
          icon
          <q-icon
            class="q-ml-xs"
            color="primary"
            name="fa-regular fa-circle-question"
          />
          <q-tooltip anchor="top left" self="bottom left">
            eg:
            <br />
            mdi-run
            <br />
            fa fa-dumbbell
            <br />
            book
          </q-tooltip>
        </div>
      </template>
    </q-input>
    <q-input outlined v-model="editedTask.imageSrc" label="image src" />
  </div>
  <div class="q-mt-md">before</div>
  <q-item
    :style="{
      backgroundColor: tasksStore.generateBackgroundColor(
        JSON.parse(editedTaskBeforeChanges)
      ),
    }"
    style="border: 1px solid #3333"
    class="q-mt-sm"
  >
    <TaskDisplay :task="JSON.parse(editedTaskBeforeChanges)"></TaskDisplay>
  </q-item>
  <div class="q-mt-md q-mb">after</div>
  <q-item
    :style="{
      backgroundColor: tasksStore.generateBackgroundColor(editedTask),
    }"
    style="border: 1px solid #3333"
    class="q-mt-sm"
  >
    <TaskDisplay :task="editedTask"></TaskDisplay>
  </q-item>
  <div style="margin: 16px auto 0">
    <q-btn class="q-mr-md" @click="revertChanges" color="warning" v-close-popup
      >cancel
    </q-btn>
    <q-btn
      color="primary"
      @click="tasksStore.upsertTask(editedTask)"
      v-close-popup
      >save
    </q-btn>
  </div>
</template>
