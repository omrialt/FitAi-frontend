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
        <span>{t('workout.barOnly')}</span>
      ) : (
        grouped.map(({ weight, count }) => (
          <span
            key={weight}
            className="rounded bg-surface-container-high px-1.5 py-0.5 font-bold text-on-surface"
          >
            {/* Count first in the reading direction: "2×20" reads as two
                twenties from the right in Hebrew and from the left in English.
                Pinning it LTR (or giving it the numeric class, which isolates
                a digits-only run as LTR) made Hebrew read it "20×2". */}
            {count > 1 ? `${count}×${weight}` : weight}
          </span>
        ))
      )}

      {/* No tabular-nums: the line is Hebrew with a number in it, and the
          figure is isolated in the string itself. */}
      <span className="opacity-70">
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
