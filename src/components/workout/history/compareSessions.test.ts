import { describe, expect, it } from 'vitest';
import { compareSessions, epley } from './compareSessions';
import type { WorkoutSession } from '../../../types/workout-session.types';

function session(
  exercises: WorkoutSession['exercises'],
  extra: Partial<WorkoutSession> = {},
): WorkoutSession {
  return {
    _id: Math.random().toString(36).slice(2),
    userId: 'u',
    performedAt: '2026-09-01T10:00:00Z',
    exercises,
    source: 'app',
    createdAt: '',
    updatedAt: '',
    ...extra,
  };
}

describe('compareSessions', () => {
  it('diffs e1RM and volume for exercises in both sessions', () => {
    const a = session([{ name: 'Bench Press', sets: [{ weight: 80, reps: 5 }] }]);
    const b = session([{ name: 'bench press', sets: [{ weight: 85, reps: 5 }] }]);

    const result = compareSessions(a, b);

    expect(result.exercises).toHaveLength(1);
    expect(result.exercises[0].e1rmDelta).toBe(
      Math.round((epley(85, 5) - epley(80, 5)) * 10) / 10,
    );
    expect(result.exercises[0].volumeDelta).toBe(25);
    expect(result.volumePercent).toBe(6);
  });

  it('keeps exercises that only one session had, with no delta', () => {
    const a = session([{ name: 'Pull-Up', sets: [{ weight: 0, reps: 10 }] }]);
    const b = session([{ name: 'Barbell Row', sets: [{ weight: 60, reps: 8 }] }]);

    const result = compareSessions(a, b);

    expect(result.exercises.map((e) => e.name)).toEqual([
      'Barbell Row',
      'Pull-Up',
    ]);
    expect(result.exercises[0].a).toBeNull();
    expect(result.exercises[1].b).toBeNull();
    expect(result.exercises.every((e) => e.e1rmDelta === null)).toBe(true);
  });

  it('counts drops toward volume but not toward the top set', () => {
    const a = session([{ name: 'Curl', sets: [{ weight: 20, reps: 10 }] }]);
    const b = session([
      {
        name: 'Curl',
        sets: [{ weight: 20, reps: 10, drops: [{ weight: 40, reps: 10 }] }],
      },
    ]);

    const [curl] = compareSessions(a, b).exercises;

    expect(curl.e1rmDelta).toBe(0);
    expect(curl.b?.topSet).toEqual({ weight: 20, reps: 10 });
    expect(curl.volumeDelta).toBe(400);
  });

  it('reports a bodyweight top set without inventing an e1RM', () => {
    const a = session([{ name: 'Dip', sets: [{ weight: 0, reps: 8 }] }]);
    const b = session([
      {
        name: 'Dip',
        sets: [
          { weight: 0, reps: 9 },
          { weight: 0, reps: 12 },
          { weight: 0, reps: 10 },
        ],
      },
    ]);

    const [dip] = compareSessions(a, b).exercises;

    expect(dip.b?.topSet).toEqual({ weight: 0, reps: 12 });
    expect(dip.e1rmDelta).toBeNull();
    expect(compareSessions(a, b).volumePercent).toBeNull();
  });

  it('totals sets, exercises and duration', () => {
    const a = session(
      [
        { name: 'Squat', sets: [{ weight: 100, reps: 5 }, { weight: 100, reps: 5 }] },
        { name: 'Lunge', sets: [{ weight: 20, reps: 10 }] },
      ],
      { durationMinutes: 55 },
    );

    const { a: totals } = compareSessions(a, a);

    expect(totals).toEqual({
      volume: 1200,
      sets: 3,
      exercises: 2,
      durationMinutes: 55,
    });
  });
});
