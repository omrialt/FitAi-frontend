import { useCallback, useEffect, useState } from 'react';
import { Container, Center, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { AppLayout } from '../components/AppLayout';
import { StitchIcon } from '../components/common/StitchIcon';
import { useMetadata } from '../hooks/useMetadata';
import { workoutSessionService } from '../services/workout-session.service';
import { useAuthStore } from '../store/authStore';
import type { WorkoutSession } from '../types/workout-session.types';

/**
 * The user's own training log.
 *
 * The log collection and its endpoints already existed, but the only screen
 * that read them was the trainer's client view — so a user could record a
 * workout and then find no trace of it anywhere in their own app beyond the
 * aggregate counters on the dashboard. This is that missing screen.
 *
 * Sessions render expanded rather than behind a click: the point of opening
 * this page is to see what was lifted, and a list of dates alone answers
 * nothing the dashboard did not already say.
 */

/** Sessions grouped under a day heading, newest day first. */
function groupByDay(sessions: WorkoutSession[]): [string, WorkoutSession[]][] {
  const groups = new Map<string, WorkoutSession[]>();

  for (const session of sessions) {
    const key = new Date(session.performedAt).toISOString().slice(0, 10);
    const bucket = groups.get(key);
    if (bucket) bucket.push(session);
    else groups.set(key, [session]);
  }

  return [...groups.entries()];
}

function SessionCard({
  session,
  locale,
}: {
  session: WorkoutSession;
  locale: string;
}) {
  const { t } = useTranslation();

  const totalSets = session.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  );
  // Volume is the one number that compares two sessions of the same workout
  // honestly — more weight at fewer reps and less weight at more reps both
  // move it in the right direction.
  const volume = session.exercises.reduce(
    (sum, exercise) =>
      sum +
      exercise.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );

  const time = new Date(session.performedAt).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold tracking-tight text-on-surface">
            {session.dayName || session.planTitle || t('workout.freeSession')}
          </h3>
          {session.dayName && session.planTitle && (
            <p className="truncate text-xs text-on-surface-variant">
              {session.planTitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-on-surface-variant">
          <span className="tabular-nums">{time}</span>
          {session.durationMinutes ? (
            <span className="flex items-center gap-1">
              <StitchIcon name="timer" size={14} />
              {t('workout.minutesShort', { minutes: session.durationMinutes })}
            </span>
          ) : null}
          <span>{t('workout.setCountShort', { count: totalSets })}</span>
          <span className="tabular-nums">
            {t('workout.volume', { volume: Math.round(volume) })}
          </span>
        </div>
      </header>

      <ul className="flex flex-col gap-2">
        {session.exercises.map((exercise, index) => (
          <li
            key={`${exercise.name}-${index}`}
            className="rounded-lg bg-surface-container-low px-3 py-2"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-on-surface">
                {exercise.name}
              </span>
              <span className="flex flex-wrap gap-2">
                {exercise.sets.map((set, setIndex) => (
                  <span
                    key={setIndex}
                    className="rounded-md bg-surface-container-high px-2 py-0.5 text-xs font-bold tabular-nums text-on-surface"
                  >
                    {set.weight}
                    {t('common.kg')} × {set.reps}
                  </span>
                ))}
              </span>
            </div>
            {exercise.notes && (
              <p className="mt-1 text-xs text-on-surface-variant">
                {exercise.notes}
              </p>
            )}
          </li>
        ))}
      </ul>

      {session.notes && (
        <p className="mt-4 rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">
          {session.notes}
        </p>
      )}
    </article>
  );
}

export default function WorkoutHistoryPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const metadata = useMetadata({
    title: `${t('workout.historyTitle')} - FitAI`,
  });

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(false);
    try {
      setSessions(await workoutSessionService.getByUserId(user._id));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const days = groupByDay(sessions);

  return (
    <AppLayout>
      {metadata}
      <Container size="md" py="md">
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-on-surface">
            {t('workout.historyTitle')}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t('workout.historySubtitle')}
          </p>
        </header>

        {loading ? (
          <Center h={240}>
            <Loader size="lg" />
          </Center>
        ) : error ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t('common.error')}
            color="red"
            variant="light"
          >
            {t('workout.historyLoadFailed')}
          </Alert>
        ) : sessions.length === 0 ? (
          <p className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
            {t('workout.noSessions')}
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {days.map(([day, daySessions]) => (
              <section key={day}>
                <h2 className="mb-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  {new Date(day).toLocaleDateString(i18n.language, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <div className="flex flex-col gap-3">
                  {daySessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      locale={i18n.language}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </AppLayout>
  );
}
