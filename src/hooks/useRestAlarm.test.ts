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

const show = vi.fn();
const hide = vi.fn();
vi.mock('../services/rest-timer-live', () => ({
  showRestCountdown: (...args: unknown[]) => show(...args),
  hideRestCountdown: () => hide(),
}));

import { useRestAlarm } from './useRestAlarm';

const text = {
  title: 'workout.restOver',
  body: 'workout.restAlarmBody',
  countdown: 'workout.rest',
};
const alarmText = { title: text.title, body: text.body };

describe('useRestAlarm', () => {
  beforeEach(() => {
    native = true;
    arm.mockClear();
    disarm.mockClear();
    show.mockClear();
    hide.mockClear();
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

  describe('status-bar countdown', () => {
    it('shows while a timer runs, app open or not', () => {
      renderHook(() => useRestAlarm(true, 123_000, text));

      expect(show).toHaveBeenCalledWith(123_000, 'workout.rest');
    });

    it('is replaced by a new timer and removed when stopped', () => {
      const { rerender } = renderHook(
        ({ running, deadline }) => useRestAlarm(running, deadline, text),
        { initialProps: { running: true, deadline: 1000 } },
      );

      rerender({ running: true, deadline: 5000 });
      expect(show).toHaveBeenLastCalledWith(5000, 'workout.rest');

      rerender({ running: false, deadline: 5000 });
      expect(hide).toHaveBeenCalled();
    });

    it('leaves with the workout screen', () => {
      const { unmount } = renderHook(() => useRestAlarm(true, 123_000, text));
      hide.mockClear();

      unmount();

      expect(hide).toHaveBeenCalled();
    });
  });

  it('does nothing on the web', () => {
    native = false;
    renderHook(() => useRestAlarm(true, 123_000, text));

    expect(listeners.pause).toBeUndefined();
    expect(disarm).not.toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });
});
