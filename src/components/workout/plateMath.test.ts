import { describe, it, expect, beforeEach } from 'vitest';

import {
  calculatePlates,
  groupPlates,
  readStoredBar,
  storeBar,
  BAR_STORAGE_KEY,
  DEFAULT_BAR_KG,
} from './plateMath';

describe('calculatePlates', () => {
  // Greedy, so 40 a side is 25+15 rather than the 20+20 most people reach for.
  // Same two plates, same total — the set is configurable for gyms that have no 25s.
  it('loads a clean total from the heaviest plates down', () => {
    const load = calculatePlates(100, DEFAULT_BAR_KG);
    expect(load?.perSide).toEqual([25, 15]);
    expect(load?.achieved).toBe(100);
    expect(load?.difference).toBe(0);
  });

  it('reaches a half-kilo total exactly', () => {
    const load = calculatePlates(97.5, DEFAULT_BAR_KG);
    // 38.75 per side: 25 + 10 + 2.5 + 1.25
    expect(load?.perSide).toEqual([25, 10, 2.5, 1.25]);
    expect(load?.achieved).toBe(97.5);
    expect(load?.difference).toBe(0);
  });

  // The float trap this guards: subtracting 2.5 and 1.25 as floats leaves a
  // remainder like 0.4999999999 and quietly drops the last plate.
  it('does not drift on repeated fractional plates', () => {
    const load = calculatePlates(61, DEFAULT_BAR_KG);
    expect(load?.perSide).toEqual([20, 0.5]);
    expect(load?.achieved).toBe(61);
    expect(load?.difference).toBe(0);
  });

  it('loads from below and reports the shortfall when the target is unreachable', () => {
    // 0.25 per side has no plate: the bar stops short rather than rounding up.
    const load = calculatePlates(20.5, DEFAULT_BAR_KG);
    expect(load?.perSide).toEqual([]);
    expect(load?.achieved).toBe(20);
    expect(load?.difference).toBe(-0.5);
  });

  it('returns an empty bar for the bar itself', () => {
    const load = calculatePlates(20, DEFAULT_BAR_KG);
    expect(load?.perSide).toEqual([]);
    expect(load?.difference).toBe(0);
  });

  it('honours a non-standard bar', () => {
    const load = calculatePlates(55, 15);
    expect(load?.perSide).toEqual([20]);
    expect(load?.achieved).toBe(55);
  });

  it('honours a restricted plate set', () => {
    const load = calculatePlates(100, DEFAULT_BAR_KG, [10, 5]);
    expect(load?.perSide).toEqual([10, 10, 10, 10]);
    expect(load?.achieved).toBe(100);
  });

  it('has no answer for a target below the bar', () => {
    expect(calculatePlates(15, DEFAULT_BAR_KG)).toBeNull();
  });

  it('has no answer without a bar', () => {
    expect(calculatePlates(40, 0)).toBeNull();
  });

  it('ignores non-numeric input rather than rendering NaN plates', () => {
    expect(calculatePlates(Number.NaN, DEFAULT_BAR_KG)).toBeNull();
  });
});

describe('groupPlates', () => {
  it('collapses runs of the same plate', () => {
    expect(groupPlates([20, 20, 5, 2.5])).toEqual([
      { weight: 20, count: 2 },
      { weight: 5, count: 1 },
      { weight: 2.5, count: 1 },
    ]);
  });

  it('handles an empty bar', () => {
    expect(groupPlates([])).toEqual([]);
  });
});

describe('readStoredBar', () => {
  beforeEach(() => localStorage.clear());

  // The bug this exists for: `Number(localStorage.getItem(k))` is 0 when the
  // key is absent, and 0 is a *valid* option meaning "no bar" — so a
  // first-time user silently had the plate calculator switched off.
  it('defaults to the standard bar when nothing is stored', () => {
    expect(readStoredBar()).toBe(DEFAULT_BAR_KG);
  });

  it('still honours a deliberately stored "no bar"', () => {
    storeBar(0);
    expect(readStoredBar()).toBe(0);
  });

  it('round-trips a real bar weight', () => {
    storeBar(15);
    expect(readStoredBar()).toBe(15);
    expect(localStorage.getItem(BAR_STORAGE_KEY)).toBe('15');
  });

  it('falls back when the stored value is not an offered option', () => {
    localStorage.setItem(BAR_STORAGE_KEY, '17.5');
    expect(readStoredBar()).toBe(DEFAULT_BAR_KG);
  });

  it('falls back on a non-numeric value', () => {
    localStorage.setItem(BAR_STORAGE_KEY, 'heavy');
    expect(readStoredBar()).toBe(DEFAULT_BAR_KG);
  });

  it('falls back on an empty string', () => {
    localStorage.setItem(BAR_STORAGE_KEY, '');
    expect(readStoredBar()).toBe(DEFAULT_BAR_KG);
  });
});
