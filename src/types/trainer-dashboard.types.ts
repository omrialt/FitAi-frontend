/**
 * The trainer's roster overview.
 *
 * Dates arrive as ISO strings — the backend types them as `Date`, JSON does
 * not have one, and pretending otherwise here is how `.getTime is not a
 * function` gets shipped.
 */

export type TrainerAlertCode =
  | 'missed_workouts'
  | 'never_trained'
  | 'weight_stalled'
  | 'no_measurements'
  | 'deload_suggested'
  | 'no_active_plan';

export type TrainerAlertSeverity = 'warn' | 'info';

export interface TrainerAlert {
  code: TrainerAlertCode;
  severity: TrainerAlertSeverity;
  since?: string | null;
}

export interface TrainerWeightTrend {
  latestKg: number;
  latestAt: string;
  changeKg: number;
  spanDays: number;
  measurements: number;
}

export interface TrainerDashboardRow {
  clientId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;

  lastWorkoutAt: string | null;
  daysSinceLastWorkout: number | null;
  sessionsLast7: number;
  sessionsLast30: number;
  totalSessions: number;

  adherencePercent: number | null;
  fatigue: 'insufficient' | 'ok' | 'watch' | 'deload';

  weight: TrainerWeightTrend | null;
  totalMeasurements: number;
  hasActivePlan: boolean;

  alerts: TrainerAlert[];
}

/** True when the row has at least one alert the trainer should act on. */
export function hasWarning(row: TrainerDashboardRow): boolean {
  return row.alerts.some((alert) => alert.severity === 'warn');
}
