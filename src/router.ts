import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Game from './views/Game.vue';
import Leaderboard from './views/Leaderboard.vue';
import Analytics from './views/Analytics.vue';
import Help from './views/Help.vue';
import About from './views/About.vue';
import Imprint from './views/Imprint.vue';
import Settings from './views/Settings.vue';

const routes: Array<RouteRecordRaw> = [
  // {
  //   path: '/',
  //   name: 'home',
  //   component: Home,
  //   meta: { title: 'Home' },
  // },
  {
    path: '/',
    name: 'game',
    component: Game,
    meta: { title: 'Game' },
  },
  {
    path: '/highscores',
    name: 'highscores',
    component: Leaderboard,
    meta: { title: 'High Score' },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: Analytics,
    meta: { title: 'Analytics' },
  },
  {
    path: '/help',
    name: 'help',
    component: Help,
    meta: { title: 'Help' },
  },
  {
    path: '/imprint',
    name: 'imprint',
    component: Imprint,
    meta: { title: 'Imprint & Data Privacy' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { title: 'Settings' },
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: { title: 'About' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Update page title on route change
router.afterEach((to) => {
  document.title = `${to.meta.title || 'eLogical'} - eLogical`;
});

export default router;
