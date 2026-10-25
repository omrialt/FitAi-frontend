import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { LocalNotifications } from '@capacitor/local-notifications';
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

/** App links from shortcuts, reminders, notifications and the widget. */
const OPEN = 'com.fitai.app://open';

/** Screens an app link may open; nothing else is reachable this way. */
const OPEN_TARGETS = new Set([
  '/',
  '/workout/today',
  '/log-meal',
  '/physical-data',
  '/messages',
  '/workout-history',
]);

/** A specific plan day: a Mongo id and a day index, nothing more. */
const WORKOUT_DAY = /^\/workout\/[a-f0-9]{24}\/\d{1,2}$/;

/**
 * Turn a com.fitai.app://open?to=… link into an in-app route, or `null`.
 *
 * Same stance as the OAuth return: any app or page can open such a link, so
 * only a known screen (or one plan day by id) is accepted, and no other
 * parameter is passed on.
 */
export function routeForDeepLink(url: string): string | null {
  const [base, query = ''] = url.split('?', 2);
  if (base !== OPEN) return null;

  const to = new URLSearchParams(query).get('to');
  if (!to) return null;

  return OPEN_TARGETS.has(to) || WORKOUT_DAY.test(to) ? to : null;
}

/**
 * Links that open the app: the return leg of Google sign-in (close the system
 * browser and continue on the page the backend named) and app links from
 * shortcuts and notifications. A link that started the app from cold never
 * arrives as `appUrlOpen`, so the launch URL is read once as well. A tapped
 * local notification (a workout reminder) carries its link in `extra.url`.
 */
export function useNativeDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeApp) return;

    const follow = (url: string) => {
      const oauth = routeForOAuthReturn(url);
      if (oauth) {
        // Already gone when Android brought the app forward on its own.
        void Browser.close().catch(() => {});
        navigate(oauth, { replace: true });
        return;
      }

      const route = routeForDeepLink(url);
      if (route) navigate(route);
    };

    void CapacitorApp.getLaunchUrl()
      .then((launch) => {
        if (launch?.url) follow(launch.url);
      })
      .catch(() => {});

    const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => follow(url));
    const tapped = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      ({ notification }) => {
        const url = (notification.extra as { url?: unknown } | undefined)?.url;
        if (typeof url === 'string') follow(url);
      },
    );

    return () => {
      void listener.then((handle) => handle.remove());
      void tapped.then((handle) => handle.remove());
    };
  }, [navigate]);
}
