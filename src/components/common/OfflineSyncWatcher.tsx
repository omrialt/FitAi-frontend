import { useEffect, useState } from 'react';
import { IconCloudOff, IconClockHour4 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useAuthStore } from '../../store/authStore';

/**
 * Drains the offline queue for the whole app, and says so when it does.
 *
 * Mounted once at the root rather than on the logger, because the send that
 * matters happens *after* the user has left that screen — they finish in a
 * basement, walk out, and open the app on a bus. Nothing here renders; the
 * only visible effect is a confirmation once workouts actually land.
 *
 * Gated on being signed in: flushing without a token would burn every queued
 * session against a 401 and, worse, could file them against whoever signs in
 * next on a shared device.
 */
export function OfflineSyncWatcher() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { justSent, acknowledge, pending } = useOfflineSync(isAuthenticated);

  // The browser's own signal. It can say "online" on a captive portal, which
  // is why the queue retries on its own; this only drives the banner.
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  useEffect(() => {
    if (justSent <= 0) return;

    toast.success(t('workout.offlineSynced', { count: justSent }));
    acknowledge();
  }, [justSent, acknowledge, t]);

  if (!isAuthenticated || (online && pending === 0)) return null;

  // Calm, not alarming (interfaces-that-feel): say what still works and what
  // will happen, rather than that something failed.
  return (
    <div role="status" className="offline-banner">
      {online ? <IconClockHour4 size={18} aria-hidden="true" /> : <IconCloudOff size={18} aria-hidden="true" />}
      <span>
        {online
          ? t('offline.pending', { count: pending })
          : pending > 0
            ? t('offline.offlineWithPending', { count: pending })
            : t('offline.offline')}
      </span>
    </div>
  );
}
