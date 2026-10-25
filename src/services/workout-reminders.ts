import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativeApp } from '../config/platform';
import { loadActivePlan } from './active-plan';
import { workoutSessionService } from './workout-session.service';
import type { TrainingPlan } from '../types/training-plan.types';

/**
 * "Today: leg day" reminders, scheduled on the phone — no server involved.
 *
 * Rolling rather than repeating: instead of one weekly notification per plan
 * day, single notifications are scheduled for the next 14 days and rebuilt
 * whenever the app opens, resumes or saves a workout. That is what lets a day
 * already trained be skipped and a changed plan take effect. Someone who does
 * not open the app for two weeks stops getting reminders, which is acceptable:
 * that is the case a server-side reminder would cover later.
 *
 * Off until the user turns it on, at 09:00 by default (decided 25.10.2026).
 */

export interface ReminderSettings {
  enabled: boolean;
  /** "HH:MM", local time. */
  time: string;
}

export interface PlannedReminder {
  at: Date;
  planId: string;
  dayIndex: number;
  dayName: string;
  exerciseCount: number;
}

export interface ReminderText {
  title: (r: PlannedReminder) => string;
  body: (r: PlannedReminder) => string;
}

const SETTINGS_KEY = 'fitai.reminders';
const OFFERED_KEY = 'fitai.reminders.offered';
const DEFAULTS: ReminderSettings = { enabled: false, time: '09:00' };
const HORIZON_DAYS = 14;
const FIRST_ID = 6000;
const CHANNEL_ID = 'workout-reminders';

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: parsed.enabled === true,
      time: /^\d{2}:\d{2}$/.test(parsed.time ?? '') ? (parsed.time as string) : DEFAULTS.time,
    };
  } catch {
    return DEFAULTS;
  }
}

export function setReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Without storage the setting lasts until the app closes.
  }
}

/** The one-time "turn on reminders?" offer after a first workout. */
export function takeReminderOffer(): boolean {
  try {
    if (localStorage.getItem(OFFERED_KEY)) return false;
    localStorage.setItem(OFFERED_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

/** yyyy-mm-dd in local time. */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * When reminders should fire over the next 14 days. Pure: the plan, the days
 * already trained (local yyyy-mm-dd), the settings and "now" in, dates out.
 * Times are built in local time, so a daylight-saving change keeps 09:00 at
 * 09:00 on the clock.
 */
export function planReminders(
  plan: Pick<TrainingPlan, '_id' | 'days'> | null,
  doneDates: ReadonlySet<string>,
  settings: ReminderSettings,
  now: Date,
): PlannedReminder[] {
  if (!settings.enabled || !plan?._id || !plan.days?.length) return [];

  const [hours, minutes] = settings.time.split(':').map(Number);
  const out: PlannedReminder[] = [];

  for (let offset = 0; offset < HORIZON_DAYS; offset++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hours, minutes);
    if (at <= now) continue;
    if (doneDates.has(localDateKey(at))) continue;

    const dayIndex = plan.days.findIndex((day) => day.dayOfWeek === at.getDay());
    if (dayIndex < 0) continue;

    const day = plan.days[dayIndex];
    out.push({
      at,
      planId: plan._id,
      dayIndex,
      dayName: day.dayName,
      exerciseCount: day.exercises?.length ?? 0,
    });
  }

  return out;
}

async function cancelAll(): Promise<void> {
  const notifications = Array.from({ length: HORIZON_DAYS }, (_, i) => ({ id: FIRST_ID + i }));
  await LocalNotifications.cancel({ notifications });
}

let channelReady = false;
async function ensureChannel(): Promise<void> {
  if (channelReady) return;
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Workout reminders',
    description: "Today's workout from your plan",
    importance: 3,
  });
  channelReady = true;
}

/**
 * Rebuild the scheduled reminders from the active plan and today's log.
 * Returns what was scheduled. No-op on the web; failures are swallowed — a
 * reminder is a convenience, not a record.
 */
export async function syncReminders(userId: string, text: ReminderText): Promise<PlannedReminder[]> {
  if (!isNativeApp) return [];

  try {
    await cancelAll();
    const settings = getReminderSettings();
    if (!settings.enabled) return [];

    const now = new Date();
    const [plan, sessions] = await Promise.all([
      loadActivePlan(userId),
      workoutSessionService.getByUserId(userId, { from: localDateKey(now) }).catch(() => []),
    ]);
    const done = new Set(sessions.map((s) => localDateKey(new Date(s.performedAt))));

    const planned = planReminders(plan, done, settings, now);
    if (planned.length === 0) return [];

    await ensureChannel();
    await LocalNotifications.schedule({
      notifications: planned.map((r, i) => ({
        id: FIRST_ID + i,
        title: text.title(r),
        body: text.body(r),
        channelId: CHANNEL_ID,
        smallIcon: 'ic_stat_timer',
        schedule: { at: r.at, allowWhileIdle: true },
        extra: { url: `com.fitai.app://open?to=/workout/${r.planId}/${r.dayIndex}` },
      })),
    });
    return planned;
  } catch {
    return [];
  }
}
