import { describe, it, expect, vi, beforeEach } from 'vitest';

let native = true;
vi.mock('../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

const show = vi.fn();
const stop = vi.fn();
vi.mock('@capacitor/core', () => ({
  registerPlugin: () => ({
    show: (...args: unknown[]) => show(...args),
    stop: () => stop(),
    getStatus: vi.fn(),
    openSettings: vi.fn(),
    addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })),
  }),
}));

import { endSession, setRest, updateSession } from './workout-live';

const info = {
  startedAt: 1_000,
  title: 'Leg day',
  text: 'Squat · set 3 of 4',
  done: 7,
  total: 12,
  segments: [4, 4, 4],
};
const labels = { restTitle: 'Rest', sessionText: 'started 13:30', plus30: '+30s', skip: 'Skip rest' };

const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve));

describe('workout-live', () => {
  beforeEach(() => {
    native = true;
    show.mockReset().mockResolvedValue(undefined);
    stop.mockReset().mockResolvedValue(undefined);
    // Start every test from no session.
    endSession();
    stop.mockClear();
  });

  it('shows the workout clock for the session', async () => {
    updateSession(info, labels);
    await flush();

    expect(show).toHaveBeenCalledTimes(1);
    expect(show.mock.calls[0][0]).toMatchObject({
      startedAt: 1_000,
      title: 'Leg day',
      done: 7,
      total: 12,
      segments: [4, 4, 4],
    });
    expect(show.mock.calls[0][0]).not.toHaveProperty('restDeadline');
  });

  it('switches to the rest countdown and back', async () => {
    updateSession(info, labels);
    const deadline = Date.now() + 60_000;

    setRest(deadline);
    await flush();
    expect(show).toHaveBeenLastCalledWith(expect.objectContaining({ restDeadline: deadline }));

    setRest(null);
    await flush();
    expect(show.mock.lastCall?.[0]).not.toHaveProperty('restDeadline');
  });

  // Android runs the clocks; the page sends one update per change.
  it('sends changes made together as one update', async () => {
    updateSession(info, labels);
    updateSession({ ...info, done: 8 }, labels);
    setRest(Date.now() + 60_000);
    await flush();

    expect(show).toHaveBeenCalledTimes(1);
    expect(show.mock.calls[0][0]).toMatchObject({ done: 8 });
  });

  it('removes the notification when the workout ends', async () => {
    updateSession(info, labels);
    endSession();
    await flush();

    expect(stop).toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('does nothing on the web', async () => {
    native = false;
    updateSession(info, labels);
    setRest(Date.now() + 60_000);
    endSession();
    await flush();

    expect(show).not.toHaveBeenCalled();
    expect(stop).not.toHaveBeenCalled();
  });
});
