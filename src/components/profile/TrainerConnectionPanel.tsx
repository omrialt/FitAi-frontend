import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import trainerConnectionService from '../../services/trainer-connection.service';
import { usePendingInvitesStore } from '../../store/pendingInvitesStore';
import {
  getConnectionParty,
  type TrainerConnection,
} from '../../types/trainer-connection.types';

/**
 * Client-side view of the trainer relationship, shown on the Profile page.
 * Lists pending invitations (Accept / Decline) and the currently linked
 * trainer (with Unlink). Renders nothing when there is neither.
 */
export function TrainerConnectionPanel() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<TrainerConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await trainerConnectionService.getMyConnections();
      setConnections(data);
    } catch {
      // Non-critical panel — stay quiet if it can't load
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = connections.filter((c) => c.status === 'pending');
  const accepted = connections.find((c) => c.status === 'accepted');

  // Feed the header badge from the data already fetched here, so accepting or
  // declining updates it without a second round trip.
  const setPendingCount = usePendingInvitesStore((state) => state.setCount);
  const pendingCount = pending.length;

  useEffect(() => {
    if (!loading) setPendingCount(pendingCount);
  }, [loading, pendingCount, setPendingCount]);
  const acceptedTrainer = accepted
    ? getConnectionParty(accepted.trainerId)
    : null;

  const handleAccept = useCallback(
    async (id: string) => {
      try {
        await trainerConnectionService.accept(id);
        toast.success(t('clients.accepted'));
        await load();
      } catch {
        toast.error(t('clients.acceptFailed'));
      }
    },
    [t, load],
  );

  const handleDecline = useCallback(
    async (id: string) => {
      try {
        await trainerConnectionService.decline(id);
        toast.success(t('clients.declined'));
        await load();
      } catch {
        toast.error(t('clients.declineFailed'));
      }
    },
    [t, load],
  );

  const handleUnlink = useCallback(
    async (id: string) => {
      try {
        await trainerConnectionService.remove(id);
        toast.success(t('clients.unlinked'));
        await load();
      } catch {
        toast.error(t('clients.removeFailed'));
      }
    },
    [t, load],
  );

  if (loading || (pending.length === 0 && !accepted)) return null;

  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 mb-6">
      <h2 className="text-lg font-extrabold tracking-tight text-on-surface mb-4">
        {t('clients.myTrainer')}
      </h2>

      {accepted && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
              {acceptedTrainer?.fullName?.[0]?.toUpperCase() ?? '?'}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-on-surface truncate">
                {acceptedTrainer?.fullName}
              </p>
              <p className="text-sm text-on-surface-variant truncate">
                {acceptedTrainer?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleUnlink(accepted._id)}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors shrink-0"
          >
            {t('clients.unlink')}
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <div className={accepted ? 'mt-6' : ''}>
          <h3 className="text-sm font-bold text-on-surface-variant mb-3">
            {t('clients.trainerInvites')}
          </h3>
          <div className="space-y-3">
            {pending.map((c) => {
              const trainer = getConnectionParty(c.trainerId);
              return (
                <div
                  key={c._id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-container p-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface truncate">
                      {trainer?.fullName}
                    </p>
                    <p className="text-sm text-on-surface-variant truncate">
                      {t('clients.invitedYou')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAccept(c._id)}
                      className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity"
                    >
                      {t('clients.accept')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecline(c._id)}
                      className="px-4 py-2 rounded-lg text-sm font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                    >
                      {t('clients.decline')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
