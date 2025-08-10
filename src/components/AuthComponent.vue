<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/authStore';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
</script>

<template>
  <div class="column q-mx-auto q-my-md q-gutter-sm" style="width: 200px">
    <template v-if="authStore.isLoggedIn">
      <div>email: {{ authStore.currentUserEmail }}</div>
      <q-btn color="warning" @click="authStore.logOut">log out</q-btn>
    </template>
    <template v-else>
      <q-input outlined dense type="email" v-model="email" label="email" />
      <q-input outlined dense type="password" v-model="password" label="password" />
      <q-btn color="primary" @click="authStore.logIn(email, password)"
        >log in
      </q-btn>
      <q-btn color="secondary" @click="authStore.signUp(email, password)"
        >sign up
      </q-btn>
    </template>
  </div>
</template>
