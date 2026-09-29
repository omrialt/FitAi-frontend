import type {
  PerformedSet,
  SessionExercise,
  WorkoutSession,
} from '../../../types/workout-session.types';

/**
 * Two performances of the same workout, side by side.
 *
 * Kept free of React so the arithmetic can be tested on its own. The rules
 * are the server's (see `set-math.ts` there): drops count toward volume and
 * never toward a strength figure, and the strength figure is Epley on the
 * top portion of the best set.
 */

export interface ExerciseSnapshot {
  sets: number;
  volume: number;
  /** Best set by e1RM — top portion only. */
  topSet: { weight: number; reps: number } | null;
  e1rm: number;
}

export interface ExerciseDiff {
  name: string;
  /** `null` when the exercise was not in that session. */
  a: ExerciseSnapshot | null;
  b: ExerciseSnapshot | null;
  /** B against A in kg of e1RM; `null` unless both have a loaded top set. */
  e1rmDelta: number | null;
  volumeDelta: number | null;
}

export interface SessionTotals {
  volume: number;
  sets: number;
  exercises: number;
  durationMinutes: number | null;
}

export interface SessionComparison {
  a: SessionTotals;
  b: SessionTotals;
  /** Percent change of B's volume against A's; `null` when A has none. */
  volumePercent: number | null;
  exercises: ExerciseDiff[];
}

export function epley(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function setVolume(set: PerformedSet): number {
  return (
    set.weight * set.reps +
    (set.drops?.reduce((sum, drop) => sum + drop.weight * drop.reps, 0) ?? 0)
  );
}

export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (sum, exercise) =>
      sum + exercise.sets.reduce((s, set) => s + setVolume(set), 0),
    0,
  );
}

function snapshot(exercises: SessionExercise[]): ExerciseSnapshot {
  let sets = 0;
  let volume = 0;
  let topSet: ExerciseSnapshot['topSet'] = null;
  let e1rm = 0;

  // The same exercise can appear twice in one session (a superset partner
  // logged again later); both count.
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      sets += 1;
      volume += setVolume(set);
      const estimate = epley(set.weight, set.reps);
      // Ties — every bodyweight set is an e1RM of 0 — go to the most reps.
      if (
        !topSet ||
        estimate > e1rm ||
        (estimate === e1rm && set.reps > topSet.reps)
      ) {
        e1rm = estimate;
        topSet = { weight: set.weight, reps: set.reps };
      }
    }
  }

  return { sets, volume, topSet, e1rm };
}

function totals(session: WorkoutSession): SessionTotals {
  return {
    volume: Math.round(sessionVolume(session)),
    sets: session.exercises.reduce((sum, e) => sum + e.sets.length, 0),
    exercises: new Set(session.exercises.map((e) => key(e.name))).size,
    durationMinutes: session.durationMinutes ?? null,
  };
}

const key = (name: string) => name.trim().toLowerCase();

/** `a` is the earlier session, `b` the later one. */
export function compareSessions(
  a: WorkoutSession,
  b: WorkoutSession,
): SessionComparison {
  // Order: B's exercises as performed, then anything only A had — the later
  // session is the one being judged, so it sets the reading order.
  const order: string[] = [];
  const names = new Map<string, string>();
  for (const exercise of [...b.exercises, ...a.exercises]) {
    const k = key(exercise.name);
    if (!names.has(k)) {
      names.set(k, exercise.name.trim());
      order.push(k);
    }
  }

  const group = (session: WorkoutSession, k: string) =>
    session.exercises.filter((e) => key(e.name) === k);

  const exercises = order.map<ExerciseDiff>((k) => {
    const inA = group(a, k);
    const inB = group(b, k);
    const sa = inA.length ? snapshot(inA) : null;
    const sb = inB.length ? snapshot(inB) : null;

    return {
      name: names.get(k) ?? k,
      a: sa,
      b: sb,
      e1rmDelta:
        sa && sb && sa.e1rm > 0 && sb.e1rm > 0
          ? Math.round((sb.e1rm - sa.e1rm) * 10) / 10
          : null,
      volumeDelta: sa && sb ? Math.round(sb.volume - sa.volume) : null,
    };
  });

  const ta = totals(a);
  const tb = totals(b);

  return {
    a: ta,
    b: tb,
    volumePercent:
      ta.volume > 0 ? Math.round(((tb.volume - ta.volume) / ta.volume) * 100) : null,
    exercises,
  };
}
