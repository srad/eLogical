import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Game from './views/Game.vue';
import Highscore from './views/Highscore.vue';
import Analytics from './views/Analytics.vue';
import Help from './views/Help.vue';
import About from './views/About.vue';
import Terms from './views/Terms.vue';
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
    component: Highscore,
    meta: { title: 'High Score' },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: Analytics,
    meta: { title: 'Analytics' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { title: 'Settings' },
  },
  {
    path: '/help',
    name: 'help',
    component: Help,
    meta: { title: 'Help' },
  },
  {
    path: '/terms',
    name: 'terms',
    component: Terms,
    meta: { title: 'Terms & Data Privacy' },
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
