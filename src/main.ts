import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAward,
  faCheck,
  faDice,
  faHeart,
  faHeartBroken,
  faLaughBeam,
  faStopwatch20,
  faMedal,
  faQuestion,
  faRobot,
  faSkullCrossbones,
  faStar,
  faStopwatch,
  faTimes,
  faTimesCircle,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import './assets/main.scss';
import 'animate.css';

import App from './App.vue';
import router from './router';
import { ElogicalApi } from './services/elogical';

// Configure FontAwesome
library.add(
  faHeart,
  faAward,
  faStar,
  faCheck,
  faRobot,
  faTimes,
  faTimesCircle,
  faStopwatch20,
  faMedal,
  faLaughBeam,
  faHeartBroken,
  faTrophy,
  faStopwatch,
  faDice,
  faQuestion,
  faSkullCrossbones
);

// Create the app instance
const app = createApp(App);

// Setup Pinia
const pinia = createPinia();
app.use(pinia);

// Setup Router
app.use(router);

// Register FontAwesome
app.component('FontAwesomeIcon', FontAwesomeIcon);

// Initialize API
const api = new ElogicalApi();
app.config.globalProperties.$api = api;
app.provide('$api', api);

// Initialize Logger
const logger = (message: string) => console.log(message);
app.config.globalProperties.$log = logger;
app.provide('$log', logger);

// Initialize localStorage defaults
if (!localStorage.trackingAllowed) {
  localStorage.trackingAllowed = 'true'; // Enable tracking by default
}

// Mount app
app.mount('#app');
