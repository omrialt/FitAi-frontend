import type { TrainingDay } from '../types/training-plan.types';

/**
 * Which day of a plan today is.
 *
 * `-1` when no day of the plan falls on today's weekday — a rest day, as far
 * as the plan is concerned. That is a different answer from "the first day",
 * and the two callers want it for different reasons: the dashboard needs
 * somewhere to send the user anyway, while the logger's day picker needs to
 * know whether it can honestly label an option "today".
 */
export function todaysPlanDayIndex(days: TrainingDay[] | undefined): number {
  if (!days?.length) return -1;

  const today = new Date().getDay();
  return days.findIndex((day) => day.dayOfWeek === today);
}

/**
 * The day to open the logger on, which is today's unless the plan has nothing
 * scheduled for today — then the first, so the button always leads somewhere.
 */
export function defaultPlanDayIndex(days: TrainingDay[] | undefined): number {
  const today = todaysPlanDayIndex(days);
  return today >= 0 ? today : 0;
}
