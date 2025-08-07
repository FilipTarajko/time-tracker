import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { supabase } from 'src/lib/supabaseClient';

import { Notify } from 'quasar';
import { Task, useTasksStore } from 'stores/tasksStore';
import { Entry, useEntriesStore } from 'stores/entriesStore';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { indexedDb } from 'src/lib/indexedDb';

export const useAuthStore = defineStore('auth', () => {
  const currentUserEmail = ref('');

  const isLoggedIn = computed<boolean>(() => {
    return !!currentUserEmail.value;
  });

  // TODO: make local-first
  async function initOtherData() {
    await useTasksStore().initFromSupabase();
    await useEntriesStore().initFromSupabase();

    supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => handleReceivedChange(payload)
      )
      .subscribe();
  }

  async function clearOtherData() {
    useEntriesStore().clear();
    useTasksStore().clear();
    indexedDb.entries.clear();
    indexedDb.tasks.clear();
  }

  async function initFromSupabase() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log(error);
      return;
    }

    if (data.session) {
      currentUserEmail.value = data.session.user.email!;
      await initOtherData();
    }
  }

  async function logIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Notify.create({ message: error.message, type: 'negative' });
      return;
    }

    Notify.create({ message: 'Logged in!', type: 'positive' });
    currentUserEmail.value = data.session!.user.email!;

    await initOtherData();
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Notify.create({ message: error.message, type: 'negative' });
      return;
    }

    Notify.create({ message: 'Registered!', type: 'positive' });
    currentUserEmail.value = data.session!.user.email!;

    await initOtherData();
  }

  async function logOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Notify.create({ message: error.message, type: 'negative' });
      return;
    }

    currentUserEmail.value = '';
    Notify.create({ message: 'Logged out!', type: 'positive' });

    await clearOtherData();
  }

  // TODO: refactor
  function handleReceivedChange(
    change: RealtimePostgresChangesPayload<{ [p: string]: unknown }>
  ) {
    const eventType = change.eventType as EventTypes;

    if (change.table == Tables.entries) {
      const entriesStore = useEntriesStore();

      if ([EventTypes.INSERT, EventTypes.UPDATE].includes(eventType)) {
        const changedEntry = change.new as Entry;

        if (changedEntry.is_deleted) {
          entriesStore.entries = entriesStore.entries.filter((entry) => entry.id !== changedEntry.id);
          return;
        }

        let replaced = false;

        entriesStore.entries = entriesStore.entries.map((entry: Entry) => {
          if (entry.id === changedEntry.id) {
            replaced = true;
            return changedEntry;
          } else {
            return entry;
          }
        });

        if (!replaced) {
          entriesStore.entries.unshift(changedEntry);
        }
      }
    } else if (change.table == Tables.tasks) {
      const tasksStore = useTasksStore();

      if ([EventTypes.INSERT, EventTypes.UPDATE].includes(eventType)) {
        const changedTask = change.new as Task;

        if (changedTask.is_deleted) {
          tasksStore.tasks = tasksStore.tasks.filter((task) => task.id !== changedTask.id);
          return;
        }

        let replaced = false;

        tasksStore.tasks = tasksStore.tasks.map((task: Task) => {
          if (task.id === changedTask.id) {
            replaced = true;
            return changedTask;
          } else {
            return task;
          }
        });

        if (!replaced) {
          tasksStore.tasks.unshift(changedTask);
        }
      }
    } else {
      console.error(`received ${change} from unhandled table (${change.table})`);
    }
  }

  enum Tables {
    entries = 'entries',
    tasks = 'tasks',
  }

  enum EventTypes {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
  }

  return {
    initFromSupabase,
    currentUserEmail,
    signUp,
    logIn,
    logOut,
    isLoggedIn,
  };
});
