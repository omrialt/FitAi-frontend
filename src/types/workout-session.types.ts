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
  /**
   * Idempotency key minted before the first send attempt. Set for anything
   * that went through the offline queue; resending it is a no-op server-side.
   */
  clientId?: string;
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

export type FatigueLevel = 'insufficient' | 'ok' | 'watch' | 'deload';

/**
 * Whether the recent training block looks like accumulating fatigue.
 *
 * `insufficient` is a first-class answer, not an error: without a baseline
 * there is nothing to compare against, and a verdict invented from three
 * sessions is how a signal like this loses trust on first contact.
 */
export interface FatigueSignal {
  level: FatigueLevel;
  reasons: (
    | 'volume_dropping'
    | 'effort_climbing'
    | 'frequency_dropping'
    | 'load_stalled'
  )[];
  volumeChangePercent: number | null;
  recentRpe: number | null;
  baselineRpe: number | null;
  recentSessions: number;
  baselineSessions: number;
}

// ─── progression ──────────────────────────────────────────────

export type OverloadAction = 'add_weight' | 'add_reps' | 'hold';

export type OverloadReason =
  | 'range_topped'
  | 'range_not_topped'
  | 'effort_high'
  | 'deloading';

/**
 * What to do next session for one exercise.
 *
 * Computed by the server from the log — there is no AI in this, which is why
 * it works offline, costs nothing and gives the same answer twice.
 */
export interface OverloadSuggestion {
  exercise: string;
  /** ISO day of the last session containing it. */
  lastPerformedAt: string;
  lastTopSet: { weight: number; reps: number; sets: number };
  /** Inferred from what the user actually does, not prescribed. */
  repRange: { min: number; max: number };
  action: OverloadAction;
  reason: OverloadReason;
  suggested: { weight: number; reps: number; sets: number };
  /** 0 for bodyweight lifts, where reps are the only axis. */
  incrementKg: number;
  equipment: string | null;
  lastRpe: number | null;
}

export interface OverloadPlan {
  suggestions: OverloadSuggestion[];
  /** When true every suggestion is `hold`, so the two cards cannot disagree. */
  deloadRecommended: boolean;
}

export interface DeloadExercise {
  exercise: string;
  from: { weight: number; sets: number; reps: number };
  to: { weight: number; sets: number; reps: number };
}

/**
 * What backing off would look like, in kilos and sets.
 *
 * `recommended` is false for `watch` — the numbers are offered, nothing
 * insists. An empty `exercises` list with `level: 'insufficient'` means the
 * log cannot support a verdict yet, which is not the same as "you are fine".
 */
export interface DeloadPrescription {
  recommended: boolean;
  level: FatigueLevel;
  reasons: FatigueSignal['reasons'];
  loadPercent: number;
  volumePercent: number;
  durationDays: number;
  exercises: DeloadExercise[];
}
