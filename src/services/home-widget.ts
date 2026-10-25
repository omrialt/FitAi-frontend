import { registerPlugin } from '@capacitor/core';
import { isNativeApp } from '../config/platform';
import { loadActivePlan } from './active-plan';
import { workoutSessionService } from './workout-session.service';
import { localDateKey } from './workout-reminders';
import type { TrainingPlan } from '../types/training-plan.types';
import type { WorkoutSession } from '../types/workout-session.types';

/**
 * The home-screen widget's state (TodayWidgetProvider.java).
 *
 * The widget is sent the active plan's weekly schedule and localised text,
 * never "today": it works today out itself every half hour, so it is still
 * right after midnight with the app closed. Only the streak and "trained
 * today" need the app to run, which it does on every start, resume and save.
 */

export interface WidgetText {
  todayTitle: string;
  todaySubtitle: string;
  doneTitle: string;
  doneSubtitle: string;
  restTitle: string;
  nextTomorrow: string;
  nextLater: string;
  noPlanTitle: string;
  noPlanSubtitle: string;
  signedOutTitle: string;
  signedOutSubtitle: string;
  streak: string;
  start: string;
  /** Sunday first, as Date.getDay() counts. */
  weekdays: string[];
}

export interface WidgetState {
  signedIn: boolean;
  planId: string;
  days: { dow: number; index: number; name: string; exercises: number }[];
  lastTrainedDate: string | null;
  streakWeeks: number;
  text: WidgetText;
}

interface HomeWidgetPlugin {
  update(state: WidgetState): Promise<void>;
  clear(): Promise<void>;
}

const HomeWidget = registerPlugin<HomeWidgetPlugin>('HomeWidget');

/** Pure: what to hand the widget. */
export function buildWidgetState(
  plan: Pick<TrainingPlan, '_id' | 'days'> | null,
  sessions: Pick<WorkoutSession, 'performedAt'>[],
  streakWeeks: number,
  text: WidgetText,
): WidgetState {
  const last = sessions
    .map((s) => new Date(s.performedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    signedIn: true,
    planId: plan?._id ?? '',
    days: (plan?.days ?? []).map((day, index) => ({
      dow: day.dayOfWeek,
      index,
      name: day.dayName,
      exercises: day.exercises?.length ?? 0,
    })),
    lastTrainedDate: last ? localDateKey(last) : null,
    streakWeeks,
    text,
  };
}

/** Refresh the widget for the signed-in user. No-op on the web; never throws. */
export async function syncWidget(userId: string, text: WidgetText): Promise<void> {
  if (!isNativeApp) return;
  try {
    const [plan, sessions, stats] = await Promise.all([
      loadActivePlan(userId).catch(() => null),
      workoutSessionService
        .getByUserId(userId, { from: localDateKey(new Date()) })
        .catch(() => [] as WorkoutSession[]),
      workoutSessionService.getStats(userId).catch(() => null),
    ]);
    await HomeWidget.update(
      buildWidgetState(plan, sessions, stats?.streak?.currentWeeks ?? 0, text),
    );
  } catch {
    // A stale widget is better than a crash; it corrects on the next sync.
  }
}

/** Signed out: the widget must not keep showing someone else's plan. */
export async function clearWidget(): Promise<void> {
  if (!isNativeApp) return;
  try {
    await HomeWidget.clear();
  } catch {
    // No widget placed.
  }
}
