import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as CapacitorApp } from '@capacitor/app';
import { StitchIcon } from '../common/StitchIcon';
import { isNativeApp } from '../../config/platform';
import {
  hasExactAlarms,
  openExactAlarmSetting,
  requestNotificationPermission,
} from '../../services/rest-alarm';
import { getLiveStatus, openNotificationSettings } from '../../services/workout-live';

interface Health {
  notifications: boolean;
  promoted: boolean;
  exact: boolean;
}

/**
 * What Android currently lets FitAi do with notifications, in the app only.
 *
 * When the workout clock does not show in the status bar, the cause is almost
 * always one of these three switches, and each lives on a different system
 * screen. This says which one is off and opens the screen that fixes it,
 * instead of leaving the user to guess. Re-checked when the app returns from
 * those screens.
 */
export function NotificationHealth() {
  const { t } = useTranslation();
  const [health, setHealth] = useState<Health | null>(null);

  const refresh = useCallback(async () => {
    const [live, exact] = await Promise.all([getLiveStatus(), hasExactAlarms()]);
    setHealth({ notifications: live.notifications, promoted: live.promoted, exact });
  }, []);

  useEffect(() => {
    if (!isNativeApp) return;
    void refresh();
    const resume = CapacitorApp.addListener('resume', () => void refresh());
    return () => {
      void resume.then((handle) => handle.remove());
    };
  }, [refresh]);

  if (!isNativeApp || !health) return null;

  const rows: { key: string; ok: boolean; title: string; hint: string; fix: () => void }[] = [
    {
      key: 'notifications',
      ok: health.notifications,
      title: t('notificationHealth.notifications'),
      hint: t('notificationHealth.notificationsHint'),
      fix: () =>
        void requestNotificationPermission().then((granted) => {
          if (!granted) void openNotificationSettings();
          void refresh();
        }),
    },
    {
      key: 'promoted',
      ok: health.promoted,
      title: t('notificationHealth.live'),
      hint: t('notificationHealth.liveHint'),
      fix: () => void openNotificationSettings(),
    },
    {
      key: 'exact',
      ok: health.exact,
      title: t('notificationHealth.exact'),
      hint: t('notificationHealth.exactHint'),
      fix: () => void openExactAlarmSetting(),
    },
  ];

  return (
    <div className="mt-6 rounded-2xl border border-ghost bg-surface-container-lowest p-6">
      <h2 className="text-lg font-bold text-on-surface">{t('notificationHealth.title')}</h2>
      <p className="mt-1 text-sm text-on-surface-variant">{t('notificationHealth.subtitle')}</p>

      <ul className="mt-5 flex flex-col gap-4">
        {rows.map((row) => (
          <li key={row.key} className="flex items-start justify-between gap-4" data-testid={`health-${row.key}`}>
            <div className="flex flex-1 items-start gap-3">
              <StitchIcon
                name={row.ok ? 'check_circle' : 'warning'}
                className={row.ok ? 'text-success' : 'text-error'}
              />
              <div>
                <h3 className="font-semibold text-on-surface">{row.title}</h3>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  {row.ok ? t('notificationHealth.on') : row.hint}
                </p>
              </div>
            </div>
            {!row.ok && (
              <button
                type="button"
                onClick={row.fix}
                className="shrink-0 rounded-lg border border-ghost px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
              >
                {t('notificationHealth.fix')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
