import { useEffect } from 'react';
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

  const { justSent, acknowledge } = useOfflineSync(isAuthenticated);

  useEffect(() => {
    if (justSent <= 0) return;

    toast.success(t('workout.offlineSynced', { count: justSent }));
    acknowledge();
  }, [justSent, acknowledge, t]);

  return null;
}
