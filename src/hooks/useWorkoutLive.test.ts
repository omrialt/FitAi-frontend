import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

let native = true;
vi.mock('../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

const update = vi.fn();
const end = vi.fn();
vi.mock('../services/workout-live', () => ({
  updateSession: (...args: unknown[]) => update(...args),
  endSession: () => end(),
}));

const askPermission = vi.fn(() => Promise.resolve(true));
vi.mock('../services/rest-alarm', () => ({
  requestNotificationPermission: () => askPermission(),
}));

import { liveProgress, useWorkoutLive } from './useWorkoutLive';

const ex = (name: string, done: boolean[]) => ({
  name,
  sets: done.map((d) => ({ done: d })),
});

describe('liveProgress', () => {
  it('points at the first set not yet done', () => {
    expect(
      liveProgress([ex('Squat', [true, true, false, false]), ex('Lunge', [false, false])]),
    ).toEqual({ exercise: 'Squat', set: 3, of: 4, done: 2, total: 6, segments: [4, 2] });
  });

  it('moves to the next exercise once one is finished', () => {
    expect(liveProgress([ex('Squat', [true, true]), ex('Lunge', [true, false])])).toMatchObject({
      exercise: 'Lunge',
      set: 2,
      of: 2,
    });
  });

  it('has no next set when everything is done', () => {
    expect(liveProgress([ex('Squat', [true])])).toMatchObject({ exercise: null, done: 1, total: 1 });
  });
});

describe('useWorkoutLive', () => {
  beforeEach(() => {
    native = true;
    update.mockClear();
    end.mockClear();
    askPermission.mockClear();
  });

  it('asks for permission and shows the clock when the workout opens', () => {
    renderHook(() => useWorkoutLive(1_000, 'Leg day', [ex('Squat', [false])]));

    expect(askPermission).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ startedAt: 1_000, title: 'Leg day', done: 0, total: 1 }),
      expect.objectContaining({ restTitle: 'workout.rest' }),
    );
  });

  it('updates when a set is logged, and when a resumed draft moves the clock', () => {
    const { rerender } = renderHook(
      ({ startedAt, exercises }) => useWorkoutLive(startedAt, 'Leg day', exercises),
      { initialProps: { startedAt: 1_000, exercises: [ex('Squat', [false, false])] } },
    );

    rerender({ startedAt: 1_000, exercises: [ex('Squat', [true, false])] });
    expect(update.mock.lastCall?.[0]).toMatchObject({ done: 1 });

    rerender({ startedAt: 500, exercises: [ex('Squat', [true, false])] });
    expect(update.mock.lastCall?.[0]).toMatchObject({ startedAt: 500 });
  });

  it('takes the notification away with the workout screen', () => {
    const { unmount } = renderHook(() => useWorkoutLive(1_000, 'Leg day', []));

    unmount();

    expect(end).toHaveBeenCalled();
  });

  it('does nothing on the web', () => {
    native = false;
    const { unmount } = renderHook(() => useWorkoutLive(1_000, 'Leg day', []));
    unmount();

    expect(update).not.toHaveBeenCalled();
    expect(end).not.toHaveBeenCalled();
    expect(askPermission).not.toHaveBeenCalled();
  });
});
