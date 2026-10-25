import { describe, it, expect, vi, beforeEach } from 'vitest';

let native = true;
vi.mock('../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

const update = vi.fn<(...args: unknown[]) => Promise<void>>(() => Promise.resolve());
const clear = vi.fn(() => Promise.resolve());
vi.mock('@capacitor/core', () => ({
  registerPlugin: () => ({ update: (...a: unknown[]) => update(...a), clear: () => clear() }),
}));

const loadActivePlan = vi.fn();
vi.mock('./active-plan', () => ({ loadActivePlan: (...a: unknown[]) => loadActivePlan(...a) }));
const getByUserId = vi.fn();
const getStats = vi.fn();
vi.mock('./workout-session.service', () => ({
  workoutSessionService: {
    getByUserId: (...a: unknown[]) => getByUserId(...a),
    getStats: (...a: unknown[]) => getStats(...a),
  },
}));

import { buildWidgetState, clearWidget, syncWidget, type WidgetText } from './home-widget';

const text = { start: 'Start', weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] } as WidgetText;
const PLAN_ID = 'd'.repeat(24);
const plan = {
  _id: PLAN_ID,
  days: [
    { dayName: 'Push', dayOfWeek: 0, exercises: [{}, {}, {}] },
    { dayName: 'Legs', dayOfWeek: 3, exercises: [{}, {}] },
  ],
} as never;

describe('buildWidgetState', () => {
  // The widget works "today" out itself, so it gets the whole week.
  it("sends the week's schedule, not today", () => {
    const state = buildWidgetState(plan, [], 3, text);

    expect(state).toMatchObject({ signedIn: true, planId: PLAN_ID, streakWeeks: 3, lastTrainedDate: null });
    expect(state.days).toEqual([
      { dow: 0, index: 0, name: 'Push', exercises: 3 },
      { dow: 3, index: 1, name: 'Legs', exercises: 2 },
    ]);
    expect(state.text).toBe(text);
  });

  it('records the last day trained, in local time', () => {
    const state = buildWidgetState(
      plan,
      [{ performedAt: new Date(2026, 9, 25, 8, 0).toISOString() }, { performedAt: new Date(2026, 9, 25, 19, 0).toISOString() }],
      0,
      text,
    );

    expect(state.lastTrainedDate).toBe('2026-10-25');
  });

  it('has no plan to show when there is none', () => {
    expect(buildWidgetState(null, [], 0, text)).toMatchObject({ planId: '', days: [] });
  });
});

describe('syncWidget / clearWidget', () => {
  beforeEach(() => {
    native = true;
    update.mockClear();
    clear.mockClear();
    loadActivePlan.mockReset().mockResolvedValue(plan);
    getByUserId.mockReset().mockResolvedValue([]);
    getStats.mockReset().mockResolvedValue({ streak: { currentWeeks: 4 } });
  });

  it('hands the widget the plan and streak', async () => {
    await syncWidget('u1', text);

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ planId: PLAN_ID, streakWeeks: 4 }));
  });

  it('still updates when the stats call fails', async () => {
    getStats.mockRejectedValue(new Error('500'));

    await syncWidget('u1', text);

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ streakWeeks: 0 }));
  });

  it('forgets the plan on sign-out', async () => {
    await clearWidget();

    expect(clear).toHaveBeenCalled();
  });

  it('does nothing on the web', async () => {
    native = false;

    await syncWidget('u1', text);
    await clearWidget();

    expect(update).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });
});
