import { createApp } from 'vue';
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
import { App as CapacitorApp } from '@capacitor/app';
import { SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';
import { musicService } from './services/musicService';

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

// Safe area insets are injected as --safe-area-inset-{top,right,bottom,left} by
// Capacitor 8's built-in SystemBars plugin (insetsHandling defaults to "css" on Android),
// which is why no plugin call is needed here. See App.vue and Game.vue for the consumers.

// The two system bars sit on opposite backgrounds: the status bar overlaps the navbar,
// which is the icon's dark navy, while the navigation bar overlaps the near-white page.
// So they need opposite content colours, which a single config-wide `style` cannot
// express. capacitor.config.ts sets the navigation bar's from first paint; this only
// flips the status bar. Style names are inverted by convention: "Dark" means light
// content *for* a dark background.
SystemBars.setStyle({
  style: SystemBarsStyle.Dark,
  bar: SystemBarType.StatusBar,
}).catch(() => {
  /* No system bars in a browser; the web implementation is a no-op. */
});

// Handle app lifecycle events for music playback
CapacitorApp.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    // App came to foreground - resume music if it was playing
    if (musicService.isCurrentlyPaused()) {
      musicService.play();
    }
  } else {
    // App went to background - pause music
    if (musicService.isCurrentlyPlaying()) {
      musicService.pause();
    }
  }
});

// Mount app
app.mount('#app');
