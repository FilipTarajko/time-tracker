<template>
  <div
    class="description"
    ref="descriptionContenteditable"
    contenteditable
    @focus="onFocus"
    @blur="onBlur"
    :style="`${
      entry.description || isFocused ? '' : 'opacity: 0.3; font-style: italic;'
    }`"
  >
    {{ entry.description || FALLBACK_TEXT }}
  </div>
</template>

<script setup lang="ts">
import { Entry, useEntriesStore } from 'stores/entriesStore';
import { Ref, ref } from 'vue';

const FALLBACK_TEXT = '(no description)';

const entriesStore = useEntriesStore();

const props = defineProps<{
  entry: Entry;
}>();

const descriptionContenteditable = ref<HTMLElement | null>(null);

const isFocused = ref(false);
const savedText: Ref<string | undefined> = ref(undefined);

function onFocus(e: Event) {
  isFocused.value = true;
  const target = e.target as HTMLElement;

  if (!props.entry.description) {
    target.innerText = '';
  }

  savedText.value = target.innerText;
}

function onBlur(e: Event) {
  isFocused.value = false;
  const target = e.target as HTMLElement;

  if (target.innerHTML == '<br>' || target.innerHTML == '&nbsp;') {
    target.innerHTML = '';
  }

  if (savedText.value !== target.innerHTML) {
    entriesStore.updateDescriptionOfEntry(props.entry, target.innerText);
  }

  if (target.innerText == '') {
    target.innerText = FALLBACK_TEXT;
  }
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
