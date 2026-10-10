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

/**
 * The trainer's own thresholds for the alerts above — the server falls back
 * to the defaults below until they are changed. Bounds match the server DTO.
 */
export interface TrainerAlertSettings {
  idleInfoDays: number;
  idleWarnDays: number;
  stallMinSpanDays: number;
  stallMaxChangeKg: number;
}

export const DEFAULT_ALERT_SETTINGS: TrainerAlertSettings = {
  idleInfoDays: 7,
  idleWarnDays: 10,
  stallMinSpanDays: 21,
  stallMaxChangeKg: 0.5,
};

export const ALERT_SETTING_BOUNDS = {
  idleDays: { min: 1, max: 60 },
  stallMinSpanDays: { min: 7, max: 56 },
  stallMaxChangeKg: { min: 0.1, max: 5 },
} as const;
