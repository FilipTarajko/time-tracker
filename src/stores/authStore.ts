import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { supabase } from 'src/lib/supabaseClient';

import { Notify } from 'quasar';
import { useTasksStore } from 'stores/tasksStore';
import { useEntriesStore } from 'stores/entriesStore';

export const useAuthStore = defineStore('auth', () => {
  const currentUserEmail = ref('');

  const isLoggedIn = computed<boolean>(() => {
    return !!currentUserEmail.value;
  })

  // TODO: make local-first
  async function initOtherData() {
    await useTasksStore().initFromSupabase();
    await useEntriesStore().initFromSupabase();
  }

  async function clearOtherData() {
    useEntriesStore().entries = [];
    useTasksStore().tasks = [];
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

  return { initFromSupabase, currentUserEmail, signUp, logIn, logOut, isLoggedIn };
});
