/**
 * Workout sessions — what the user actually performed, as opposed to what the
 * training plan prescribed.
 *
 * `planId` is optional because an unplanned workout is still a workout, and
 * `planTitle` / `dayName` are denormalised on the server so a deleted plan does
 * not turn the training log into rows of "(unknown)".
 */

export interface PerformedSet {
  reps: number;
  weight: number;
  /** Rate of perceived exertion, 1–10. */
  rpe?: number;
}

export interface SessionExercise {
  name: string;
  muscleGroup?: string;
  notes?: string;
  sets: PerformedSet[];
}

export interface WorkoutSession {
  _id: string;
  userId: string;
  planId?: string | null;
  planTitle?: string;
  dayName?: string;
  performedAt: string;
  durationMinutes?: number;
  notes?: string;
  exercises: SessionExercise[];
  source: 'app' | 'migration' | 'import';
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutSessionDto {
  planId?: string;
  planTitle?: string;
  dayName?: string;
  /** ISO string. Defaults to now on the server when omitted. */
  performedAt?: string;
  durationMinutes?: number;
  notes?: string;
  exercises: SessionExercise[];
}

export interface ListWorkoutSessionsQuery {
  from?: string;
  to?: string;
  limit?: number;
}

/** One exercise's best set, ranked by estimated one-rep max. */
export interface PersonalBest {
  exercise: string;
  weight: number;
  reps: number;
  estimatedOneRepMax: number;
  achievedAt: string;
}

export interface StreakSummary {
  /** Consecutive weeks containing at least one workout. */
  currentWeeks: number;
  longestWeeks: number;
  totalWorkoutDays: number;
  lastWorkoutAt: string | null;
}

export interface AdherenceSummary {
  planned: number;
  completed: number;
  /** `null` when there is no active plan to be adherent to. */
  percent: number | null;
  windowDays: number;
}

export interface WorkoutStats {
  streak: StreakSummary;
  adherence: AdherenceSummary;
  personalBests: PersonalBest[];
}

/** One session's best effort on one exercise — a point on the strength curve. */
export interface ExerciseHistoryPoint {
  /** ISO day (YYYY-MM-DD), not a timestamp: the x-axis is the calendar. */
  date: string;
  weight: number;
  reps: number;
  estimatedOneRepMax: number;
  /** Weight x reps across every set of that exercise that day. */
  volume: number;
  sets: number;
  /** True on the day this became the best estimated 1RM to date. */
  isPersonalBest: boolean;
}

export interface ExerciseHistory {
  exercise: string;
  points: ExerciseHistoryPoint[];
  /** Every exercise the user has ever logged, for the picker. */
  availableExercises: string[];
}
