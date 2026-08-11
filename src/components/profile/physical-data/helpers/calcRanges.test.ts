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
   * Bands must climb and must not overlap. Deliberately *not* asserting that
   * each band starts exactly where the previous ended: the BMI table has small
   * gaps by design (Normal ends at 24.9, Overweight starts at 25), inherited
   * from how the clinical categories are usually written down. A value landing
   * in a gap renders in no band — worth knowing, not worth failing a build
   * over.
   */
  const isAscendingAndDisjoint = (ranges: RangeSegment[]) =>
    ranges.every(
      (r, i) => r.max > r.min && (i === 0 || r.min >= ranges[i - 1].max),
    );

  it('produces ordered, non-overlapping BMI bands', () => {
    const { ranges } = calculateBMIRanges();

    expect(ranges.length).toBeGreaterThan(0);
    expect(isAscendingAndDisjoint(ranges)).toBe(true);
  });

  it('scales the healthy weight window with height', () => {
    const short = calculateWeightRanges(160);
    const tall = calculateWeightRanges(190);

    expect(isAscendingAndDisjoint(short.ranges)).toBe(true);
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

    expect(isAscendingAndDisjoint(male.ranges)).toBe(true);
    expect(isAscendingAndDisjoint(female.ranges)).toBe(true);
    expect(female.ranges).not.toEqual(male.ranges);
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
    expect(isAscendingAndDisjoint(other.ranges)).toBe(true);
  });
});
