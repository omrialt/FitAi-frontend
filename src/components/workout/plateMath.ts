/**
 * Barbell loading maths for the workout logger.
 *
 * The question this answers is the one asked while standing at the rack: the
 * plan says 97.5kg — what goes on each side? Doing it in your head between
 * sets is where loading mistakes come from, and a mis-loaded bar quietly
 * corrupts the training log it feeds.
 *
 * Two decisions worth stating:
 *   - everything is computed in grams as integers. Plate sets are full of
 *     halves and quarters (2.5, 1.25, 0.5) and repeatedly subtracting them as
 *     floats drifts into 0.30000000000000004 territory, which then renders as
 *     a plate that does not exist;
 *   - a target the plates cannot reach exactly is not an error. The bar is
 *     loaded as close as possible from below and the shortfall is reported, so
 *     the screen can say "97.5 is not loadable, this is 96.25" instead of
 *     silently rounding and lying about what was lifted.
 */

/** Standard Olympic bar. Overridable — not every gym's bar is 20kg. */
export const DEFAULT_BAR_KG = 20;

/**
 * A common commercial-gym set, heaviest first. Availability is assumed
 * unlimited: a gym that has one pair of 20s usually has several, and modelling
 * scarcity would need inventory the app does not have.
 */
export const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];

/** Bar options offered in the UI. 15kg is the women's bar, 10kg a training bar. */
export const BAR_OPTIONS_KG = [20, 15, 10, 7.5, 0];

export interface PlateLoad {
  /** Plates for ONE side of the bar, heaviest first. */
  perSide: number[];
  /** What the loaded bar actually weighs — may be under the target. */
  achieved: number;
  /** `achieved - target`. Zero when the target is loadable exactly. */
  difference: number;
  barWeight: number;
}

const g = (kg: number) => Math.round(kg * 1000);

/**
 * Plates for one side of the bar, or `null` when the question does not apply:
 * a target below the bar, a non-positive bar, or a target that leaves an odd
 * remainder no plate can fill.
 *
 * Greedy from the heaviest plate down. With the denominations above greedy is
 * also the fewest-plates answer; with an exotic set it might use one plate more
 * than optimal, which is not worth a knapsack solver on a phone between sets.
 */
export function calculatePlates(
  targetKg: number,
  barKg: number = DEFAULT_BAR_KG,
  availableKg: number[] = DEFAULT_PLATES_KG,
): PlateLoad | null {
  if (!Number.isFinite(targetKg) || !Number.isFinite(barKg)) return null;
  if (barKg <= 0) return null;
  if (targetKg < barKg) return null;

  // Halved before anything else: the bar carries the same load on both sides,
  // and an odd half-kilo that no plate pair can express is a property of the
  // per-side number, not of the total.
  const perSideTarget = (g(targetKg) - g(barKg)) / 2;
  if (perSideTarget < 0) return null;

  const plates = [...availableKg]
    .filter((p) => p > 0)
    .sort((a, b) => b - a)
    .map(g);

  const perSide: number[] = [];
  let remaining = perSideTarget;

  for (const plate of plates) {
    while (remaining >= plate) {
      remaining -= plate;
      perSide.push(plate / 1000);
      // A bar cannot physically hold more than this, and an unreachable
      // remainder must not spin here forever.
      if (perSide.length >= 12) break;
    }
    if (perSide.length >= 12) break;
  }

  const achieved = (g(barKg) + (perSideTarget - remaining) * 2) / 1000;

  return {
    perSide,
    achieved,
    difference: Math.round((achieved - targetKg) * 1000) / 1000,
    barWeight: barKg,
  };
}

/**
 * Collapses `[20, 20, 5]` into `[{ weight: 20, count: 2 }, …]`.
 *
 * Kept separate from the maths so the display can group without the solver
 * having to know how it will be rendered.
 */
export function groupPlates(perSide: number[]): { weight: number; count: number }[] {
  const grouped: { weight: number; count: number }[] = [];

  for (const plate of perSide) {
    const last = grouped[grouped.length - 1];
    if (last && last.weight === plate) {
      last.count += 1;
    } else {
      grouped.push({ weight: plate, count: 1 });
    }
  }

  return grouped;
}
