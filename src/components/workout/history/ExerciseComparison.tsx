import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';

import { workoutSessionService } from '../../../services/workout-session.service';
import type { ExerciseComparison as Comparison } from '../../../types/workout-session.types';
import { StitchIcon } from '../../common/StitchIcon';
import { Delta, TrendBadge } from './shared';
import { muscleLabel, shortDate } from './labels';

/**
 * Every exercise in one muscle group, on one chart.
 *
 * The strength curve below it answers "is my bench moving"; this answers the
 * question it cannot — "is the bench moving while the incline press is not",
 * which is what decides which of the two to push and which to swap out.
 *
 * Estimated 1RM on a single axis, so a heavy double and a set of ten compare
 * honestly. At most four lines at once: the chart palette has four hues, and
 * each also carries its own dash pattern so a line is never told apart by
 * colour alone. Everything else is in the table, which is also the chart's
 * accessible view.
 */

const MAX_LINES = 4;
const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
];
const DASHES = ['0', '6 3', '2 3', '10 3 2 3'];
const WINDOWS = [90, 180, 365, 0] as const;

interface ExerciseComparisonProps {
  userId: string;
  /** Opens on this muscle group; the server picks otherwise. */
  initialMuscleGroup?: string;
}

export function ExerciseComparison({
  userId,
  initialMuscleGroup,
}: ExerciseComparisonProps) {
  const { t, i18n } = useTranslation();
  const kg = t('common.kg');

  const [muscle, setMuscle] = useState(initialMuscleGroup ?? '');
  const [windowDays, setWindowDays] = useState<number>(0);
  const [data, setData] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    workoutSessionService
      .getExerciseComparison(userId, {
        muscleGroup: muscle || undefined,
        days: windowDays || undefined,
      })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setFailed(false);
        if (!muscle && result.muscleGroup) setMuscle(result.muscleGroup);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, muscle, windowDays]);

  const exercises = useMemo(() => data?.exercises ?? [], [data]);

  // Colour follows the exercise, not its rank: a slot, once given, is kept
  // until the muscle group changes, so narrowing the window never repaints
  // the lines that remain.
  const [slots, setSlots] = useState<Record<string, number>>({});
  useEffect(() => {
    setSlots((prev) => {
      const missing = exercises.filter(
        (e) => prev[e.name.toLowerCase()] === undefined,
      );
      if (missing.length === 0) return prev;
      const next = { ...prev };
      const used = new Set(Object.values(next));
      for (const exercise of missing) {
        let slot = 0;
        while (used.has(slot)) slot += 1;
        used.add(slot);
        next[exercise.name.toLowerCase()] = slot;
      }
      return next;
    });
  }, [exercises]);
  // The filter bar above can change the muscle group; follow it.
  useEffect(() => {
    if (!initialMuscleGroup) return;
    setHidden(new Set());
    setSlots({});
    setMuscle(initialMuscleGroup);
  }, [initialMuscleGroup]);

  const slotFor = (name: string) =>
    slots[name.toLowerCase()] ?? Number.POSITIVE_INFINITY;

  // The lines drawn: the most-trained exercises, minus any the user hid, up
  // to the palette's four.
  const plotted = useMemo(
    () =>
      exercises
        .filter((e) => !hidden.has(e.name.toLowerCase()))
        .filter(
          (e) => (slots[e.name.toLowerCase()] ?? MAX_LINES) < MAX_LINES,
        ),
    [exercises, hidden, slots],
  );

  /** One row per day, one column per plotted exercise. */
  const rows = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();
    for (const exercise of plotted) {
      for (const point of exercise.points) {
        if (point.estimatedOneRepMax <= 0) continue;
        const row = byDate.get(point.date) ?? { date: point.date };
        row[exercise.name] = point.estimatedOneRepMax;
        byDate.set(point.date, row);
      }
    }
    return [...byDate.values()].sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    );
  }, [plotted]);

  const toggle = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      const key = name.toLowerCase();
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const hasChart = rows.length > 0 && plotted.length > 0;

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-on-surface">
            <StitchIcon name="query_stats" size={18} />
            {t('workout.history.exCompareTitle')}
          </h2>
          <p className="text-xs text-on-surface-variant">
            {t('workout.history.exCompareSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={muscle}
            aria-label={t('workout.history.muscleFilter')}
            onChange={(e) => {
              setHidden(new Set());
              setSlots({});
              setMuscle(e.target.value);
            }}
            disabled={!data?.availableMuscleGroups.length}
            className="h-10 max-w-[12rem] rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-sm text-on-surface outline-none focus:border-primary disabled:opacity-50"
          >
            {!data?.availableMuscleGroups.length && <option value="">—</option>}
            {data?.availableMuscleGroups.map((group) => (
              <option key={group} value={group}>
                {muscleLabel(t, group)}
              </option>
            ))}
          </select>

          <div className="flex overflow-hidden rounded-lg border border-outline-variant/30">
            {WINDOWS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setWindowDays(days)}
                aria-pressed={windowDays === days}
                className={`min-h-10 px-3 text-xs font-bold transition-colors ${
                  windowDays === days
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {days === 0
                  ? t('workout.windowAll')
                  : t('workout.windowMonths', { months: Math.round(days / 30) })}
              </button>
            ))}
          </div>
        </div>
      </header>

      {failed ? (
        <p className="py-10 text-center text-sm text-on-surface-variant">
          {t('workout.history.exCompareFailed')}
        </p>
      ) : loading && !data ? (
        <div
          className="h-[260px] animate-pulse rounded-lg bg-surface-container-low"
          aria-hidden="true"
        />
      ) : exercises.length === 0 ? (
        <p className="py-10 text-center text-sm text-on-surface-variant">
          {t('workout.history.exCompareEmpty')}
        </p>
      ) : (
        <div className={loading ? 'opacity-60 transition-opacity' : undefined}>
          {/* Legend doubles as the show/hide control. Always present with
              two or more series, and it carries the dash pattern too. */}
          <ul className="mb-3 flex flex-wrap gap-2">
            {exercises.map((exercise) => {
              const slot = slotFor(exercise.name);
              const shown = plotted.some((p) => p.name === exercise.name);
              const drawable = slot < MAX_LINES;
              return (
                <li key={exercise.name}>
                  <button
                    type="button"
                    onClick={() => toggle(exercise.name)}
                    aria-pressed={shown}
                    disabled={!drawable}
                    className={`flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors ${
                      shown
                        ? 'border-outline-variant/40 bg-surface-container-low text-on-surface'
                        : 'border-outline-variant/20 text-on-surface-variant/70'
                    } disabled:cursor-default`}
                  >
                    {drawable && (
                      <svg width="18" height="6" aria-hidden="true">
                        <line
                          x1="0"
                          y1="3"
                          x2="18"
                          y2="3"
                          stroke={shown ? COLORS[slot] : 'currentColor'}
                          strokeWidth="2"
                          strokeDasharray={DASHES[slot]}
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    {exercise.name}
                  </button>
                </li>
              );
            })}
          </ul>

          {hasChart && (
            <div className="h-[260px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={rows}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-chart-grid)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d: string) => shortDate(d, i18n.language)}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                    tick={{ fill: 'var(--color-chart-axis)', fontSize: 10 }}
                  />
                  <YAxis
                    width={44}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tick={{ fill: 'var(--color-chart-axis)', fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--color-chart-grid)' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high px-3 py-2 text-xs shadow-lg">
                          <p className="mb-1 font-bold text-on-surface">
                            {shortDate(String(label), i18n.language)}
                          </p>
                          {payload.map((entry) => (
                            <p
                              key={String(entry.dataKey)}
                              className="flex items-center gap-2 tabular-nums text-on-surface-variant"
                            >
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ background: entry.color }}
                                aria-hidden="true"
                              />
                              {String(entry.dataKey)}: {String(entry.value)} {kg}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  {plotted.map((exercise) => {
                    const slot = slotFor(exercise.name);
                    return (
                      <Line
                        key={exercise.name}
                        type="monotone"
                        dataKey={exercise.name}
                        stroke={COLORS[slot]}
                        strokeWidth={2}
                        strokeDasharray={DASHES[slot]}
                        // Days one lift was trained and another was not are
                        // gaps in the data, not drops to zero.
                        connectNulls
                        dot={{
                          r: 3,
                          fill: COLORS[slot],
                          stroke: 'var(--color-surface-container-lowest)',
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* The table view: every exercise, charted or not. */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-start text-xs">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="py-2 pe-2 text-start">{t('workout.history.colExercise')}</th>
                  <th className="px-2 py-2 text-start">{t('workout.history.colBest')}</th>
                  <th className="px-2 py-2 text-start">{t('workout.history.colChange')}</th>
                  <th className="py-2 ps-2 text-start">{t('workout.history.colSessions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {exercises.map((exercise) => (
                  <tr key={exercise.name} className="text-on-surface">
                    <td className="py-2.5 pe-2">
                      <span className="block font-semibold">{exercise.name}</span>
                      <TrendBadge trend={exercise.trend} t={t} />
                    </td>
                    <td className="px-2 py-2.5">
                      {exercise.bestE1rm > 0 ? (
                        <>
                          <span className="block font-bold tabular-nums">
                            {exercise.bestE1rm} {kg}
                          </span>
                          <span dir="ltr" className="text-on-surface-variant tabular-nums">
                            {exercise.bestSet.weight} {kg} × {exercise.bestSet.reps}
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <Delta value={exercise.changePercent} unit="%" />
                    </td>
                    <td className="py-2.5 ps-2 tabular-nums">
                      {exercise.sessions}
                      <span className="block text-on-surface-variant">
                        {shortDate(exercise.lastPerformedAt, i18n.language)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
