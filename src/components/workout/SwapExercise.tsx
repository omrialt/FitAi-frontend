import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { exerciseService } from '../../services/exercise.service';
import { EQUIPMENT } from '../../types/exercise.types';
import type { Exercise, Equipment } from '../../types/exercise.types';

/**
 * "The rack is taken" — swap an exercise mid-workout.
 *
 * The gap analysis filed this under the AI tier. It needs no model: the
 * catalogue knows which muscle each exercise trains, so "something else for
 * the same muscle" is a query. What made it expensive before was that
 * `muscleGroup` was free text and nothing could be grouped by it.
 *
 * Two decisions carry the feature:
 *   - the swap changes **this session only**, never the plan. The workout
 *     deviated from the plan, which is exactly why sessions are their own
 *     collection; editing the plan because the bench was busy once would be
 *     the old bug in a new place;
 *   - an exercise the catalogue does not recognise shows no button at all,
 *     rather than a button that opens an empty list. Nothing offered beats
 *     something wrong, and a plan full of free text is normal.
 */

interface SwapExerciseProps {
  /** The name exactly as the plan stores it. */
  exerciseName: string;
  onSwap: (next: { name: string; muscleGroup?: string }) => void;
}

export function SwapExercise({ exerciseName, onSwap }: SwapExerciseProps) {
  const { t, i18n } = useTranslation();
  const isHebrew = i18n.language.startsWith('he');

  const [open, setOpen] = useState(false);
  const [known, setKnown] = useState<boolean | null>(null);
  const [alternatives, setAlternatives] = useState<Exercise[]>([]);
  const [equipment, setEquipment] = useState<Equipment | ''>('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const label = useCallback(
    (exercise: Exercise) => (isHebrew ? exercise.nameHe : exercise.nameEn),
    [isHebrew],
  );

  /**
   * Probed once on mount, before the button is drawn.
   *
   * Deciding after the tap would mean a control that sometimes opens onto
   * nothing, and the answer is cheap and cacheable.
   */
  useEffect(() => {
    let cancelled = false;

    exerciseService
      .substitutes(exerciseName)
      .then((result) => {
        if (cancelled) return;
        setKnown(result.matched !== null);
        setAlternatives(result.alternatives);
      })
      .catch(() => {
        // An unreachable catalogue hides the button; it never blocks logging.
        if (!cancelled) setKnown(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exerciseName]);

  const applyFilter = useCallback(
    async (next: Equipment | '') => {
      setEquipment(next);
      setLoading(true);
      setFailed(false);
      try {
        const result = await exerciseService.substitutes(
          exerciseName,
          next || undefined,
        );
        setAlternatives(result.alternatives);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [exerciseName],
  );

  if (known !== true) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-outline-variant/40 px-3 text-xs font-bold text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <StitchIcon name="sync" size={14} />
        {t('workout.swapExercise')}
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-outline-variant/20 bg-surface-container-low p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {t('workout.swapEquipment')}
            </span>
            <select
              value={equipment}
              aria-label={t('workout.swapEquipment')}
              onChange={(e) => applyFilter(e.target.value as Equipment | '')}
              className="h-9 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-xs text-on-surface outline-none focus:border-primary"
            >
              <option value="">{t('workout.swapAnyEquipment')}</option>
              {EQUIPMENT.map((item) => (
                <option key={item} value={item}>
                  {t(`exercises.equipment_${item}`)}
                </option>
              ))}
            </select>
          </div>

          {failed ? (
            <p className="py-2 text-xs text-on-surface-variant">
              {t('workout.swapFailed')}
            </p>
          ) : loading ? (
            <p className="py-2 text-xs text-on-surface-variant">
              {t('common.loading')}
            </p>
          ) : alternatives.length === 0 ? (
            <p className="py-2 text-xs text-on-surface-variant">
              {t('workout.swapNoneForEquipment')}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {alternatives.map((exercise) => (
                <li key={exercise.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      onSwap({
                        name: label(exercise),
                        muscleGroup: t(
                          `exercises.muscle_${exercise.primaryMuscle}`,
                        ),
                      });
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-start text-sm text-on-surface transition-colors hover:bg-primary/10"
                  >
                    <span className="min-w-0 truncate font-semibold">
                      {label(exercise)}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {t(`exercises.equipment_${exercise.equipment}`)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Said plainly, because the opposite would be a reasonable guess. */}
          <p className="mt-2 text-[10px] text-on-surface-variant">
            {t('workout.swapSessionOnly')}
          </p>
        </div>
      )}
    </div>
  );
}
