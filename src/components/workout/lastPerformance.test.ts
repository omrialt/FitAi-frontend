import { describe, it, expect } from 'vitest';

import { findPerformed, pickBaseline } from './lastPerformance';
import type { WorkoutSession } from '../../types/workout-session.types';

const session = (
  performedAt: string,
  exercises: { name: string; weights: number[] }[],
): WorkoutSession =>
  ({
    _id: performedAt,
    userId: 'u1',
    performedAt,
    exercises: exercises.map(({ name, weights }) => ({
      name,
      sets: weights.map((weight) => ({ reps: 8, weight })),
    })),
  }) as unknown as WorkoutSession;

describe('findPerformed', () => {
  it('matches by exact name first', () => {
    const s = session('2026-10-08', [{ name: 'Bench Press', weights: [80] }]);
    expect(findPerformed('Bench Press', s, {})?.matchedAs).toBeUndefined();
  });

  it('matches a renamed exercise through the catalogue, and says so', () => {
    const s = session('2026-10-08', [{ name: 'לחיצת חזה', weights: [80] }]);
    const slugs = { 'Bench Press': 'bench-press', 'לחיצת חזה': 'bench-press' };

    const found = findPerformed('Bench Press', s, slugs);
    expect(found?.matchedAs).toBe('לחיצת חזה');
    expect(found?.exercise.sets[0].weight).toBe(80);
  });

  it('does not match unknown names to each other', () => {
    const s = session('2026-10-08', [{ name: 'Machine Row', weights: [50] }]);
    expect(findPerformed('Cable Row', s, { 'Cable Row': null, 'Machine Row': null })).toBeNull();
  });

  it('does not match two different catalogue exercises', () => {
    const s = session('2026-10-08', [{ name: 'Incline Press', weights: [60] }]);
    const slugs = { 'Bench Press': 'bench-press', 'Incline Press': 'incline-bench-press' };
    expect(findPerformed('Bench Press', s, slugs)).toBeNull();
  });
});

describe('pickBaseline', () => {
  const history = (lastWeights: number[]) => [
    session('2026-10-08', [{ name: 'Squat', weights: lastWeights }]),
    session('2026-10-01', [{ name: 'Squat', weights: [100, 100, 100] }]),
    session('2026-09-24', [{ name: 'Squat', weights: [97.5, 97.5, 97.5] }]),
  ];

  it('starts from the last session when it was an ordinary one', () => {
    const result = pickBaseline('Squat', history([102.5, 102.5, 102.5]), {});
    expect(result.baseline?.performedAt).toBe('2026-10-08');
    expect(result.skippedOffDay).toBe(false);
  });

  it('skips one off day and starts from the session before it', () => {
    const result = pickBaseline('Squat', history([70, 70, 70]), {});

    expect(result.last?.performedAt).toBe('2026-10-08');
    expect(result.baseline?.performedAt).toBe('2026-10-01');
    expect(result.skippedOffDay).toBe(true);
  });

  it('does not call a session cut short an off day', () => {
    const result = pickBaseline('Squat', history([102.5]), {});
    expect(result.baseline?.performedAt).toBe('2026-10-08');
  });

  it('uses the last session when there is nothing to compare it with', () => {
    const result = pickBaseline('Squat', [session('2026-10-08', [{ name: 'Squat', weights: [40] }])], {});
    expect(result.baseline?.performedAt).toBe('2026-10-08');
    expect(result.skippedOffDay).toBe(false);
  });

  it('never judges bodyweight work', () => {
    const sessions = [
      session('2026-10-08', [{ name: 'Pull Up', weights: [0] }]),
      session('2026-10-01', [{ name: 'Pull Up', weights: [0] }]),
    ];
    expect(pickBaseline('Pull Up', sessions, {}).skippedOffDay).toBe(false);
  });

  it('skips sessions where the exercise was not done at all', () => {
    const sessions = [
      session('2026-10-08', [{ name: 'Other', weights: [10] }]),
      session('2026-10-01', [{ name: 'Squat', weights: [100] }]),
    ];
    const result = pickBaseline('Squat', sessions, {});
    expect(result.last?.performedAt).toBe('2026-10-01');
  });

  it('is empty for an exercise never performed', () => {
    expect(pickBaseline('Squat', [], {})).toEqual({
      last: null,
      baseline: null,
      skippedOffDay: false,
    });
  });
});
