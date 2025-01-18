import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'index',
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
    ],
  },
  {
    path: '/stats',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'stats',
        path: '',
        component: () => import('pages/StatsPage.vue'),
      },
    ],
  },
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'settings',
        path: '',
        component: () => import('pages/SettingsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
