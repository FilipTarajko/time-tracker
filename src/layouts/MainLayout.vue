<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="width-limiter-parent">
        <div style="display: flex; align-items: baseline; gap: 20px">
          <!--        <q-btn-->
          <!--          flat-->
          <!--          dense-->
          <!--          round-->
          <!--          icon="menu"-->
          <!--          aria-label="Menu"-->
          <!--          @click="toggleLeftDrawer"-->
          <!--        />-->

          <q-toolbar-title>
            <router-link :to="{ name: 'index' }">
              {{ productName }}
            </router-link>
          </q-toolbar-title>

          <router-link :to="{ name: 'index' }">entries</router-link>
          <router-link :to="{ name: 'stats' }">stats</router-link>
          <router-link :to="{ name: 'settings' }">settings</router-link>
          <router-link :to="{ name: 'account' }">account</router-link>

          <!--        <div>Quasar v{{ $q.version }}</div>-->
        </div>
      </q-toolbar>
    </q-header>

    <!--    <q-drawer-->
    <!--      v-model="leftDrawerOpen"-->
    <!--      show-if-above-->
    <!--      bordered-->
    <!--    >-->
    <!--      <q-list>-->
    <!--        <q-item-label-->
    <!--          header-->
    <!--        >-->
    <!--          Navigation-->
    <!--        </q-item-label>-->

    <!--        <NavigationLink-->
    <!--          v-for="link in linksList"-->
    <!--          :key="link.title"-->
    <!--          v-bind="link"-->
    <!--        />-->
    <!--      </q-list>-->
    <!--    </q-drawer>-->

    <q-page-container class="width-limiter-parent">
      <q-page class="q-mt-sm">
        <router-view v-if="authStore.isLoggedIn" />
        <template v-else>
          <div
            v-if="routeName !== 'account'"
            style="width: fit-content; margin: 10px auto; color: red"
          >
            {{
              `Log in to view the ${
                routeName && typeof routeName === 'string'
                  ? routeName + ' '
                  : ''
              }page.`
            }}
          </div>
          <account-page />
        </template>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { productName } from '../../package.json';

defineOptions({
  name: 'MainLayout',
});

import { useAuthStore } from 'stores/authStore';
import AccountPage from 'pages/AccountPage.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

// TODO: where should this actually be?
const authStore = useAuthStore();
authStore.initFromSupabase();

const route = useRoute();
const routeName = computed(() => {
  return route.name;
});

// const linksList: NavigationLinkProps[] = [
//   {
//     title: 'Github',
//     caption: 'github.com/quasarframework',
//     icon: 'code',
//     link: 'https://github.com/quasarframework'
//   },
// ];

// const leftDrawerOpen = ref(false);

// function toggleLeftDrawer () {
//   leftDrawerOpen.value = !leftDrawerOpen.value;
// }
</script>

<style lang="scss">
.width-limiter-parent {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 0 12px;

  & > :first-child {
    max-width: 1000px;
    width: 100%;
  }
}

a {
  color: white;
  text-decoration: none;
}
</style>
