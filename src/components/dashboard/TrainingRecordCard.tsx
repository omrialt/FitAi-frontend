import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { WorkoutStats } from '../../types/workout-session.types';

/**
 * Streak, adherence and personal bests — the payoff of moving workout history
 * into its own collection. None of these three numbers were answerable while
 * performed sets lived inside the plan document.
 *
 * Adherence is shown as a bar rather than a bare percentage because the useful
 * comparison is against the plan, not against 100: "8 of 12" says more than
 * "67%" on its own, so both are present.
 */
export function TrainingRecordCard({ stats }: { stats: WorkoutStats | null }) {
  const { t } = useTranslation();

  const streak = stats?.streak;
  const adherence = stats?.adherence;
  const bests = stats?.personalBests ?? [];

  const hasHistory = (streak?.totalWorkoutDays ?? 0) > 0;

  return (
    <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <StitchIcon name="insights" size={18} />
        </div>
        <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
          {t('workout.trainingRecord')}
        </h3>
        {/* These are summaries; the sessions behind them live one click away */}
        <Link
          to="/workout-history"
          className="ms-auto text-xs font-bold text-primary hover:underline"
        >
          {t('workout.viewHistory')}
        </Link>
      </div>

      {!hasHistory ? (
        <p className="text-sm text-on-surface-variant">
          {t('workout.noHistoryYet')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-container-low p-4">
                <p className="text-2xl font-black tabular-nums text-on-surface">
                  {streak?.currentWeeks ?? 0}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {t('workout.currentStreak')}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant/80">
                  {t('workout.bestStreak', { weeks: streak?.longestWeeks ?? 0 })}
                </p>
              </div>
              <div className="rounded-lg bg-surface-container-low p-4">
                <p className="text-2xl font-black tabular-nums text-on-surface">
                  {streak?.totalWorkoutDays ?? 0}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {t('workout.totalWorkouts')}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {t('workout.adherence')}
                </p>
                <p className="text-sm font-black tabular-nums text-on-surface">
                  {adherence?.percent == null
                    ? t('common.none')
                    : `${adherence.percent}%`}
                </p>
              </div>

              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
                role="img"
                aria-label={
                  adherence?.percent == null
                    ? t('workout.noActivePlan')
                    : t('workout.plannedVsDone', {
                        completed: adherence.completed,
                        planned: adherence.planned,
                      })
                }
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${adherence?.percent ?? 0}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-on-surface-variant">
                {adherence?.percent == null
                  ? t('workout.noActivePlan')
                  : t('workout.plannedVsDoneWindow', {
                      completed: adherence.completed,
                      planned: adherence.planned,
                      days: adherence.windowDays,
                    })}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {t('workout.personalBests')}
            </p>

            {bests.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                {t('workout.noPersonalBests')}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {bests.slice(0, 5).map((best) => (
                  <li key={best.exercise}>
                    {/* A best is the start of a question, not the end of one:
                        the next thing you want is whether it is still moving,
                        so each row opens that lift's curve. */}
                    <Link
                      to={`/workout-history?exercise=${encodeURIComponent(best.exercise)}`}
                      className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2 transition-colors hover:bg-surface-container-high"
                    >
                      <span className="min-w-0 truncate text-sm font-semibold text-on-surface">
                        {best.exercise}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-black tabular-nums text-on-surface">
                        {best.weight}
                        <span className="font-bold text-on-surface-variant">
                          {t('common.kg')} × {best.reps}
                        </span>
                        <StitchIcon name="chevron_left" size={14} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
