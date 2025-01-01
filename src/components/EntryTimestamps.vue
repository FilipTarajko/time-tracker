<template>
  <div style="height: fit-content">
    <span
      @click="
        isStartTimeEdited = true;
        hourAndMinuteForQTime = date.formatDate(entry.startTime, 'HH:mm');
      "
    >
      {{ date.formatDate(entry.startTime, 'HH:mm') }}
      <q-popup-proxy transition-show="scale" transition-hide="scale">
        <q-time v-model="hourAndMinuteForQTime">
          <div class="row items-center justify-end">
            <q-btn v-close-popup label="Cancel" color="primary" flat />
            <q-btn
              v-close-popup
              label="Save"
              color="primary"
              flat
              @click="editTimestamp"
            />
          </div>
        </q-time>
      </q-popup-proxy>
    </span>
    -
    <span @click="handleEndTimeClicked">
      {{ date.formatDate(entry.endTime ?? undefined, 'HH:mm') ?? 'ongoing' }}
      <q-popup-proxy
        v-if="entry.endTime"
        transition-show="scale"
        transition-hide="scale"
      >
        <q-time v-model="hourAndMinuteForQTime">
          <div class="row items-center justify-end">
            <q-btn v-close-popup label="Cancel" color="primary" flat />
            <q-btn
              v-close-popup
              label="Save"
              color="primary"
              flat
              @click="editTimestamp"
            />
          </div>
        </q-time>
      </q-popup-proxy>
    </span>
  </div>
</template>

<script setup lang="ts">
import { date } from 'quasar';
import { ref } from 'vue';
import { Entry, useEntriesStore } from 'stores/entriesStore';

const props = defineProps<{
  entry: Entry;
}>();

const entriesStore = useEntriesStore();

const hourAndMinuteForQTime = ref(props.entry.startTime.toString());
let isStartTimeEdited = true;

function editTimestamp() {
  const updatedFormattedTime = hourAndMinuteForQTime.value;

  entriesStore.updateTimestampOfEntry(
    props.entry,
    updatedFormattedTime,
    isStartTimeEdited
  );
}

function handleEndTimeClicked() {
  if (props.entry.endTime) {
    isStartTimeEdited = false;
    hourAndMinuteForQTime.value = date.formatDate(props.entry.endTime, 'HH:mm');
  }
}
</script>

<style scoped lang="scss"></style>
