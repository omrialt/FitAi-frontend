import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Android shell around the same Vite build the web deploys.
 *
 * The bundle is served from https://localhost inside the WebView, so the API
 * must be an absolute URL baked in at build time (`npm run build:android`) and
 * the backend must allow that origin in CORS.
 *
 * `appId` becomes the Play Store package name and cannot change after the
 * first release.
 */
const config: CapacitorConfig = {
  appId: 'com.fitai.app',
  appName: 'FitAi',
  webDir: 'dist',
  android: {
    // Matches the manifest's background_color, so there is no white flash
    // between the splash and the first paint.
    backgroundColor: '#0f1115',
  },
};

export default config;
