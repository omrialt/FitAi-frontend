import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { App as CapacitorApp } from '@capacitor/app';
import { useAuthStore } from '../store/authStore';
import { isNativeApp } from '../config/platform';
import { syncReminders, type ReminderText } from '../services/workout-reminders';

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

/**
 * Keeps the scheduled reminders current: when a user is signed in and each
 * time the app comes back to the foreground — a new day, a changed plan or a
 * workout logged elsewhere all change what should be scheduled.
 */
export function useReminderSync() {
  const sync = useSyncReminders();

  useEffect(() => {
    if (!isNativeApp) return;
    void sync();
    const resume = CapacitorApp.addListener('resume', () => void sync());
    return () => {
      void resume.then((handle) => handle.remove());
    };
  }, [sync]);
}
