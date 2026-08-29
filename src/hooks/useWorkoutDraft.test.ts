import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useWorkoutDraft, DRAFT_MAX_AGE_MS } from './useWorkoutDraft';

interface Ex {
  name: string;
}

const KEY = 'fitai-workout-draft:plan1:0';

function seed(key: string, draft: Record<string, unknown>) {
  localStorage.setItem(key, JSON.stringify(draft));
}

const validDraft = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  savedAt: Date.now(),
  startedAt: Date.now() - 60_000,
  notes: 'felt heavy',
  exercises: [{ name: 'Squat' }],
  ...overrides,
});

describe('useWorkoutDraft', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('offers a fresh draft for the same plan day', () => {
    seed(KEY, validDraft());

    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    expect(result.current.pending?.exercises).toEqual([{ name: 'Squat' }]);
    expect(result.current.pending?.notes).toBe('felt heavy');
  });

  // The whole reason startedAt is stored: a resumed session must report the
  // real elapsed time, not restart the clock.
  it('carries the original start time through a restore', () => {
    const startedAt = Date.now() - 15 * 60_000;
    seed(KEY, validDraft({ startedAt }));

    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    expect(result.current.pending?.startedAt).toBe(startedAt);
  });

  it('ignores and removes a draft past its expiry', () => {
    seed(KEY, validDraft({ savedAt: Date.now() - DRAFT_MAX_AGE_MS - 1000 }));

    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    expect(result.current.pending).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('does not offer a draft from a different training day', () => {
    seed('fitai-workout-draft:plan1:1', validDraft());

    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    expect(result.current.pending).toBeNull();
  });

  it('does not offer an empty draft', () => {
    seed(KEY, validDraft({ exercises: [] }));

    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    expect(result.current.pending).toBeNull();
  });

  it('discards a draft written by an older version', () => {
    seed(KEY, validDraft({ version: 0 }));

    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    expect(result.current.pending).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('survives unparseable storage instead of breaking the screen', () => {
    localStorage.setItem(KEY, 'not json');

    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    expect(result.current.pending).toBeNull();
  });

  it('sweeps expired drafts left behind by other sessions', () => {
    seed('fitai-workout-draft:other:3', validDraft({ savedAt: 0 }));
    seed(KEY, validDraft());

    renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    expect(localStorage.getItem('fitai-workout-draft:other:3')).toBeNull();
    expect(localStorage.getItem(KEY)).not.toBeNull();
  });

  it('writes after the debounce window', () => {
    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    act(() => {
      result.current.save({
        startedAt: 1000,
        notes: '',
        exercises: [{ name: 'Bench' }],
      });
    });

    expect(localStorage.getItem(KEY)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const stored = JSON.parse(localStorage.getItem(KEY) as string);
    expect(stored.exercises).toEqual([{ name: 'Bench' }]);
    expect(stored.startedAt).toBe(1000);
  });

  it('collapses rapid saves into one write', () => {
    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    act(() => {
      result.current.save({ startedAt: 1, notes: 'a', exercises: [{ name: 'A' }] });
      result.current.save({ startedAt: 1, notes: 'ab', exercises: [{ name: 'A' }] });
      vi.advanceTimersByTime(500);
    });

    const stored = JSON.parse(localStorage.getItem(KEY) as string);
    expect(stored.notes).toBe('ab');
  });

  // The bug this guards: a debounced write landing after the session was
  // saved would resurrect a draft for a workout already filed on the server.
  it('cancels a queued write when the draft is cleared', () => {
    seed(KEY, validDraft());
    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    act(() => {
      result.current.save({ startedAt: 1, notes: '', exercises: [{ name: 'A' }] });
      result.current.clear();
      vi.advanceTimersByTime(2000);
    });

    expect(localStorage.getItem(KEY)).toBeNull();
    expect(result.current.pending).toBeNull();
  });

  it('dismiss hides the offer without deleting the draft', () => {
    seed(KEY, validDraft());
    const { result } = renderHook(() => useWorkoutDraft<Ex>('plan1', 0));

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.pending).toBeNull();
    expect(localStorage.getItem(KEY)).not.toBeNull();
  });

  it('does nothing at all without a plan day', () => {
    const { result } = renderHook(() =>
      useWorkoutDraft<Ex>(undefined, undefined),
    );

    act(() => {
      result.current.save({ startedAt: 1, notes: '', exercises: [{ name: 'A' }] });
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.pending).toBeNull();
    expect(localStorage.length).toBe(0);
  });
});
