/**
 * useDashboard Hook
 *
 * Aggregates all dashboard data: current status, active plans, physical data,
 * progress stats, AI recommendations, and upcoming calendar events.
 * Also computes and syncs lastWorkoutDate / nextWorkoutDate based on active plan schedule.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { currentStatusService } from '../services/current-status.service';
import { trainingPlanService } from '../services/training-plan.service';
import { nutritionPlanService } from '../services/nutrition-plan.service';
import { physicalDataService } from '../services/physical-data.service';
import api from '../services/api';
import type { CurrentStatus } from '../types/current-status.types';
import type { TrainingPlan } from '../types/training-plan.types';
import type { NutritionPlan } from '../types/nutrition.types';
import type { PhysicalData, WeightProgressData } from '../types/physical-data.types';
import type { ProgressStats, AiRecommendation, DashboardData } from '../types/dashboard.types';
export type { ProgressStats, AiRecommendation, DashboardData };

export function useDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData>({
    currentStatus: null,
    activeTrainingPlan: null,
    activeNutritionPlan: null,
    trainingPlans: [],
    nutritionPlans: [],
    latestPhysicalData: null,
    weightProgress: null,
    bmi: null,
    progressStats: null,
    aiRecommendations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?._id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const results = await Promise.allSettled([
        currentStatusService.getByUserId(user._id),           // [0] wrapped: { data: CurrentStatus }
        trainingPlanService.getByUserWithShared(user._id),     // [1] wrapped: { data: TrainingPlan[] }
        nutritionPlanService.getByUserWithShared(user._id),    // [2] wrapped: { data: NutritionPlan[] }
        physicalDataService.getLatestByUserId(user._id),       // [3] already unwrapped
        physicalDataService.getWeightProgress(user._id),       // [4] already unwrapped
        physicalDataService.calculateBMI(user._id),            // [5] already unwrapped
        api.get(`/ai-recommendations/user/${user._id}`).then((r) => r.data?.data || r.data), // [6] manually unwrapped
      ]);

      // Helper: extract fulfilled value or null
      const fulfilled = <T>(result: PromiseSettledResult<T>): T | null =>
        result.status === 'fulfilled' ? result.value : null;

      // Helper: unwrap TransformInterceptor wrapper { data, timestamp, path }
      const unwrapResponse = <T>(val: unknown): T | null => {
        if (val && typeof val === 'object' && 'timestamp' in (val as Record<string, unknown>) && 'data' in (val as Record<string, unknown>)) {
          return (val as Record<string, unknown>).data as T;
        }
        return val as T;
      };

      // Services that return response.data (still wrapped by TransformInterceptor)
      const currentStatus = unwrapResponse<CurrentStatus>(fulfilled(results[0]));
      const trainingPlans = unwrapResponse<TrainingPlan[]>(fulfilled(results[1])) || [];
      const nutritionPlans = unwrapResponse<NutritionPlan[]>(fulfilled(results[2])) || [];

      // Services that already unwrap response.data.data
      const latestPhysicalData = fulfilled(results[3]) as PhysicalData | null;
      const weightProgress = fulfilled(results[4]) as WeightProgressData | null;
      const bmi = fulfilled(results[5]) as { bmi: number; category: string } | null;

      // Direct API calls that manually unwrap
      const progressStats = null;
      const aiRecommendations = (fulfilled(results[6]) as AiRecommendation[]) || [];

      // Resolve active plans from current status.
      // Backend populates activeTrainingPlanId & activeMenuId,
      // so they may be full objects (with _id) instead of string IDs.
      let activeTrainingPlan: TrainingPlan | null = null;
      let activeNutritionPlan: NutritionPlan | null = null;

      const activePlanRef = currentStatus?.activeTrainingPlanId;
      const activeMenuRef = currentStatus?.activeMenuId;

      // Extract the ID whether it's a string or a populated object
      const activePlanId = typeof activePlanRef === 'string'
        ? activePlanRef
        : (activePlanRef as TrainingPlan | null)?._id ?? null;

      const activeMenuId = typeof activeMenuRef === 'string'
        ? activeMenuRef
        : (activeMenuRef as NutritionPlan | null)?._id ?? null;

      if (activePlanId) {
        // If backend populated the full object, use it directly
        if (typeof activePlanRef === 'object' && activePlanRef !== null && '_id' in (activePlanRef as Record<string, unknown>)) {
          activeTrainingPlan = activePlanRef as unknown as TrainingPlan;
        } else {
          activeTrainingPlan =
            trainingPlans.find((p) => p._id === activePlanId) || null;
          if (!activeTrainingPlan) {
            try {
              activeTrainingPlan = await trainingPlanService.getById(activePlanId);
            } catch {
              // Plan may have been deleted
            }
          }
        }
      }

      if (activeMenuId) {
        if (typeof activeMenuRef === 'object' && activeMenuRef !== null && '_id' in (activeMenuRef as Record<string, unknown>)) {
          activeNutritionPlan = activeMenuRef as unknown as NutritionPlan;
        } else {
          activeNutritionPlan =
            nutritionPlans.find((p) => p._id === activeMenuId) || null;
          if (!activeNutritionPlan) {
            try {
              activeNutritionPlan = await nutritionPlanService.getById(activeMenuId);
            } catch {
              // Plan may have been deleted
            }
          }
        }
      }

      // Calculate and sync lastWorkoutDate / nextWorkoutDate from active plan schedule
      if (activeTrainingPlan && user._id) {
        const workoutDates = calcWorkoutDates(activeTrainingPlan);
        const needsUpdate =
          !datesEqual(currentStatus?.lastWorkoutDate, workoutDates.lastWorkoutDate) ||
          !datesEqual(currentStatus?.nextWorkoutDate, workoutDates.nextWorkoutDate);

        if (needsUpdate) {
          try {
            await currentStatusService.update(user._id, {
              lastWorkoutDate: workoutDates.lastWorkoutDate,
              nextWorkoutDate: workoutDates.nextWorkoutDate,
            });
            // Update local currentStatus with the new dates
            if (currentStatus) {
              currentStatus.lastWorkoutDate = workoutDates.lastWorkoutDate;
              currentStatus.nextWorkoutDate = workoutDates.nextWorkoutDate;
            }
          } catch {
            // Non-critical — keep going
          }
        }
      }

      setData({
        currentStatus,
        activeTrainingPlan,
        activeNutritionPlan,
        trainingPlans,
        nutritionPlans,
        latestPhysicalData,
        weightProgress,
        bmi,
        progressStats,
        aiRecommendations: Array.isArray(aiRecommendations)
          ? aiRecommendations
          : [],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...data,
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
