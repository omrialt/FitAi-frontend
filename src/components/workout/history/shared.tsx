import type { TFunction } from 'i18next';
import type { ExerciseTrend } from '../../../types/workout-session.types';
import { StitchIcon } from '../../common/StitchIcon';

/** Small pieces the history panels share: a trend badge and a signed delta. */

const TREND_STYLE: Record<ExerciseTrend, { className: string; icon: 'trending_up' | 'trending_flat' | 'trending_down' | 'add' }> = {
  improving: {
    className: 'bg-success-container text-on-success-container',
    icon: 'trending_up',
  },
  stalled: {
    className: 'bg-warning-container text-on-warning-container',
    icon: 'trending_flat',
  },
  declining: {
    className: 'bg-error-container text-on-error-container',
    icon: 'trending_down',
  },
  new: {
    className: 'bg-surface-container-high text-on-surface-variant',
    icon: 'add',
  },
};

export function TrendBadge({ trend, t }: { trend: ExerciseTrend; t: TFunction }) {
  const style = TREND_STYLE[trend];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${style.className}`}
    >
      <StitchIcon name={style.icon} size={12} />
      {t(`workout.history.trend_${trend}`)}
    </span>
  );
}

/**
 * A signed change, coloured by direction. `dir="ltr"` so the sign stays in
 * front of the number inside a right-to-left sentence.
 */
export function Delta({
  value,
  unit = '',
  digits = 1,
}: {
  value: number | null;
  unit?: string;
  digits?: number;
}) {
  if (value === null || Number.isNaN(value)) {
    return <span className="text-on-surface-variant">—</span>;
  }
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  const tone =
    rounded > 0
      ? 'text-success'
      : rounded < 0
        ? 'text-error'
        : 'text-on-surface-variant';
  return (
    <span dir="ltr" className={`font-bold tabular-nums ${tone}`}>
      {rounded > 0 ? '+' : ''}
      {rounded}
      {unit}
    </span>
  );
}

