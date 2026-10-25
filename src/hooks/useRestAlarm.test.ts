import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

let native = true;
vi.mock('../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

const listeners: Record<string, () => void> = {};
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn((event: string, fn: () => void) => {
      listeners[event] = fn;
      return Promise.resolve({ remove: vi.fn() });
    }),
  },
}));

const arm = vi.fn();
const disarm = vi.fn();
vi.mock('../services/rest-alarm', () => ({
  armRestAlarm: (...args: unknown[]) => arm(...args),
  disarmRestAlarm: () => disarm(),
}));

const setRest = vi.fn();
vi.mock('../services/workout-live', () => ({
  setRest: (...args: unknown[]) => setRest(...args),
}));

import { useRestAlarm } from './useRestAlarm';

const text = { title: 'workout.restOver', body: 'workout.restAlarmBody' };
const alarmText = text;

describe('useRestAlarm', () => {
  beforeEach(() => {
    native = true;
    arm.mockClear();
    disarm.mockClear();
    setRest.mockClear();
    for (const key of Object.keys(listeners)) delete listeners[key];
  });

  it('arms at the deadline when the app is paused mid-countdown', () => {
    renderHook(() => useRestAlarm(true, 123_000, text));

    listeners.pause();

    expect(arm).toHaveBeenCalledWith(123_000, alarmText);
  });

  it('does not arm when no countdown is running', () => {
    renderHook(() => useRestAlarm(false, 0, text));

    listeners.pause();

    expect(arm).not.toHaveBeenCalled();
  });

  // Visible and hidden must never both sound.
  it('disarms when the app comes back', () => {
    renderHook(() => useRestAlarm(true, 123_000, text));
    disarm.mockClear();

    listeners.resume();

    expect(disarm).toHaveBeenCalledTimes(1);
  });

  it('disarms when the countdown stops or restarts', () => {
    const { rerender } = renderHook(
      ({ running, deadline }) => useRestAlarm(running, deadline, text),
      { initialProps: { running: true, deadline: 1000 } },
    );
    disarm.mockClear();

    rerender({ running: true, deadline: 5000 });
    expect(disarm).toHaveBeenCalledTimes(1);

    rerender({ running: false, deadline: 5000 });
    expect(disarm).toHaveBeenCalledTimes(2);
  });

  describe('live workout notification', () => {
    it('switches to the rest countdown while a timer runs', () => {
      renderHook(() => useRestAlarm(true, 123_000, text));

      expect(setRest).toHaveBeenCalledWith(123_000);
    });

    it('follows a restart and goes back to the workout clock on stop', () => {
      const { rerender } = renderHook(
        ({ running, deadline }) => useRestAlarm(running, deadline, text),
        { initialProps: { running: true, deadline: 1000 } },
      );

      rerender({ running: true, deadline: 5000 });
      expect(setRest).toHaveBeenLastCalledWith(5000);

      rerender({ running: false, deadline: 5000 });
      expect(setRest).toHaveBeenLastCalledWith(null);
    });
  });

  // "+30" from the lock screen moves the deadline while the app is hidden.
  it('re-arms the alarm when the deadline moves in the background', () => {
    const { rerender } = renderHook(
      ({ deadline }) => useRestAlarm(true, deadline, text),
      { initialProps: { deadline: 1000 } },
    );
    listeners.pause();
    arm.mockClear();

    rerender({ deadline: 31_000 });

    expect(arm).toHaveBeenCalledWith(31_000, alarmText);
  });

  it('does nothing on the web', () => {
    native = false;
    renderHook(() => useRestAlarm(true, 123_000, text));

    expect(listeners.pause).toBeUndefined();
    expect(disarm).not.toHaveBeenCalled();
    expect(setRest).not.toHaveBeenCalled();
  });
});
