import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Crash protection for a workout in progress.
 *
 * Until this existed, the logger held the whole session in React state and
 * nowhere else: a refresh, a phone that killed the tab to free memory, or a
 * mis-tapped back gesture erased every set logged so far. In a gym, on a
 * phone, between sets, all three are ordinary — and the one thing the log
 * must never do is lose a workout that happened.
 *
 * Three decisions worth stating:
 *   - a restored draft is offered, never applied. Silently repopulating the
 *     screen would be indistinguishable from a bug the first time it happened
 *     after a workout the user had already finished elsewhere;
 *   - `startedAt` is stored with the draft, so a resumed session reports the
 *     real elapsed time instead of restarting the clock and writing a
 *     `durationMinutes` that never happened;
 *   - drafts expire. A draft from last Tuesday is not a workout to resume, and
 *     offering it would train the user to dismiss the prompt without reading
 *     it.
 */

const PREFIX = 'fitai-workout-draft:';
const VERSION = 1;

/** Past this, a draft is an artefact rather than an interrupted workout. */
export const DRAFT_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/** Writes are debounced: typing a weight should not hit storage per keystroke. */
const WRITE_DELAY_MS = 400;

export interface WorkoutDraftPayload<TExercise> {
  startedAt: number;
  notes: string;
  exercises: TExercise[];
}

interface StoredDraft<TExercise> extends WorkoutDraftPayload<TExercise> {
  version: number;
  savedAt: number;
}

function keyFor(planId: string, dayIndex: string | number): string {
  return `${PREFIX}${planId}:${dayIndex}`;
}

function isFresh(saved: unknown): boolean {
  return typeof saved === 'number' && Date.now() - saved < DRAFT_MAX_AGE_MS;
}

/**
 * Drops every expired draft, not just this day's.
 *
 * Without it, each abandoned workout leaves a key behind forever: a user who
 * starts and abandons sessions accumulates dead entries in a store with a
 * hard size limit shared by the auth token.
 */
function sweepExpired(): void {
  try {
    const doomed: string[] = [];

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;

      const raw = localStorage.getItem(key);
      if (!raw) {
        doomed.push(key);
        continue;
      }

      try {
        const parsed = JSON.parse(raw) as StoredDraft<unknown>;
        if (!isFresh(parsed.savedAt)) doomed.push(key);
      } catch {
        // Unparseable means it cannot be restored, so it is only taking space.
        doomed.push(key);
      }
    }

    doomed.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Private mode, disabled storage, quota errors — a workout must still be
    // loggable when persistence is not available.
  }
}

export interface UseWorkoutDraft<TExercise> {
  /**
   * A resumable draft found on mount, or `null`. Read once and not updated by
   * `save`, so the restore prompt does not reappear as the user types.
   */
  pending: WorkoutDraftPayload<TExercise> | null;
  /** Queues a write. Safe to call on every render of the editing screen. */
  save: (payload: WorkoutDraftPayload<TExercise>) => void;
  /** Removes the stored draft and cancels any queued write. */
  clear: () => void;
  /** Dismisses the offer without touching what is stored. */
  dismiss: () => void;
}

export function useWorkoutDraft<TExercise>(
  planId: string | undefined,
  dayIndex: string | number | undefined,
): UseWorkoutDraft<TExercise> {
  const storageKey =
    planId && dayIndex !== undefined ? keyFor(planId, dayIndex) : null;

  const [pending, setPending] = useState<WorkoutDraftPayload<TExercise> | null>(
    null,
  );
  const timer = useRef<number | null>(null);

  useEffect(() => {
    sweepExpired();

    // Whatever was on offer belonged to the previous key. Every early return
    // below leaves `pending` as it finds it, so without this a day with no
    // stored draft would keep offering the last one that had one — and
    // accepting it would paste one day's exercises onto another day's screen.
    // Unreachable until the logger grew a day picker, since the key could not
    // change while mounted.
    setPending(null);
    if (!storageKey) return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as StoredDraft<TExercise>;
      if (parsed.version !== VERSION || !isFresh(parsed.savedAt)) {
        localStorage.removeItem(storageKey);
        return;
      }
      if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
        return;
      }

      setPending({
        startedAt: parsed.startedAt,
        notes: parsed.notes ?? '',
        exercises: parsed.exercises,
      });
    } catch {
      // A draft that cannot be read is not worth failing the screen over.
    }
  }, [storageKey]);

  // A queued write must not land after the session was saved and cleared.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const save = useCallback(
    (payload: WorkoutDraftPayload<TExercise>) => {
      if (!storageKey) return;
      if (timer.current !== null) window.clearTimeout(timer.current);

      timer.current = window.setTimeout(() => {
        try {
          const record: StoredDraft<TExercise> = {
            ...payload,
            version: VERSION,
            savedAt: Date.now(),
          };
          localStorage.setItem(storageKey, JSON.stringify(record));
        } catch {
          // Over quota or storage disabled. The session still saves to the
          // server on finish; only the crash net is missing.
        }
      }, WRITE_DELAY_MS);
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setPending(null);
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Nothing to do — the next sweep will catch it.
    }
  }, [storageKey]);

  const dismiss = useCallback(() => setPending(null), []);

  return { pending, save, clear, dismiss };
}
