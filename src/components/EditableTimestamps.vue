<template>
  <div style="width: 6em; height: fit-content">
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
            <q-btn v-close-popup label="Close" color="primary" flat />
          </div>
        </q-time>
      </q-popup-proxy>
    </span>
    -
    <span
      @click="
        // @ts-ignore
        isStartTimeEdited = false;
        hourAndMinuteForQTime = date.formatDate(entry.endTime, 'HH:mm');
      "
    >
      {{ date.formatDate(entry.endTime, 'HH:mm') }}
      <q-popup-proxy transition-show="scale" transition-hide="scale">
        <q-time v-model="hourAndMinuteForQTime">
          <div class="row items-center justify-end">
            <q-btn v-close-popup label="Close" color="primary" flat />
          </div>
        </q-time>
      </q-popup-proxy>
    </span>
  </div>
</template>

<script setup lang="ts">
import { date } from 'quasar';
import { ref, watch } from 'vue';
import { Entry } from 'stores/entriesStore';

const props = defineProps<{
  entry: Entry;
}>();

const hourAndMinuteForQTime = ref(props.entry.startTime.toString());
let isStartTimeEdited = true;

function getMinuteOfDayFromHHmm(HHmm: string): number {
  const parts = HHmm.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_IN_MINUTE = 60 * 1000;

function editTimestamp(updatedFormattedTime: string) {
  const editedProperty = isStartTimeEdited ? 'startTime' : 'endTime';

  const valueOnEntry = date.formatDate(props.entry![editedProperty], 'HH:mm');
  if (valueOnEntry == updatedFormattedTime) {
    return;
  }

  const newValueMinuteOfDay = getMinuteOfDayFromHHmm(updatedFormattedTime);
  const entryValueMinuteOfDay = getMinuteOfDayFromHHmm(valueOnEntry);
  const minutesToAdd = newValueMinuteOfDay - entryValueMinuteOfDay;
  props.entry![editedProperty] += minutesToAdd * MILLISECONDS_IN_MINUTE;

  const startOfEntry = props.entry!.startTime;
  const endOfEntry = props.entry!.endTime;

  if (endOfEntry) {
    if (startOfEntry > endOfEntry) {
      if (isStartTimeEdited) {
        props.entry!.startTime -= MILLISECONDS_IN_DAY;
      } else {
        props.entry!.endTime! += MILLISECONDS_IN_DAY;
      }
    }

    if (startOfEntry <= endOfEntry - MILLISECONDS_IN_DAY) {
      if (isStartTimeEdited) {
        props.entry!.startTime += MILLISECONDS_IN_DAY;
      } else {
        props.entry!.endTime! -= MILLISECONDS_IN_DAY;
      }
    }
  }
}

watch(hourAndMinuteForQTime, (updatedFormattedTime) => {
  editTimestamp(updatedFormattedTime);
});
</script>

<style scoped lang="scss"></style>
