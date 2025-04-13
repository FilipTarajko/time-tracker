<script setup lang="ts">
import TaskDisplay from 'components/TaskDisplay.vue';
import { useTasksStore } from 'stores/tasksStore';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
import { Ref, ref, watch } from 'vue';

const tasksStore = useTasksStore();

const idOfTaskToMergeInto = ref(null);

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
      .filter(
        (task) => !tasksStore.doesDependOn(task, tasksStore.taskForMerging!)
      )
      .map((task) => task.id);
  });
}

watch(
  () => tasksStore.doesTaskForMergingExist,
  () => (idOfTaskToMergeInto.value = null)
);
</script>

<template>
  <q-dialog
    v-if="tasksStore.taskForMerging"
    v-model="tasksStore.doesTaskForMergingExist"
  >
    <q-card class="q-pa-lg" style="width: fit-content">
      <div class="q-mb-lg">
        Merging a task will remove this task and move its descendants and
        entries to the selected task.
        <q-item
          :style="{
            backgroundColor: tasksStore.generateBackgroundColor(
              tasksStore.taskForMerging
            ),
          }"
          style="
            border: 1px solid #3333;
            display: grid;
            grid-template-columns: 1fr auto;
            pointer-events: none;
          "
          class="q-mt-sm"
        >
          <div class="description-and-style-container">
            <TaskDisplay :task="tasksStore.taskForMerging"></TaskDisplay>
          </div>
        </q-item>
        <q-select
          class="q-mt-md"
          clearable
          v-model="idOfTaskToMergeInto"
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
              (idOfTaskToMergeInto &&
                tasksStore.getTaskById(idOfTaskToMergeInto)) ??
                undefined
            ),
          }"
        >
          <template v-slot:prepend v-if="idOfTaskToMergeInto">
            <TasksImgOrIcon
              :task="tasksStore.getTaskById(idOfTaskToMergeInto)"
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
              <TaskDisplay
                :task="tasksStore.getTaskById(scope.opt)"
              ></TaskDisplay>
            </q-item>
          </template>
        </q-select>
      </div>

      <q-btn color="warning" v-close-popup class="q-mr-md">cancel</q-btn>
      <q-btn
        color="red"
        :disabled="idOfTaskToMergeInto == null"
        @click="
          idOfTaskToMergeInto &&
            tasksStore.mergeTask(
              tasksStore.taskForMerging,
              tasksStore.getTaskById(idOfTaskToMergeInto)
            )
        "
        v-close-popup
        >merge task
      </q-btn>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
