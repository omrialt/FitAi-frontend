import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { isNativeApp } from '../config/platform';

/** Must match ANDROID_REDIRECT_BASE in the backend and the manifest's intent-filter. */
const OAUTH_RETURN = 'com.fitai.app://oauth';

/** The only pages a Google sign-in may finish on. */
const ALLOWED_NEXT = new Set(['/auth/google/callback', '/complete-profile', '/login']);

/** Only these query parameters are passed on to the page. */
const FORWARDED = ['code', 'error'] as const;

/**
 * Turn the URL that reopened the app into an in-app route, or `null`.
 *
 * Any app or web page can open a com.fitai.app:// link, so this accepts only
 * the OAuth return, only a known `next` page, and only `code` / `error` —
 * a crafted link cannot steer the app anywhere else.
 */
export function routeForOAuthReturn(url: string): string | null {
  const [base, query = ''] = url.split('?', 2);
  if (base !== OAUTH_RETURN) return null;

  const params = new URLSearchParams(query);
  const next = params.get('next');
  if (!next || !ALLOWED_NEXT.has(next)) return null;

  const forwarded = new URLSearchParams();
  for (const key of FORWARDED) {
    const value = params.get(key);
    if (value) forwarded.set(key, value);
  }

  const search = forwarded.toString();
  return search ? `${next}?${search}` : next;
}

/**
 * The return leg of Google sign-in in the Android app: close the system
 * browser and continue on the page the backend named, which redeems the code
 * exactly as it does on the web.
 */
export function useNativeDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeApp) return;

    const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      const route = routeForOAuthReturn(url);
      if (!route) return;

      // Already gone when Android brought the app forward on its own.
      void Browser.close().catch(() => {});
      navigate(route, { replace: true });
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [navigate]);
}
