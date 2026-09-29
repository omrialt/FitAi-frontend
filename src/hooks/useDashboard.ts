/**
 * useDashboard Hook
 *
 * Aggregates all dashboard data: current status, active plans, physical data,
 * progress stats, AI recommendations, and upcoming calendar events.
 * Also computes and syncs lastWorkoutDate / nextWorkoutDate based on active plan schedule.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { currentStatusService } from '../services/current-status.service';
import { trainingPlanService } from '../services/training-plan.service';
import { nutritionPlanService } from '../services/nutrition-plan.service';
import { physicalDataService } from '../services/physical-data.service';
import { progressStatsService } from '../services/progress-stats.service';
import { workoutSessionService } from '../services/workout-session.service';
import api from '../services/api';
import type { CurrentStatus } from '../types/current-status.types';
import type { TrainingPlan } from '../types/training-plan.types';
import type { NutritionPlan } from '../types/nutrition.types';
import type { PhysicalData, WeightProgressData } from '../types/physical-data.types';
import type { ProgressStats, AiRecommendation, DashboardData } from '../types/dashboard.types';
export type { ProgressStats, AiRecommendation, DashboardData };

/** Which parts of `DashboardData` have arrived, so a card can tell "loading" from "empty". */
export type DashboardReady = Record<keyof DashboardData, boolean>;

const EMPTY: DashboardData = {
  currentStatus: null,
  activeTrainingPlan: null,
  activeNutritionPlan: null,
  trainingPlans: [],
  nutritionPlans: [],
  latestPhysicalData: null,
  weightProgress: null,
  bmi: null,
  progressStats: null,
  workoutStats: null,
  aiRecommendations: [],
};

const NOTHING_READY = Object.fromEntries(
  Object.keys(EMPTY).map((key) => [key, false]),
) as DashboardReady;

/** Unwrap the TransformInterceptor envelope `{ data, timestamp, path }` when present. */
function unwrapResponse<T>(val: unknown): T | null {
  if (
    val &&
    typeof val === 'object' &&
    'timestamp' in (val as Record<string, unknown>) &&
    'data' in (val as Record<string, unknown>)
  ) {
    return (val as Record<string, unknown>).data as T;
  }
  return (val as T) ?? null;
}

/** The id of a ref the backend may or may not have populated. */
function refId(ref: unknown): string | null {
  if (typeof ref === 'string') return ref;
  if (ref && typeof ref === 'object' && '_id' in (ref as Record<string, unknown>)) {
    return String((ref as { _id: unknown })._id);
  }
  return null;
}

function isPopulated<T>(ref: unknown): ref is T {
  return !!ref && typeof ref === 'object' && '_id' in (ref as Record<string, unknown>);
}

/**
 * Everything the dashboard shows, delivered progressively.
 *
 * This used to be one `Promise.allSettled` over nine requests, followed by a
 * sequential status PATCH, with a full-page spinner in front of all of it — so
 * the screen took as long as the slowest request plus a write, and only then
 * did the self-loading cards (fatigue, overload, deload, today's meals) mount
 * and start a second round of requests behind it.
 *
 * Now each request writes its slice the moment it lands and flips its flag in
 * `ready`. The page waits only for the current status — it carries the
 * populated active plan, which is what the screen is opened for — and every
 * other card shows its own skeleton until its slice arrives. The date sync is
 * a background write that never holds the screen.
 *
 * `refetch` refreshes in place: the data on screen stays until the new data
 * replaces it, instead of the page blanking to a spinner after every edit.
 */
export function useDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [ready, setReady] = useState<DashboardReady>(NOTHING_READY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A refetch, or a user switch, supersedes whatever is still in flight; late
  // answers from the old run must not overwrite the new one.
  const runRef = useRef(0);
  // Whose data is on screen. A refetch keeps it; a different user must not
  // see the previous one's cards while their own are still loading.
  const shownUserRef = useRef<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const userId = user?._id;
    if (!userId) return;

    const run = ++runRef.current;
    const current = () => run === runRef.current;
    setError(null);
    if (shownUserRef.current !== userId) {
      shownUserRef.current = userId;
      setData(EMPTY);
      setReady(NOTHING_READY);
      setLoading(true);
    }

    /** Store one slice when (and only if) this run is still the live one. */
    const put = <K extends keyof DashboardData>(key: K, value: DashboardData[K]) => {
      if (!current()) return;
      setData((prev) => ({ ...prev, [key]: value }));
      setReady((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
    };

    /** A request that can fail without taking anything else with it. */
    const settle = <T>(promise: Promise<T>): Promise<T | null> =>
      promise.catch(() => null);

    const statusP = settle(currentStatusService.getByUserId(userId)).then(
      (raw) => unwrapResponse<CurrentStatus>(raw),
    );
    const trainingPlansP = settle(trainingPlanService.getByUserWithShared(userId)).then(
      (raw) => unwrapResponse<TrainingPlan[]>(raw) || [],
    );
    const nutritionPlansP = settle(nutritionPlanService.getByUserWithShared(userId)).then(
      (raw) => unwrapResponse<NutritionPlan[]>(raw) || [],
    );
    // The workout-count tiles and the weight/fat trend arrows read
    // progressStats; streak and bests read workoutStats. Each is independent.
    const workoutStatsP = settle(workoutSessionService.getStats(userId));

    trainingPlansP.then((plans) => put('trainingPlans', plans));
    nutritionPlansP.then((plans) => put('nutritionPlans', plans));
    workoutStatsP.then((stats) => put('workoutStats', stats));

    settle(physicalDataService.getLatestByUserId(userId)).then((v) =>
      put('latestPhysicalData', v as PhysicalData | null),
    );
    settle(physicalDataService.getWeightProgress(userId)).then((v) =>
      put('weightProgress', v as WeightProgressData | null),
    );
    settle(physicalDataService.calculateBMI(userId)).then((v) =>
      put('bmi', v as { bmi: number; category: string } | null),
    );
    settle(progressStatsService.getByUserId(userId)).then((v) =>
      put('progressStats', v as ProgressStats | null),
    );
    settle(
      api.get(`/ai-recommendations/user/${userId}`).then((r) => r.data?.data || r.data),
    ).then((v) => put('aiRecommendations', Array.isArray(v) ? (v as AiRecommendation[]) : []));

    // ── the one thing the page waits for ────────────────────────
    const currentStatus = await statusP;
    if (!current()) return;
    put('currentStatus', currentStatus);
    setLoading(false);

    // ── active plans: from the populated status when possible ───
    const activePlanRef = currentStatus?.activeTrainingPlanId;
    const activeMenuRef = currentStatus?.activeMenuId;

    const activeTrainingPlanP: Promise<TrainingPlan | null> = (async () => {
      const id = refId(activePlanRef);
      if (!id) return null;
      if (isPopulated<TrainingPlan>(activePlanRef)) return activePlanRef;
      const plans = await trainingPlansP;
      return (
        plans.find((p) => p._id === id) ??
        (await settle(trainingPlanService.getById(id))) // may have been deleted
      );
    })();

    const activeNutritionPlanP: Promise<NutritionPlan | null> = (async () => {
      const id = refId(activeMenuRef);
      if (!id) return null;
      if (isPopulated<NutritionPlan>(activeMenuRef)) return activeMenuRef;
      const plans = await nutritionPlansP;
      return (
        plans.find((p) => p._id === id) ??
        (await settle(nutritionPlanService.getById(id)))
      );
    })();

    activeTrainingPlanP.then((plan) => put('activeTrainingPlan', plan));
    activeNutritionPlanP.then((plan) => put('activeNutritionPlan', plan));

    // ── background: keep last/next workout dates in step ────────
    // "Last workout" means the last one actually performed, so it comes from
    // the training log — not from the plan's weekly schedule, which can only
    // say when a workout was *due*. The schedule stays the fallback for users
    // with no sessions yet. Nothing waits on this write.
    const [activeTrainingPlan, workoutStats] = await Promise.all([
      activeTrainingPlanP,
      workoutStatsP,
    ]);
    if (!activeTrainingPlan || !current()) return;

    const workoutDates = calcWorkoutDates(activeTrainingPlan);
    const lastWorkoutDate = workoutStats?.streak.lastWorkoutAt
      ? new Date(workoutStats.streak.lastWorkoutAt)
      : workoutDates.lastWorkoutDate;

    const needsUpdate =
      !datesEqual(currentStatus?.lastWorkoutDate, lastWorkoutDate) ||
      !datesEqual(currentStatus?.nextWorkoutDate, workoutDates.nextWorkoutDate);

    if (needsUpdate && currentStatus) {
      try {
        await currentStatusService.update(userId, {
          lastWorkoutDate,
          nextWorkoutDate: workoutDates.nextWorkoutDate,
        });
        put('currentStatus', {
          ...currentStatus,
          lastWorkoutDate,
          nextWorkoutDate: workoutDates.nextWorkoutDate,
        });
      } catch {
        // Non-critical — the banner keeps the stored dates.
      }
    }
  }, [user?._id]);

  useEffect(() => {
    fetchDashboardData().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setLoading(false);
    });
  }, [fetchDashboardData]);

  return {
    ...data,
    ready,
    loading,
    error,
    refetch: fetchDashboardData,
    user,
  };
}

// ─── Workout date helpers ───────────────────────────────────────

/**
 * Given a training plan, compute the most recent past training day (lastWorkoutDate)
 * and the next upcoming training day (nextWorkoutDate) based on `dayOfWeek` (0=Sun … 6=Sat).
 *
 * Example: today is Tuesday (2). Plan has days with dayOfWeek [0 (Sun), 3 (Wed)].
 *  → lastWorkoutDate = last Sunday
 *  → nextWorkoutDate = this Wednesday
 */
function calcWorkoutDates(plan: TrainingPlan): {
  lastWorkoutDate: Date | null;
  nextWorkoutDate: Date | null;
} {
  const trainingDaysOfWeek = plan.days
    .map((d) => d.dayOfWeek)
    .filter((d): d is number => d != null && d >= 0 && d <= 6);

  if (trainingDaysOfWeek.length === 0) {
    return { lastWorkoutDate: null, nextWorkoutDate: null };
  }

  const now = new Date();
  const todayDow = now.getDay(); // 0=Sun..6=Sat

  // Sort days ascending
  const sorted = [...new Set(trainingDaysOfWeek)].sort((a, b) => a - b);

  // Find next training day (today or later this week, else first day next week)
  let nextDayOffset: number | null = null;
  for (const dow of sorted) {
    const diff = dow - todayDow;
    if (diff > 0) {
      nextDayOffset = diff;
      break;
    }
  }
  if (nextDayOffset === null) {
    // Wrap to next week: pick the earliest day
    nextDayOffset = 7 - todayDow + sorted[0];
  }

  // Find most recent past training day (strictly before today, or today if it's a training day → use the one before)
  let lastDayOffset: number | null = null;
  // Check if today is a training day
  const todayIsTraining = sorted.includes(todayDow);

  if (todayIsTraining) {
    // Today is a training day → next workout is today, last workout is the previous training day
    nextDayOffset = 0;
    // Find the training day before today
    const before = sorted.filter((d) => d < todayDow);
    if (before.length > 0) {
      lastDayOffset = -(todayDow - before[before.length - 1]);
    } else {
      // Wrap to previous week: pick the last day
      lastDayOffset = -(todayDow + 7 - sorted[sorted.length - 1]);
    }
  } else {
    // Today is NOT a training day → find most recent past day
    const before = sorted.filter((d) => d < todayDow);
    if (before.length > 0) {
      lastDayOffset = -(todayDow - before[before.length - 1]);
    } else {
      // Wrap to previous week
      lastDayOffset = -(todayDow + 7 - sorted[sorted.length - 1]);
    }
  }

  const nextWorkoutDate = new Date(now);
  nextWorkoutDate.setDate(now.getDate() + nextDayOffset);
  nextWorkoutDate.setHours(8, 0, 0, 0); // Default to 8 AM

  let lastWorkoutDate: Date | null = null;
  if (lastDayOffset !== null) {
    lastWorkoutDate = new Date(now);
    lastWorkoutDate.setDate(now.getDate() + lastDayOffset);
    lastWorkoutDate.setHours(8, 0, 0, 0);
  }

  return { lastWorkoutDate, nextWorkoutDate };
}

/** Compare two dates (or nulls) ignoring time of day */
function datesEqual(a: Date | string | null | undefined, b: Date | null | undefined): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}
