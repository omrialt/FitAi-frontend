import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Dot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';

import { workoutSessionService } from '../../services/workout-session.service';
import type { ExerciseHistoryPoint } from '../../types/workout-session.types';

/**
 * One exercise's strength over time.
 *
 * The dashboard already answers "what is my best squat". The question that
 * changes what you do next week is whether that number has moved since May,
 * and a single figure cannot show a plateau. This is that missing view.
 *
 * Plotted on estimated 1RM rather than raw weight, for the same reason the
 * personal-bests card ranks that way: a heavy double and a hard set of eight
 * are otherwise incomparable, and a curve that jumps whenever the rep scheme
 * changes describes the programme, not the lifter.
 */

const WINDOWS = [90, 180, 365, 0] as const;

interface StrengthCurveProps {
  userId: string;
  /** Opens on this exercise; falls back to the most-trained one. */
  initialExercise?: string;
}

interface TooltipEntry {
  payload: ExerciseHistoryPoint;
}

export function StrengthCurve({ userId, initialExercise }: StrengthCurveProps) {
  const { t, i18n } = useTranslation();

  const [exercise, setExercise] = useState(initialExercise ?? '');
  const [available, setAvailable] = useState<string[]>([]);
  const [points, setPoints] = useState<ExerciseHistoryPoint[]>([]);
  const [windowDays, setWindowDays] = useState<number>(180);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const history = await workoutSessionService.getExerciseHistory(userId, {
          name: exercise || undefined,
          days: windowDays || undefined,
        });
        if (cancelled) return;

        setPoints(history.points);
        setAvailable(history.availableExercises);
        // The server resolves "no exercise given" to the most-trained one;
        // adopting its answer keeps the picker in step with the chart.
        if (!exercise && history.exercise) setExercise(history.exercise);
        setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, exercise, windowDays]);

  const formatDay = useCallback(
    (iso: string) =>
      new Date(`${iso}T12:00:00`).toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'short',
      }),
    [i18n.language],
  );

  /** A curve of one point is a dot; the axis needs room around it to read. */
  const domain = useMemo<[number, number]>(() => {
    if (points.length === 0) return [0, 1];
    const values = points.map((p) => p.estimatedOneRepMax);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(2.5, (max - min) * 0.15);
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
  }, [points]);

  const change = useMemo(() => {
    if (points.length < 2) return null;
    const first = points[0].estimatedOneRepMax;
    const last = points[points.length - 1].estimatedOneRepMax;
    return Math.round((last - first) * 10) / 10;
  }, [points]);

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold tracking-tight text-on-surface">
            {t('workout.strengthCurve')}
          </h2>
          {change !== null && (
            <p className="text-xs text-on-surface-variant">
              {t(change >= 0 ? 'workout.curveGain' : 'workout.curveLoss', {
                amount: Math.abs(change),
              })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={exercise}
            aria-label={t('workout.pickExercise')}
            onChange={(e) => setExercise(e.target.value)}
            disabled={available.length === 0}
            className="h-10 max-w-[12rem] rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-sm text-on-surface outline-none focus:border-primary disabled:opacity-50"
          >
            {available.length === 0 && <option value="">—</option>}
            {available.map((name) => (
              <option key={name} value={name}>
                {name}
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
          {t('workout.curveFailed')}
        </p>
      ) : loading ? (
        <div
          className="h-[260px] animate-pulse rounded-lg bg-surface-container-low"
          aria-hidden="true"
        />
      ) : points.length === 0 ? (
        <p className="py-10 text-center text-sm text-on-surface-variant">
          {t('workout.curveEmpty')}
        </p>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="strengthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-chart-grid)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fill: 'var(--color-chart-axis)', fontSize: 10 }}
              />
              <YAxis
                domain={domain}
                width={44}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-chart-axis)', fontSize: 10 }}
              />
              <Tooltip
                cursor={{ stroke: 'var(--color-chart-grid)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = (payload as unknown as TooltipEntry[])[0]
                    .payload;

                  return (
                    <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high px-3 py-2 text-xs shadow-lg">
                      <p className="font-bold text-on-surface">
                        {formatDay(point.date)}
                      </p>
                      <p className="tabular-nums text-on-surface-variant">
                        {t('workout.curveBestSet', {
                          weight: point.weight,
                          reps: point.reps,
                        })}
                      </p>
                      <p className="tabular-nums text-on-surface-variant">
                        {t('workout.curveEstimated', {
                          value: point.estimatedOneRepMax,
                        })}
                      </p>
                      <p className="tabular-nums text-on-surface-variant">
                        {t('workout.volume', {
                          volume: Math.round(point.volume),
                        })}
                      </p>
                      {point.isPersonalBest && (
                        <p className="font-bold text-primary">
                          {t('workout.curvePersonalBest')}
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              <Area
                type="monotone"
                dataKey="estimatedOneRepMax"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#strengthFill)"
                // Only the days that set a record get a marker. A dot on every
                // session turns a year of training into noise.
                dot={(props: {
                  cx?: number;
                  cy?: number;
                  index?: number;
                  payload?: ExerciseHistoryPoint;
                }) =>
                  props.payload?.isPersonalBest ? (
                    <Dot
                      key={props.index}
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="var(--color-chart-1)"
                      stroke="var(--color-surface-container-lowest)"
                      strokeWidth={2}
                    />
                  ) : (
                    <g key={props.index} />
                  )
                }
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
