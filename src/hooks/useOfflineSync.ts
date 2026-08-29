import { useCallback, useEffect, useState } from 'react';

import { workoutSessionService } from '../services/workout-session.service';
import { flushQueue, queuedCount } from '../services/offline-queue';

/**
 * Drains the offline queue whenever draining might work.
 *
 * Mounted once, high in the tree, so a workout logged in a basement is sent
 * the moment the phone finds signal — without the user having to reopen the
 * screen they logged it on, which they will not do.
 *
 * `navigator.onLine` is only ever trusted in the negative direction: the
 * browser reports "online" for a captive portal or a connection that drops
 * every packet, so it is a hint to try and never proof that a send will
 * succeed. The queue is the source of truth, and a failed flush simply leaves
 * it intact.
 */
export function useOfflineSync(enabled: boolean) {
  const [pending, setPending] = useState(0);
  const [justSent, setJustSent] = useState(0);

  const refresh = useCallback(async () => {
    setPending(await queuedCount());
  }, []);

  const flush = useCallback(async () => {
    if (!enabled) return;

    const { sent } = await flushQueue((payload) =>
      workoutSessionService.create(payload),
    );

    if (sent > 0) setJustSent(sent);
    await refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return;

    void flush();

    const onOnline = () => void flush();
    window.addEventListener('online', onOnline);

    // A tab that was in the background while the phone regained signal never
    // sees the `online` event, so returning to it is its own trigger.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void flush();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, flush]);

  const acknowledge = useCallback(() => setJustSent(0), []);

  return { pending, justSent, flush, acknowledge, refresh };
}
