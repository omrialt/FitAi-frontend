import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { workoutSessionService } from '../../services/workout-session.service';
import type { FatigueSignal } from '../../types/workout-session.types';

/**
 * Whether the last two weeks look like accumulating fatigue.
 *
 * Deliberately quiet. It says nothing at all while the log is too short to
 * support a verdict, and says "steady" rather than congratulating anyone when
 * nothing is wrong — a card that shouts every week is a card people stop
 * reading, and this one only earns attention by being rare.
 *
 * The reasons come from the server as codes, not sentences, so the wording
 * lives with the rest of the copy and both languages stay in step.
 */

const TONE: Record<
  FatigueSignal['level'],
  { border: string; text: string; icon: 'check' | 'timer' | 'warning' }
> = {
  insufficient: { border: 'border-outline-variant/10', text: 'text-on-surface-variant', icon: 'timer' },
  ok: { border: 'border-success/30', text: 'text-success', icon: 'check' },
  watch: { border: 'border-warning/40', text: 'text-warning', icon: 'timer' },
  deload: { border: 'border-warning/60', text: 'text-warning', icon: 'warning' },
};

export function FatigueCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [signal, setSignal] = useState<FatigueSignal | null>(null);

  useEffect(() => {
    let cancelled = false;

    workoutSessionService
      .getFatigue(userId)
      .then((result) => {
        if (!cancelled) setSignal(result);
      })
      // A card that cannot load is a card that is not shown. This is
      // supporting information, never something to interrupt the dashboard for.
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Nothing to say yet, and saying "not enough data" on an empty dashboard
  // would only add noise to a screen the user is still filling.
  if (!signal || signal.level === 'insufficient') return null;

  const tone = TONE[signal.level];

  return (
    <section
      className={`rounded-xl border ${tone.border} bg-surface-container-lowest p-5`}
    >
      <header className="mb-2 flex items-center gap-2">
        <StitchIcon name={tone.icon} size={18} />
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {t('workout.fatigueTitle')}
        </h2>
      </header>

      <p className={`text-sm font-bold ${tone.text}`}>
        {t(`workout.fatigue_${signal.level}`)}
      </p>

      {signal.reasons.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {signal.reasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2 text-sm text-on-surface-variant"
            >
              <span aria-hidden="true" className="text-on-surface-variant">
                ·
              </span>
              {t(`workout.fatigueReason_${reason}`, {
                percent: Math.abs(signal.volumeChangePercent ?? 0),
                recent: signal.recentRpe ?? 0,
                baseline: signal.baselineRpe ?? 0,
              })}
            </li>
          ))}
        </ul>
      )}

      {/* The window is stated so the number can be argued with. A signal the
          user cannot check is a signal they cannot trust. */}
      <p className="mt-3 text-xs text-on-surface-variant">
        {t('workout.fatigueWindow', {
          recent: signal.recentSessions,
          baseline: signal.baselineSessions,
        })}
      </p>
    </section>
  );
}
