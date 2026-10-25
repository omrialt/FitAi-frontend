import { describe, it, expect, vi, beforeEach } from 'vitest';

let native = true;
vi.mock('../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

const cancel = vi.fn();
const schedule = vi.fn();
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    cancel: (...args: unknown[]) => cancel(...args),
    schedule: (...args: unknown[]) => schedule(...args),
    createChannel: vi.fn(() => Promise.resolve()),
  },
}));

const loadActivePlan = vi.fn();
vi.mock('./active-plan', () => ({ loadActivePlan: (...a: unknown[]) => loadActivePlan(...a) }));
const getSessions = vi.fn();
vi.mock('./workout-session.service', () => ({
  workoutSessionService: { getByUserId: (...a: unknown[]) => getSessions(...a) },
}));

import {
  localDateKey,
  planReminders,
  setReminderSettings,
  syncReminders,
} from './workout-reminders';

const PLAN_ID = 'b'.repeat(24);
// Sunday (0) and Wednesday (3).
const plan = {
  _id: PLAN_ID,
  days: [
    { dayName: 'Push', dayOfWeek: 0, exercises: [{}, {}, {}] },
    { dayName: 'Legs', dayOfWeek: 3, exercises: [{}, {}] },
  ],
} as never;

const on = { enabled: true, time: '09:00' };
// Sunday 25.10.2026, 08:00 local — also the day Israel leaves daylight saving.
const sunday8am = new Date(2026, 9, 25, 8, 0);

describe('planReminders', () => {
  it('fires only on the plan days, at the chosen time', () => {
    const out = planReminders(plan, new Set(), on, sunday8am);

    expect(out.map((r) => r.at.getDay())).toEqual([0, 3, 0, 3]);
    expect(out[0]).toMatchObject({ dayName: 'Push', dayIndex: 0, exerciseCount: 3, planId: PLAN_ID });
    expect(out.every((r) => r.at.getHours() === 9 && r.at.getMinutes() === 0)).toBe(true);
  });

  it('skips today once it has been trained', () => {
    const out = planReminders(plan, new Set([localDateKey(sunday8am)]), on, sunday8am);

    expect(out[0].at.getDay()).toBe(3);
  });

  it('skips today when the time has already passed', () => {
    const out = planReminders(plan, new Set(), on, new Date(2026, 9, 25, 10, 0));

    expect(out[0].at.getDay()).toBe(3);
  });

  it('looks 14 days ahead and no further', () => {
    const out = planReminders(plan, new Set(), on, sunday8am);
    const last = out[out.length - 1].at.getTime();

    expect(last - sunday8am.getTime()).toBeLessThan(14 * 24 * 3600 * 1000);
  });

  it('schedules nothing when off or without a plan', () => {
    expect(planReminders(plan, new Set(), { ...on, enabled: false }, sunday8am)).toEqual([]);
    expect(planReminders(null, new Set(), on, sunday8am)).toEqual([]);
  });
});

describe('syncReminders', () => {
  const text = { title: (r: { dayName: string }) => `Today: ${r.dayName}`, body: () => 'body' };

  beforeEach(() => {
    native = true;
    localStorage.clear();
    cancel.mockReset().mockResolvedValue(undefined);
    schedule.mockReset().mockResolvedValue(undefined);
    loadActivePlan.mockReset().mockResolvedValue(plan);
    getSessions.mockReset().mockResolvedValue([]);
  });

  it('replaces the schedule, each reminder linking to its plan day', async () => {
    setReminderSettings(on);

    const planned = await syncReminders('user-1', text);

    expect(cancel).toHaveBeenCalled();
    expect(planned.length).toBeGreaterThan(0);
    const first = schedule.mock.calls[0][0].notifications[0];
    expect(first.title).toMatch(/^Today: /);
    expect(first.extra.url).toMatch(new RegExp(`^com\\.fitai\\.app://open\\?to=/workout/${PLAN_ID}/\\d$`));
  });

  it('only cancels when reminders are off', async () => {
    await syncReminders('user-1', text);

    expect(cancel).toHaveBeenCalled();
    expect(schedule).not.toHaveBeenCalled();
  });

  it('does nothing on the web', async () => {
    native = false;
    setReminderSettings(on);

    await syncReminders('user-1', text);

    expect(cancel).not.toHaveBeenCalled();
    expect(schedule).not.toHaveBeenCalled();
  });
});
