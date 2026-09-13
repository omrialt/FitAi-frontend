import { describe, it, expect, afterEach, vi } from 'vitest';

import { defaultPlanDayIndex, todaysPlanDayIndex } from './planDay';
import type { TrainingDay } from '../types/training-plan.types';

/**
 * The clock is pinned to a known weekday rather than read.
 *
 * The rule under test is "which day of the plan is today", so a test that asks
 * the real clock is a test whose answer changes seven times a week — and the
 * one weekday it happens to be wrong on is the one nobody runs it on. The
 * backend suite already shipped that exact bug once.
 */
const WEDNESDAY = new Date(2026, 8, 16, 9, 0, 0); // 16 Sep 2026, local

function day(dayName: string, dayOfWeek: number): TrainingDay {
  return { dayName, dayOfWeek, exercises: [] } as unknown as TrainingDay;
}

const PLAN_DAYS = [day('Upper', 1), day('Lower', 3), day('Full', 5)];

describe('todaysPlanDayIndex', () => {
  afterEach(() => vi.useRealTimers());

  it('finds the day scheduled for today', () => {
    vi.useFakeTimers().setSystemTime(WEDNESDAY);
    expect(todaysPlanDayIndex(PLAN_DAYS)).toBe(1);
  });

  it('reports -1 when the plan schedules nothing for today', () => {
    vi.useFakeTimers().setSystemTime(new Date(2026, 8, 15, 9, 0, 0)); // Tuesday
    expect(todaysPlanDayIndex(PLAN_DAYS)).toBe(-1);
  });

  it('reports -1 for a plan with no days at all', () => {
    expect(todaysPlanDayIndex([])).toBe(-1);
    expect(todaysPlanDayIndex(undefined)).toBe(-1);
  });
});

describe('defaultPlanDayIndex', () => {
  afterEach(() => vi.useRealTimers());

  it('opens on today when the plan has a day for it', () => {
    vi.useFakeTimers().setSystemTime(WEDNESDAY);
    expect(defaultPlanDayIndex(PLAN_DAYS)).toBe(1);
  });

  /**
   * The two functions differ only here, and this is why both exist: the
   * dashboard's button has to lead somewhere on a rest day, while the picker
   * must not label a day "today" when none of them is.
   */
  it('falls back to the first day on a day the plan rests', () => {
    vi.useFakeTimers().setSystemTime(new Date(2026, 8, 15, 9, 0, 0)); // Tuesday
    expect(defaultPlanDayIndex(PLAN_DAYS)).toBe(0);
  });
});
