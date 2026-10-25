import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { App as CapacitorApp } from '@capacitor/app';
import { useAuthStore } from '../store/authStore';
import { isNativeApp } from '../config/platform';
import { syncReminders, type ReminderText } from '../services/workout-reminders';
import { syncWidget, type WidgetText } from '../services/home-widget';

/** The localised title and body for a reminder. */
export function useReminderText(): ReminderText {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      title: (r) => t('reminders.notificationTitle', { day: r.dayName }),
      body: (r) => t('reminders.notificationBody', { exercises: r.exerciseCount }),
    }),
    [t],
  );
}

/** A function that rebuilds the reminders for the signed-in user. */
export function useSyncReminders() {
  const userId = useAuthStore((state) => state.user?._id);
  const text = useReminderText();
  return useCallback(
    () => (userId ? syncReminders(userId, text) : Promise.resolve([])),
    [userId, text],
  );
}

/** The home widget's localised text (TodayWidgetProvider fills the placeholders). */
export function useWidgetText(): WidgetText {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      todayTitle: t('widget.todayTitle'),
      todaySubtitle: t('widget.todaySubtitle'),
      doneTitle: t('widget.doneTitle'),
      doneSubtitle: t('widget.doneSubtitle'),
      restTitle: t('widget.restTitle'),
      nextTomorrow: t('widget.nextTomorrow'),
      nextLater: t('widget.nextLater'),
      noPlanTitle: t('widget.noPlanTitle'),
      noPlanSubtitle: t('widget.noPlanSubtitle'),
      signedOutTitle: t('widget.signedOutTitle'),
      signedOutSubtitle: t('widget.signedOutSubtitle'),
      streak: t('widget.streak'),
      start: t('widget.start'),
      weekdays: t('widget.weekdays', { returnObjects: true }) as string[],
    }),
    [t],
  );
}

/** A function that refreshes the home widget for the signed-in user. */
export function useSyncWidget() {
  const userId = useAuthStore((state) => state.user?._id);
  const text = useWidgetText();
  return useCallback(
    () => (userId ? syncWidget(userId, text) : Promise.resolve()),
    [userId, text],
  );
}

/**
 * Everything the phone keeps for the user outside the app — the scheduled
 * reminders and the home widget — refreshed when a user is signed in and each
 * time the app comes back to the foreground: a new day, a changed plan or a
 * workout logged elsewhere all change what they should show.
 */
export function useBackgroundSync() {
  const syncR = useSyncReminders();
  const syncW = useSyncWidget();

  useEffect(() => {
    if (!isNativeApp) return;
    const sync = () => {
      void syncR();
      void syncW();
    };
    sync();
    const resume = CapacitorApp.addListener('resume', sync);
    return () => {
      void resume.then((handle) => handle.remove());
    };
  }, [syncR, syncW]);
}
