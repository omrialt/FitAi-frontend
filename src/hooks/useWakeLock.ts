import { useEffect } from 'react';

/**
 * Keeps the screen on while the calling screen is mounted.
 *
 * Between sets the phone sits on a bench, and a screen that dims every thirty
 * seconds has to be unlocked again for every set logged. The Screen Wake Lock
 * API covers both Chrome and the Android app's WebView, so no plugin is
 * needed. The browser drops the lock whenever the page is hidden, so it is
 * taken again each time the page comes back. Where the API is missing or
 * refuses (battery saver), the screen simply behaves as it always did.
 */
export function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let released = false;

    const acquire = async () => {
      if (released || document.visibilityState !== 'visible') return;
      try {
        sentinel = await navigator.wakeLock.request('screen');
        // Unmounted while the request was in flight.
        if (released) void sentinel.release();
      } catch {
        // Refused (battery saver, no permission). Not worth bothering anyone.
      }
    };

    const onVisibility = () => void acquire();

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, []);
}
