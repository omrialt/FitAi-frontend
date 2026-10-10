import type { SessionExercise, WorkoutSession } from '../../types/workout-session.types';

/**
 * Which earlier performance of an exercise the session screen starts from.
 *
 * Two questions, kept apart on purpose:
 *
 *   - **last** — what was actually done the last time this exercise was
 *     trained on this day. Always shown, in the "previous" line beside the
 *     inputs, because it is a fact and the user should be able to see it while
 *     typing over it.
 *   - **baseline** — what the sheet is pre-filled with. Usually the same
 *     session. But one off day (a light session after a bad night, a gym that
 *     only had the 20s free) used to become next week's starting point, with no
 *     weight given to the three sessions before it. So when the last session's
 *     top weight sits well below the typical one, the sheet starts from the
 *     most recent session that looks like this user's normal instead.
 *
 * Matching is by name first and by catalogue identity second. A plan renamed
 * between sessions — "Bench Press" then "לחיצת חזה" — used to lose its history
 * silently; when the catalogue says both names are the same exercise, they are.
 * Nothing fuzzy: a name the catalogue does not know matches only itself.
 */

/** A session's top weight below this fraction of the typical one is an off day. */
export const OFF_DAY_RATIO = 0.85;

/** `{ [name]: slug | null }` — from `GET /exercises/resolve`. */
export type SlugMap = Record<string, string | null>;

export interface Performance {
  exercise: SessionExercise;
  performedAt: string;
  /** Set when the session filed it under another name for the same exercise. */
  matchedAs?: string;
}

export interface Baseline {
  last: Performance | null;
  baseline: Performance | null;
  /** True when `baseline` is an earlier session because `last` was an off day. */
  skippedOffDay: boolean;
}

/** The exercise in one session that is the same exercise as `name`, if any. */
export function findPerformed(
  name: string,
  session: WorkoutSession,
  slugs: SlugMap,
): Performance | null {
  const exact = session.exercises.find((e) => e.name === name && e.sets.length > 0);
  if (exact) return { exercise: exact, performedAt: session.performedAt };

  const slug = slugs[name];
  if (!slug) return null;

  const same = session.exercises.find(
    (e) => e.sets.length > 0 && e.name !== name && slugs[e.name] === slug,
  );
  return same
    ? { exercise: same, performedAt: session.performedAt, matchedAs: same.name }
    : null;
}

function topWeight(exercise: SessionExercise): number {
  return Math.max(0, ...exercise.sets.map((set) => set.weight));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * The last performance and the one to pre-fill from.
 *
 * `sessions` is newest first — the order the server returns them in.
 *
 * Only the top weight is judged. A session cut short is not an off day: the
 * sets that were done are filled and the rest stay on the plan's
 * placeholders, which is right. Bodyweight work (no weight at all) is never
 * judged, since there is nothing to compare.
 */
export function pickBaseline(
  name: string,
  sessions: WorkoutSession[],
  slugs: SlugMap,
): Baseline {
  const found = sessions
    .map((session) => findPerformed(name, session, slugs))
    .filter((p): p is Performance => p !== null);

  const [last = null, ...earlier] = found;
  if (!last || earlier.length === 0) {
    return { last, baseline: last, skippedOffDay: false };
  }

  const typical = median(earlier.map((p) => topWeight(p.exercise)));
  const lastTop = topWeight(last.exercise);

  if (typical > 0 && lastTop < typical * OFF_DAY_RATIO) {
    // The most recent session that is not itself an off day.
    const normal = earlier.find((p) => topWeight(p.exercise) >= typical * OFF_DAY_RATIO);
    if (normal) return { last, baseline: normal, skippedOffDay: true };
  }

  return { last, baseline: last, skippedOffDay: false };
}
