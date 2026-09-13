import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { calculatePlates, groupPlates } from './plateMath';

/**
 * What to hang on each side of the bar for a given target.
 *
 * Rendered inline under the set it belongs to rather than behind a button:
 * the answer is three words long, and a tap to reveal it during a working set
 * is a tap the user will not spend. It disappears entirely when there is
 * nothing to say — a dumbbell exercise, or a weight below the bar — so it
 * never becomes noise on the sets it cannot help with.
 */

interface PlateCalculatorProps {
  /** The target for this set, in kg. */
  weightKg: number;
  /** The bar in use, in kg. Zero means "no bar", and hides the component. */
  barKg: number;
  /**
   * Placement, which only the set row knows: where this sits and how far it
   * is indented differ between the phone grid and the desktop row.
   */
  className?: string;
}

export function PlateCalculator({
  weightKg,
  barKg,
  className = '',
}: PlateCalculatorProps) {
  const { t } = useTranslation();

  const load = useMemo(
    () => calculatePlates(weightKg, barKg),
    [weightKg, barKg],
  );

  if (!load) return null;

  const grouped = groupPlates(load.perSide);

  return (
    <p
      className={`flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-on-surface-variant ${className}`}
    >
      <span className="font-bold uppercase tracking-wider">
        {t('workout.perSide')}
      </span>

      {grouped.length === 0 ? (
        <span className="tabular-nums">{t('workout.barOnly')}</span>
      ) : (
        grouped.map(({ weight, count }) => (
          <span
            key={weight}
            className="rounded bg-surface-container-high px-1.5 py-0.5 font-bold tabular-nums text-on-surface"
          >
            {count > 1 ? `${count}×${weight}` : weight}
          </span>
        ))
      )}

      <span className="tabular-nums opacity-70">
        {t('workout.plusBar', { weight: load.barWeight })}
      </span>

      {/* Silence here would be the dangerous case: the log would record 97.5
          for a bar that physically weighs 96.25. */}
      {load.difference !== 0 && (
        <span className="font-bold text-warning">
          {t('workout.plateShortfall', { achieved: load.achieved })}
        </span>
      )}
    </p>
  );
}
