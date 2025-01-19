<script setup lang="ts">
import { formatDuration } from 'src/helpers/timeHelpers';
import { Entry, useEntriesStore } from 'stores/entriesStore';
import { computed, ref } from 'vue';
import EntryComponent from 'components/EntryComponent.vue';
import { Task } from 'stores/tasksStore';

const entriesStore = useEntriesStore();

const now = ref(Date.now());
setInterval(() => {
  now.value = Date.now();
}, 1000);

const props = defineProps<{
  displayOngoing: boolean;
  filterByTask?: Task | null | undefined;
}>();

const filteredEntriesWithDates = computed<Map<string, Entry[]>>(() => {
  let entries = entriesStore.entries.toSorted(
    (a, b) => b.startTime - a.startTime
  );

  const taskIdFilter = props?.filterByTask?.id ?? null;
  entries = entries.filter((e) => e.taskId == taskIdFilter || !taskIdFilter);

  const dates: Map<string, Entry[]> = new Map();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const dateOfThisEntry = entriesStore.getLocalDateOfEntry(entry);
    if (dates.has(dateOfThisEntry)) {
      dates.set(dateOfThisEntry, [...dates.get(dateOfThisEntry)!, entry]);
    } else {
      dates.set(dateOfThisEntry, [entry]);
    }
  }

  return dates;
});
</script>

<template>
  <div
    v-for="dateAndEntries in filteredEntriesWithDates"
    :key="dateAndEntries[0]"
  >
    <div style="margin-top: 8px; display: flex; gap: 1.6em">
      <div>
        {{ dateAndEntries[0] }}
      </div>
      <div>
        {{
          formatDuration(
            dateAndEntries[1].reduce(
              (total, entry) =>
                entry.endTime ? total + entry.endTime! - entry.startTime : 0,
              0
            ) +
              (entriesStore.ongoingEntry &&
              entriesStore.getLocalDateOfEntry(entriesStore.ongoingEntry) ==
                dateAndEntries[0]
                ? now - entriesStore.ongoingEntry.startTime
                : 0)
          )
        }}
      </div>
    </div>
    <template
      v-for="entry in dateAndEntries[1].filter(
        (e) => e.endTime || displayOngoing
      )"
      :key="entry.id"
    >
      <EntryComponent :entry />
    </template>
  </div>
</template>
