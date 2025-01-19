<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/authStore';

const authStore = useAuthStore();

const email = ref('a@a.a');
const password = ref('abcdef');
</script>

<template>
  <div class="column q-mx-auto q-my-md q-gutter-sm" style="width: 200px">
    <template v-if="authStore.isLoggedIn">
      <div>email: {{ authStore.currentUserEmail }}</div>
      <q-btn color="warning" @click="authStore.logOut">log out</q-btn>
    </template>
    <template v-else>
      <q-input outlined dense type="text" v-model="email" />
      <q-input outlined dense type="text" v-model="password" />
      <q-btn color="primary" @click="authStore.logIn(email, password)"
        >log in
      </q-btn>
      <q-btn color="secondary" @click="authStore.signUp(email, password)"
        >sign up
      </q-btn>
    </template>
  </div>
</template>
