<template>
  <div class="description" contenteditable @blur="updateDescription">
    {{ entry.description }}
  </div>
</template>

<script setup lang="ts">
import { Entry, useEntriesStore } from 'stores/entriesStore';

const props = defineProps<{
  entry: Entry;
}>();

const entriesStore = useEntriesStore();

function updateDescription(e: Event) {
  const target = e.target as HTMLElement;
  entriesStore.updateDescriptionOfEntry(props.entry, target.innerText);
}
</script>

<style lang="scss">
.description {
  height: fit-content;

  &:focus {
    background-color: white;
  }
}
</style>
