<template>
  <div style="height: fit-content">
    <span
      @click="
        isStartTimeEdited = true;
        hourAndMinuteForQTime = date.formatDate(entry.startTime, 'HH:mm');
      "
    >
      {{ formatTimestampAccordingToSettings(entry.startTime) }}
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
      {{
        entry.endTime
          ? formatTimestampAccordingToSettings(entry.endTime, entry.startTime)
          : 'ongoing'
      }}
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
import { useSettingsStore } from 'stores/settingsStore';
import { HOURS_IN_DAY, MILLISECONDS_IN_DAY } from 'src/helpers/timeHelpers';

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

const settingsStore = useSettingsStore();

function padWithZeroIfBelow10(x: number) {
  if (x < 10) {
    return `0${x}`;
  }
  return x;
}

function formatTimestampAccordingToSettings(
  timestamp: number,
  timestampOfStart?: number
) {
  let hour = new Date(timestamp).getHours();
  const minute = new Date(timestamp).getMinutes();
  if (hour < settingsStore.dayEndOffset && settingsStore.goOver24WhenOffset) {
    hour += HOURS_IN_DAY;
  }
  if (
    timestampOfStart &&
    settingsStore.goOver24WhenOffset &&
    settingsStore.alsoGoOver24WhenMultiDay &&
    entriesStore.getLocalDateOfTimestampAccordingToSettings(timestamp) !=
      entriesStore.getLocalDateOfTimestampAccordingToSettings(timestampOfStart)
  ) {
    const timestampOfStartDay = new Date(
      entriesStore.getLocalDateOfTimestampAccordingToSettings(timestampOfStart)
    ).getTime();
    const timestampOfDay = new Date(
      entriesStore.getLocalDateOfTimestampAccordingToSettings(timestamp)
    ).getTime();
    const daysDiff =
      (timestampOfDay - timestampOfStartDay) / MILLISECONDS_IN_DAY;
    hour += daysDiff * HOURS_IN_DAY;
  }
  return `${padWithZeroIfBelow10(hour)}:${padWithZeroIfBelow10(minute)}`;
}
</script>

<style scoped lang="scss"></style>
