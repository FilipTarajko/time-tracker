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
    <span
      @click="
        // @ts-ignore
        isStartTimeEdited = false;
        hourAndMinuteForQTime = date.formatDate(entry.endTime ?? undefined, 'HH:mm');
      "
    >
      {{ date.formatDate(entry.endTime ?? undefined, 'HH:mm') }}
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
</script>

<style scoped lang="scss"></style>
