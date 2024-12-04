import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: () => import("../views/Home.vue"),
    },
    {
      path: '/index',
      name: 'index',
      component: () => import("../views/Index.vue"),
    },
    {
      path: '/process',
      name: 'process',
      component: () => import("../views/Process.vue"),
    },
    {
      path: '/sqllogs',
      name: 'sqllogs',
      component: () => import("../views/SQLLogs.vue"),
    },
    {
      path: '/storage',
      name: 'storage',
      component: () => import("../views/Storage.vue"),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import("../views/Help.vue"),
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/home'
    }
  ],
})

export default router
