import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isNativeApp } from '../../config/platform';
import { requestNotificationPermission } from '../../services/rest-alarm';
import {
  getReminderSettings,
  setReminderSettings,
  type PlannedReminder,
  type ReminderSettings as Settings,
} from '../../services/workout-reminders';
import { useSyncReminders } from '../../hooks/useReminderSync';

/**
 * The workout reminder switch and time, in the app only.
 *
 * Shows the next few reminders that are actually scheduled, so "on at 09:00"
 * is not an abstraction: the user sees which days it will fire, or why it
 * will not (no active plan).
 */
export function ReminderSettings() {
  const { t, i18n } = useTranslation();
  const sync = useSyncReminders();
  const [settings, setSettings] = useState<Settings>(getReminderSettings);
  const [upcoming, setUpcoming] = useState<PlannedReminder[] | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!isNativeApp) return;
    let cancelled = false;
    void sync().then((planned) => {
      if (!cancelled) setUpcoming(planned);
    });
    return () => {
      cancelled = true;
    };
  }, [sync, settings]);

  if (!isNativeApp) return null;

  const apply = (next: Settings) => {
    setReminderSettings(next);
    setSettings(next);
  };

  const toggle = async () => {
    if (settings.enabled) {
      apply({ ...settings, enabled: false });
      return;
    }
    const granted = await requestNotificationPermission();
    setDenied(!granted);
    if (granted) apply({ ...settings, enabled: true });
  };

  const formatDay = (at: Date) =>
    at.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'numeric' });

  return (
    <div className="mt-6 rounded-2xl border border-ghost bg-surface-container-lowest p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-on-surface">{t('reminders.title')}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{t('reminders.subtitle')}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          aria-label={t('reminders.title')}
          onClick={() => void toggle()}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            settings.enabled ? 'bg-primary' : 'bg-surface-container-high'
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
              settings.enabled ? 'start-6' : 'start-1'
            }`}
          />
        </button>
      </div>

      {denied && (
        <p className="mt-3 text-sm text-error" role="alert">
          {t('reminders.denied')}
        </p>
      )}

      {settings.enabled && (
        <div className="mt-5 flex flex-col gap-4">
          <label className="flex items-center justify-between gap-4" htmlFor="reminder-time">
            <span className="font-semibold text-on-surface">{t('reminders.time')}</span>
            <input
              id="reminder-time"
              type="time"
              value={settings.time}
              onChange={(e) => {
                if (/^\d{2}:\d{2}$/.test(e.target.value)) apply({ ...settings, time: e.target.value });
              }}
              className="rounded-lg border border-ghost bg-surface px-3 py-2 text-on-surface"
              dir="ltr"
            />
          </label>

          <div>
            <h3 className="text-sm font-semibold text-on-surface">{t('reminders.upcoming')}</h3>
            {upcoming === null ? null : upcoming.length === 0 ? (
              <p className="mt-1 text-sm text-on-surface-variant">{t('reminders.noneUpcoming')}</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1 text-sm text-on-surface-variant" data-testid="reminders-upcoming">
                {upcoming.slice(0, 3).map((r) => (
                  <li key={r.at.toISOString()}>
                    {formatDay(r.at)} · {settings.time} · {r.dayName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
