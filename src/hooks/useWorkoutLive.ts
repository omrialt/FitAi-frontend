import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isNativeApp } from '../config/platform';
import { requestNotificationPermission } from '../services/rest-alarm';
import { endSession, updateSession } from '../services/workout-live';

interface LiveExercise {
  name: string;
  sets: { done: boolean }[];
}

export interface LiveProgress {
  /** The exercise with the next set to do, or null when every set is done. */
  exercise: string | null;
  /** 1-based number of that set within its exercise. */
  set: number;
  of: number;
  done: number;
  total: number;
  segments: number[];
}

/** Where the workout stands, for the notification. */
export function liveProgress(exercises: LiveExercise[]): LiveProgress {
  let done = 0;
  let total = 0;
  let next: Pick<LiveProgress, 'exercise' | 'set' | 'of'> = { exercise: null, set: 0, of: 0 };

  for (const exercise of exercises) {
    total += exercise.sets.length;
    done += exercise.sets.filter((s) => s.done).length;

    if (next.exercise === null) {
      const index = exercise.sets.findIndex((s) => !s.done);
      if (index >= 0) {
        next = { exercise: exercise.name, set: index + 1, of: exercise.sets.length };
      }
    }
  }

  return { ...next, done, total, segments: exercises.map((e) => e.sets.length) };
}

/**
 * Keeps the live workout notification in step with the workout on screen.
 *
 * Mounted with the workout screen: asks for notification permission (starting
 * a workout is the reason the user sees for the prompt), shows the session
 * clock from the first render, updates when a set is logged, and takes the
 * notification away when the screen goes — finished, abandoned or navigated
 * from.
 */
export function useWorkoutLive(
  startedAt: number,
  dayName: string | undefined,
  exercises: LiveExercise[],
) {
  const { t, i18n } = useTranslation();
  const progress = useMemo(() => liveProgress(exercises), [exercises]);

  useEffect(() => {
    if (!isNativeApp) return;
    void requestNotificationPermission();
    return () => endSession();
  }, []);

  useEffect(() => {
    if (!isNativeApp) return;

    const started = new Date(startedAt).toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
    });

    updateSession(
      {
        startedAt,
        title: dayName || t('workout.liveTitle'),
        text: progress.exercise
          ? t('workout.liveNext', {
              exercise: progress.exercise,
              set: progress.set,
              of: progress.of,
            })
          : t('workout.liveAllDone'),
        done: progress.done,
        total: progress.total,
        segments: progress.segments,
      },
      {
        restTitle: t('workout.rest'),
        sessionText: t('workout.liveStarted', { time: started }),
        plus30: t('workout.livePlus30'),
        skip: t('workout.liveSkipRest'),
      },
    );
  }, [startedAt, dayName, progress, t, i18n.language]);
}
