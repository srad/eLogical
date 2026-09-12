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
  },
  plugins: {
    SystemBars: {
      // "LIGHT" means dark content, for a light background -- correct for the navigation
      // bar, which overlaps the near-white page. Pinning it here rather than leaving the
      // "DEFAULT" (follow-the-device-theme) value stops a dark-mode phone from drawing
      // white-on-white. The status bar overlaps the dark navy navbar and needs the
      // opposite, so src/main.ts flips that one at startup.
      style: 'LIGHT'
    }
  }
};

export default config;
