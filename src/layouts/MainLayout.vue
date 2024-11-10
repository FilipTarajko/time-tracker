<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="width-limiter-parent">
        <div>

<!--        <q-btn-->
<!--          flat-->
<!--          dense-->
<!--          round-->
<!--          icon="menu"-->
<!--          aria-label="Menu"-->
<!--          @click="toggleLeftDrawer"-->
<!--        />-->

        <q-toolbar-title>
          {{ productName }}
        </q-toolbar-title>

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
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { productName } from '../../package.json';
import { ref } from 'vue';
import { NavigationLinkProps } from 'components/NavigationLink.vue';

defineOptions({
  name: 'MainLayout'
});

// const linksList: NavigationLinkProps[] = [
//   {
//     title: 'Github',
//     caption: 'github.com/quasarframework',
//     icon: 'code',
//     link: 'https://github.com/quasarframework'
//   },
// ];

const leftDrawerOpen = ref(false);

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

    :first-child {
      max-width: 1000px;
      width: 100%;
    }
  }
</style>
