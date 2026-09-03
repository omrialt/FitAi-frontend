import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon, type StitchIconName } from '../common/StitchIcon';
import { workoutSessionService } from '../../services/workout-session.service';
import type {
  OverloadAction,
  OverloadPlan,
  OverloadSuggestion,
} from '../../types/workout-session.types';

/**
 * What to do next session, per lift.
 *
 * The card the disabled "apply suggestion" button has been promising since the
 * first revision of the gap analysis. It is not AI and does not pretend to be:
 * every number here is derived from the user's own log, which is why it renders
 * offline and why the reason for each suggestion can be stated in one line.
 *
 * Stating the reason is the whole design. "Squat: 102.5kg x 5" on its own is an
 * instruction from nowhere, and an instruction from nowhere gets ignored the
 * first time it feels wrong. "You hit 8 reps on every set at 100kg" is a claim
 * the user can check against the session they remember doing.
 */

const ACTION_STYLE: Record<
  OverloadAction,
  { icon: StitchIconName; tone: string; chip: string }
> = {
  add_weight: {
    icon: 'trending_up',
    tone: 'text-success',
    chip: 'bg-success-container text-on-success-container',
  },
  add_reps: {
    icon: 'trending_flat',
    tone: 'text-info',
    chip: 'bg-info-container text-on-info-container',
  },
  hold: {
    icon: 'trending_down',
    tone: 'text-warning',
    chip: 'bg-warning-container text-on-warning-container',
  },
};

function Suggestion({ suggestion }: { suggestion: OverloadSuggestion }) {
  const { t } = useTranslation();
  const style = ACTION_STYLE[suggestion.action];

  return (
    <li className="flex flex-col gap-1 rounded-lg border border-outline-variant/20 p-3">
      <div className="flex items-center gap-2">
        <StitchIcon name={style.icon} size={16} />
        <span className="flex-1 text-sm font-bold text-on-surface">
          {suggestion.exercise}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${style.chip}`}
        >
          {t(`workout.overloadAction_${suggestion.action}`)}
        </span>
      </div>

      <p className={`text-sm font-extrabold ${style.tone}`}>
        {/* Bodyweight lifts have no load to prescribe, so the target reads as
            reps alone rather than as "0 kg x 9", which is not a thing. */}
        {suggestion.incrementKg === 0 && suggestion.suggested.weight === 0
          ? t('workout.overloadTargetReps', {
              sets: suggestion.suggested.sets,
              reps: suggestion.suggested.reps,
            })
          : t('workout.overloadTarget', {
              sets: suggestion.suggested.sets,
              reps: suggestion.suggested.reps,
              weight: suggestion.suggested.weight,
            })}
      </p>

      {/* The evidence. A suggestion the user cannot argue with is one they
          cannot trust. */}
      <p className="text-xs text-on-surface-variant">
        {t(`workout.overloadReason_${suggestion.reason}`, {
          weight: suggestion.lastTopSet.weight,
          reps: suggestion.lastTopSet.reps,
          sets: suggestion.lastTopSet.sets,
          max: suggestion.repRange.max,
          min: suggestion.repRange.min,
          rpe: suggestion.lastRpe ?? 0,
        })}
      </p>
    </li>
  );
}

export function OverloadCard({
  userId,
  exercise,
  limit = 4,
}: {
  userId: string;
  /** Narrows to one lift — the session screen passes the exercise being done. */
  exercise?: string;
  limit?: number;
}) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState<OverloadPlan | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    workoutSessionService
      .getOverload(userId, { exercise, limit })
      .then((result) => {
        if (!cancelled) setPlan(result);
      })
      // Supporting information, never a reason to interrupt the page.
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, exercise, limit]);

  if (failed || !plan) return null;

  // Nothing to say until an exercise has been logged twice. An empty card
  // explaining why would be noise on a screen the user is still filling.
  if (plan.suggestions.length === 0) return null;

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
      <header className="mb-1 flex items-center gap-2">
        <StitchIcon name="fitness_center" size={18} />
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {t('workout.overloadTitle')}
        </h2>
      </header>

      <p className="mb-4 text-xs text-on-surface-variant">
        {t('workout.overloadSubtitle')}
      </p>

      {/* Said once at the top rather than repeated on every row. When the
          fatigue signal says deload, every suggestion below is "hold", and the
          user deserves the reason before the list rather than four times
          inside it. */}
      {plan.deloadRecommended && (
        <p className="mb-3 rounded-lg bg-warning-container px-3 py-2 text-xs font-bold text-on-warning-container">
          {t('workout.overloadDeloading')}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {plan.suggestions.map((suggestion) => (
          <Suggestion key={suggestion.exercise} suggestion={suggestion} />
        ))}
      </ul>
    </section>
  );
}
