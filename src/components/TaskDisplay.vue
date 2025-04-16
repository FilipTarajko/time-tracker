<script setup lang="ts">
import { Task, useTasksStore } from 'stores/tasksStore';
import TasksImgOrIcon from 'components/TasksImgOrIcon.vue';
import { useSettingsStore } from 'stores/settingsStore';

const tasksStore = useTasksStore();
const settingsStore = useSettingsStore();

defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  openTaskEditing: [];
}>();

</script>

<template>
  <div class="flex">
    <q-item-section avatar>
      <TasksImgOrIcon
        :task="task"
        @click="emit('openTaskEditing')"
      ></TasksImgOrIcon>
    </q-item-section>
    <q-item-section>
      <q-item-label @click="emit('openTaskEditing')"
        >{{ task.name }}
      </q-item-label>
      <q-item-label v-if="task.parentTaskId" caption
        >{{ tasksStore.generateLabel(task) }}
      </q-item-label>
      <q-item-label v-if="settingsStore.displayUpdatedAt">
        {{task.updated_at}}
      </q-item-label>
    </q-item-section>
  </div>
</template>

<style scoped lang="scss"></style>
