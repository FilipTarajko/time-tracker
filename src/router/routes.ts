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
      {
        name: 'stats',
        path: '/stats',
        component: () => import('pages/StatsPage.vue'),
      },
      {
        name: 'settings',
        path: '/settings',
        component: () => import('pages/SettingsPage.vue'),
      },
      {
        name: 'account',
        path: '/account',
        component: () => import('pages/AccountPage.vue'),
      },
      {
        name: 'tasks',
        path: '/tasks',
        component: () => import('pages/TasksPage.vue'),
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
