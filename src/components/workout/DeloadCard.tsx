import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { workoutSessionService } from '../../services/workout-session.service';
import type { DeloadPrescription } from '../../types/workout-session.types';

/**
 * What backing off would actually look like.
 *
 * The fatigue card has said the word "deload" since round 6, and a word is
 * where that feature stopped: a user reading it still had to decide what it
 * meant for Monday, and most decided it meant nothing. This is the same signal
 * expressed as a session — kilos and sets, per lift, that someone can walk into
 * a gym and perform.
 *
 * `watch` renders the same numbers without the recommendation, which is the
 * difference between an alarm and an option. `insufficient` renders nothing at
 * all: a prescription from a signal that admits it knows nothing is exactly the
 * filler the fatigue detector was written to avoid.
 */
export function DeloadCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [prescription, setPrescription] = useState<DeloadPrescription | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    workoutSessionService
      .getDeload(userId)
      .then((result) => {
        if (!cancelled) setPrescription(result);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Covers `ok` and `insufficient` alike: both come back with no exercises,
  // and neither is worth a card.
  if (!prescription || prescription.exercises.length === 0) return null;

  const urgent = prescription.recommended;

  return (
    <section
      className={`rounded-xl border bg-surface-container-lowest p-5 ${
        urgent ? 'border-warning/60' : 'border-outline-variant/20'
      }`}
    >
      <header className="mb-1 flex items-center gap-2">
        <StitchIcon name={urgent ? 'warning' : 'timer'} size={18} />
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {t('workout.deloadTitle')}
        </h2>
      </header>

      <p
        className={`mb-4 text-sm font-bold ${
          urgent ? 'text-warning' : 'text-on-surface-variant'
        }`}
      >
        {t(urgent ? 'workout.deloadRecommended' : 'workout.deloadOptional', {
          load: prescription.loadPercent,
          volume: prescription.volumePercent,
          days: prescription.durationDays,
        })}
      </p>

      <ul className="flex flex-col gap-2">
        {prescription.exercises.map((exercise) => (
          <li
            key={exercise.exercise}
            className="flex items-center gap-3 rounded-lg border border-outline-variant/20 p-3"
          >
            <span className="flex-1 text-sm font-bold text-on-surface">
              {exercise.exercise}
            </span>

            {/* Both numbers, side by side. Showing only the target would make
                the user work out what changed; showing the change is the
                point of the card. */}
            <span className="text-xs text-on-surface-variant line-through">
              {t('workout.deloadSetLine', {
                sets: exercise.from.sets,
                reps: exercise.from.reps,
                weight: exercise.from.weight,
              })}
            </span>
            <StitchIcon name="arrow_forward" size={14} />
            <span className="text-sm font-extrabold text-on-surface">
              {t('workout.deloadSetLine', {
                sets: exercise.to.sets,
                reps: exercise.to.reps,
                weight: exercise.to.weight,
              })}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-on-surface-variant">
        {t('workout.deloadFootnote')}
      </p>
    </section>
  );
}
