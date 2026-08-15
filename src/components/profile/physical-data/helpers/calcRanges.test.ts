import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  calculateAge,
  calculateBMIRanges,
  calculateWeightRanges,
  calculateBodyFatRanges,
  type RangeSegment,
} from './calcRanges';

describe('calculateAge', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /** Freeze "today" so these assertions do not rot on the next birthday. */
  const on = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  it('counts full years', () => {
    on('2026-08-11T12:00:00Z');
    expect(calculateAge('1996-08-11')).toBe(30);
  });

  // The off-by-one this guards: subtracting years alone would say 30 for
  // someone whose birthday has not happened yet this year.
  it('does not count a birthday that has not happened yet this year', () => {
    on('2026-08-11T12:00:00Z');
    expect(calculateAge('1996-08-12')).toBe(29);
    expect(calculateAge('1996-12-31')).toBe(29);
  });

  it('counts a birthday earlier this year', () => {
    on('2026-08-11T12:00:00Z');
    expect(calculateAge('1996-01-01')).toBe(30);
  });
});

describe('range calculations', () => {
  /**
   * Bands must climb, must not overlap, and must not leave gaps: each one
   * starts exactly where the previous ended.
   *
   * The earlier version of this helper asserted only "ascending and disjoint",
   * with a comment explaining that the gaps were inherited from how clinical
   * categories are written down (Normal ends 24.9, Overweight starts 25). That
   * kept a real defect passing: a BMI of 24.95, or a body fat of 13.5%, landed
   * in no band and rendered with no label or colour. The bands are half-open
   * now — `min <= v < max` — so every value belongs to exactly one.
   */
  const isContiguous = (ranges: RangeSegment[]) =>
    ranges.every(
      (r, i) => r.max > r.min && (i === 0 || r.min === ranges[i - 1].max),
    );

  /** The band a value would render in; undefined means it falls through. */
  const bandFor = (ranges: RangeSegment[], value: number) =>
    ranges.find((r) => value >= r.min && value < r.max);

  /** Every value across a table's span must land in exactly one band. */
  const coversSpan = (ranges: RangeSegment[]) => {
    const lo = ranges[0].min;
    const hi = ranges[ranges.length - 1].max;
    // Tenths, because the gaps this guards against were fractions of a unit.
    for (let v = lo; v < hi; v = Math.round((v + 0.1) * 10) / 10) {
      if (ranges.filter((r) => v >= r.min && v < r.max).length !== 1) {
        return false;
      }
    }
    return true;
  };

  it('produces ordered, gap-free BMI bands', () => {
    const { ranges } = calculateBMIRanges();

    expect(ranges.length).toBeGreaterThan(0);
    expect(isContiguous(ranges)).toBe(true);
    expect(coversSpan(ranges)).toBe(true);
  });

  // The exact value from the gap analysis: it previously matched no band.
  it('labels a BMI sitting on the old Normal/Overweight gap', () => {
    const { ranges } = calculateBMIRanges();

    expect(bandFor(ranges, 24.95)?.label).toBe('Normal');
    // The boundary itself belongs to the upper band, not both and not neither.
    expect(bandFor(ranges, 25)?.label).toBe('Overweight');
    expect(bandFor(ranges, 29.95)?.label).toBe('Overweight');
    expect(bandFor(ranges, 30)?.label).toBe('Obese');
  });

  // Matches the backend, which is what actually labels the BMI a user sees
  // (physical-data.controller.ts: < 18.5, < 25, < 30, else obese).
  it('agrees with the backend on every category boundary', () => {
    const { ranges } = calculateBMIRanges();
    const backendCategory = (bmi: number) =>
      bmi < 18.5
        ? 'Underweight'
        : bmi < 25
          ? 'Normal'
          : bmi < 30
            ? 'Overweight'
            : 'Obese';

    for (const bmi of [15, 18.4, 18.5, 22, 24.9, 24.95, 25, 29.9, 30, 35]) {
      expect(bandFor(ranges, bmi)?.label).toBe(backendCategory(bmi));
    }
  });

  it('scales the healthy weight window with height', () => {
    const short = calculateWeightRanges(160);
    const tall = calculateWeightRanges(190);

    expect(isContiguous(short.ranges)).toBe(true);
    // The window is BMI x height^2, so a taller person's healthy band sits
    // strictly higher. A fixed band regardless of height would be the bug.
    expect(tall.minWeight).toBeGreaterThan(short.minWeight);
    expect(tall.maxWeight).toBeGreaterThan(short.maxWeight);
  });

  it('keeps the healthy weight window consistent with its own bands', () => {
    const { minWeight, maxWeight, ranges } = calculateWeightRanges(175);
    const healthy = ranges.find((r) => r.label === 'Healthy Range');

    expect(healthy?.min).toBeCloseTo(minWeight, 0);
    expect(healthy?.max).toBeCloseTo(maxWeight, 0);
  });

  it('gives men and women different body-fat bands at the same age', () => {
    const male = calculateBodyFatRanges('male', 30);
    const female = calculateBodyFatRanges('female', 30);

    expect(isContiguous(male.ranges)).toBe(true);
    expect(isContiguous(female.ranges)).toBe(true);
    expect(female.ranges).not.toEqual(male.ranges);
  });

  // Every table, not just the one the gap analysis happened to name. Each of
  // these six had four gaps of its own.
  it.each([
    ['male', 30],
    ['male', 45],
    ['male', 65],
    ['female', 30],
    ['female', 45],
    ['female', 65],
  ] as const)('leaves no unlabelled body fat for %s aged %i', (gender, age) => {
    const { ranges } = calculateBodyFatRanges(gender, age);

    expect(isContiguous(ranges)).toBe(true);
    expect(coversSpan(ranges)).toBe(true);
  });

  it('labels a body fat that used to fall between two bands', () => {
    const { ranges } = calculateBodyFatRanges('male', 30);

    // 13.5 sat between Athletes (ended 13) and Fitness (started 14).
    expect(bandFor(ranges, 13.5)?.label).toBe('Athletes');
    expect(bandFor(ranges, 17.5)?.label).toBe('Fitness');
  });

  it('shifts the body-fat bands with age', () => {
    const younger = calculateBodyFatRanges('male', 25);
    const older = calculateBodyFatRanges('male', 60);

    expect(older.ranges).not.toEqual(younger.ranges);
  });

  // gender arrives as free text from the profile form, so anything that is not
  // "male" must still return a usable set of bands rather than undefined.
  it('falls back to the non-male bands for any other gender value', () => {
    const other = calculateBodyFatRanges('other', 30);

    expect(other.ranges.length).toBeGreaterThan(0);
    expect(isContiguous(other.ranges)).toBe(true);
  });
});
