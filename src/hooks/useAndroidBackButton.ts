import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { isNativeApp } from '../config/platform';

/**
 * Android's system back gesture inside the installed app.
 *
 * With the App plugin present, Android stops handling back on its own: it
 * walks the WebView history but never leaves the app, so from the first
 * screen the gesture did nothing. Here it goes back while there is somewhere
 * to go, and closes the app from the first screen like any other Android app.
 */
export function useAndroidBackButton() {
  useEffect(() => {
    if (!isNativeApp) return;

    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        void CapacitorApp.exitApp();
      }
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, []);
}
