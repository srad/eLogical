import type { CapacitorConfig } from '@capacitor/cli';

// The app is fully offline: no network requests, so no mixed-content allowance is needed.
// Safe-area insets come from Capacitor 8's built-in SystemBars plugin, which injects
// --safe-area-inset-{top,right,bottom,left} on Android by default.
const config: CapacitorConfig = {
  appId: 'com.github.srad.elogical',
  appName: 'elogical',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
