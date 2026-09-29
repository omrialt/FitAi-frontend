import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkoutTypeInsight } from '../../../types/workout-session.types';
import { StitchIcon } from '../../common/StitchIcon';
import { Delta, TrendBadge } from './shared';
import { shortDate, typeLabel } from './labels';

/**
 * Insights per workout type — a session's `dayName`.
 *
 * `TypeOverview` is what the tab opens on: one card per type, so "which of my
 * workouts is going well" is answered before anything is chosen. Picking one
 * opens `TypeInsights`, which says in words what the numbers mean — which
 * lift is moving, which is stuck, and whether the workout is getting heavier.
 */

export function TypeOverview({
  types,
  onPick,
}: {
  types: WorkoutTypeInsight[];
  onPick: (dayName: string) => void;
}) {
  const { t, i18n } = useTranslation();

  return (
    <section>
      <header className="mb-3">
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {t('workout.history.typesTitle')}
        </h2>
        <p className="text-xs text-on-surface-variant">
          {t('workout.history.typesSubtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {types.map((type) => {
          const pickable = type.dayName !== null;
          const body = (
            <>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-on-surface">
                    {typeLabel(t, type.dayName)}
                  </h3>
                  {type.planTitles[0] && (
                    <p className="truncate text-xs text-on-surface-variant">
                      {type.planTitles.join(' · ')}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
                  {t('workout.history.sessions', { count: type.sessions })}
                </span>
              </div>

              <dl className="grid grid-cols-3 gap-2 text-center">
                <MiniStat label={t('workout.history.kpiPerWeek')}>
                  <span className="tabular-nums">{type.perWeek}</span>
                </MiniStat>
                <MiniStat label={t('workout.history.kpiVolume')}>
                  <span className="tabular-nums">
                    {type.avgVolume.toLocaleString(i18n.language)}
                  </span>
                </MiniStat>
                <MiniStat label={t('workout.history.kpiTrend')}>
                  <Delta value={type.volumeTrendPercent} unit="%" digits={0} />
                </MiniStat>
              </dl>

              <p className="mt-3 text-[11px] text-on-surface-variant">
                {t('workout.history.lastDone', {
                  date: shortDate(type.lastPerformedAt, i18n.language),
                })}
              </p>
            </>
          );

          const card =
            'block w-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 text-start shadow-sm';

          // Sessions logged without a name cannot be filtered to server-side,
          // so their card informs but does not open.
          return pickable ? (
            <button
              key={type.dayName}
              type="button"
              onClick={() => onPick(type.dayName as string)}
              className={`${card} transition-colors hover:border-primary/40 focus-visible:border-primary`}
            >
              {body}
            </button>
          ) : (
            <div key="__free" className={card}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MiniStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-surface-container-low px-1 py-2">
      <dt className="truncate text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-extrabold text-on-surface">
        {children}
      </dd>
    </div>
  );
}

export function TypeInsights({ insight }: { insight: WorkoutTypeInsight }) {
  const { t, i18n } = useTranslation();
  const name = typeLabel(t, insight.dayName);
  const kg = t('common.kg');

  const sentences: { icon: 'trending_up' | 'trending_down' | 'trending_flat' | 'warning' | 'info'; text: string }[] = [];

  if (insight.sessions < 2) {
    sentences.push({ icon: 'info', text: t('workout.history.insightNeedMore') });
  } else {
    const trend = insight.volumeTrendPercent;
    if (trend !== null) {
      if (trend >= 3) {
        sentences.push({
          icon: 'trending_up',
          text: t('workout.history.insightVolumeUp', { percent: trend }),
        });
      } else if (trend <= -3) {
        sentences.push({
          icon: 'trending_down',
          text: t('workout.history.insightVolumeDown', { percent: Math.abs(trend) }),
        });
      } else {
        sentences.push({
          icon: 'trending_flat',
          text: t('workout.history.insightVolumeFlat'),
        });
      }
    }

    const improved = insight.exercises.find((e) => e.name === insight.mostImproved);
    if (improved?.changePercent) {
      sentences.push({
        icon: 'trending_up',
        text: t('workout.history.insightImproved', {
          name: improved.name,
          percent: improved.changePercent,
        }),
      });
    }

    if (insight.stalled.length > 0) {
      sentences.push({
        icon: 'warning',
        text: t('workout.history.insightStalled', {
          names: insight.stalled.join(', '),
        }),
      });
    }

    if (insight.perWeek < 1) {
      sentences.push({ icon: 'info', text: t('workout.history.insightLowFrequency') });
    }
  }

  const iconTone = {
    trending_up: 'text-success',
    trending_down: 'text-error',
    trending_flat: 'text-on-surface-variant',
    warning: 'text-warning',
    info: 'text-primary',
  } as const;

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-on-surface">
            <StitchIcon name="insights" size={18} />
            {t('workout.history.insightsTitle', { name })}
          </h2>
          <p className="text-xs text-on-surface-variant">
            {t('workout.history.lastDone', {
              date: shortDate(insight.lastPerformedAt, i18n.language),
            })}
          </p>
        </div>
      </header>

      <dl className="mb-4 grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
        <MiniStat label={t('workout.history.kpiSessions')}>
          <span className="tabular-nums">{insight.sessions}</span>
        </MiniStat>
        <MiniStat label={t('workout.history.kpiPerWeek')}>
          <span className="tabular-nums">{insight.perWeek}</span>
        </MiniStat>
        <MiniStat label={t('workout.history.kpiDuration')}>
          {insight.avgDurationMinutes
            ? t('workout.minutesShort', { minutes: insight.avgDurationMinutes })
            : '—'}
        </MiniStat>
        <MiniStat label={t('workout.history.kpiVolume')}>
          <span className="tabular-nums">
            {insight.avgVolume.toLocaleString(i18n.language)}
          </span>
        </MiniStat>
        <MiniStat label={t('workout.history.kpiTrend')}>
          <Delta value={insight.volumeTrendPercent} unit="%" digits={0} />
        </MiniStat>
        <MiniStat label={t('workout.history.kpiRpe')}>
          <span className="tabular-nums">{insight.avgRpe ?? '—'}</span>
        </MiniStat>
      </dl>

      {sentences.length > 0 && (
        <ul className="mb-4 flex flex-col gap-2">
          {sentences.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface"
            >
              <span className={`mt-0.5 shrink-0 ${iconTone[s.icon]}`}>
                <StitchIcon name={s.icon} size={16} />
              </span>
              <span>{s.text}</span>
            </li>
          ))}
        </ul>
      )}

      {insight.exercises.length > 0 && (
        <ul className="flex flex-col divide-y divide-outline-variant/10">
          {insight.exercises.map((exercise) => (
            <li
              key={exercise.name}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {exercise.name}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {t('workout.history.sessions', { count: exercise.sessions })}
                  {exercise.bestE1rm > 0 && (
                    <>
                      {' · '}
                      <span dir="ltr" className="tabular-nums">
                        {exercise.bestSet.weight} {kg} × {exercise.bestSet.reps}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs">
                <Delta value={exercise.changePercent} unit="%" />
                <TrendBadge trend={exercise.trend} t={t} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
