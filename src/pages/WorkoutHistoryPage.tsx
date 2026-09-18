import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { AppLayout } from '../components/AppLayout';
import { StitchIcon } from '../components/common/StitchIcon';
import { StrengthCurve } from '../components/workout/StrengthCurve';
import { useMetadata } from '../hooks/useMetadata';
import { workoutSessionService } from '../services/workout-session.service';
import { useAuthStore } from '../store/authStore';
import type {
  PerformedSet,
  WorkoutSession,
} from '../types/workout-session.types';

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

/**
 * One logged set: `65 kg × 12`.
 *
 * `dir="ltr"` is the whole point of this being its own element. The chip is a
 * run of digits, a Hebrew unit and a neutral ×, and under a right-to-left
 * paragraph the bidi algorithm reorders those into a single number — 65 and
 * 12 came out of the log reading "6512". Isolating the chip pins weight,
 * unit and reps in that order in both languages, which is also the order
 * everyone writes a set in.
 */
function SetChip({
  set,
  ordinal,
  kg,
}: {
  set: PerformedSet;
  ordinal: number;
  kg: string;
}) {
  return (
    <div
      dir="ltr"
      className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-2 py-1.5"
    >
      {/* The set number, kept clear of the digits it sits next to so it does
          not read as part of the weight. */}
      <span className="w-4 shrink-0 text-center text-[10px] font-black tabular-nums text-on-surface-variant">
        {ordinal}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-1 text-sm font-bold tabular-nums text-on-surface">
          <span>{set.weight}</span>
          <span className="text-[10px] font-semibold text-on-surface-variant">
            {kg}
          </span>
          <span className="font-normal text-on-surface-variant">×</span>
          <span>{set.reps}</span>
          {/* Subdued rather than a separate chip: RPE qualifies the set, it is
              not another number of the same kind. */}
          {set.rpe != null && (
            <span className="text-[10px] font-semibold text-on-surface-variant">
              @{set.rpe}
            </span>
          )}
        </span>

        {/* Drops were logged but never shown here, so a drop set read as an
            ordinary one. Indented under the top portion, which is what they
            hang off. */}
        {set.drops?.length ? (
          <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[10px] font-semibold tabular-nums text-on-surface-variant">
            {set.drops.map((drop, i) => (
              <span key={i} className="flex items-baseline gap-x-1">
                <span aria-hidden="true">↳</span>
                <span>{drop.weight}</span>
                <span>{kg}</span>
                <span>×</span>
                <span>{drop.reps}</span>
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </div>
  );
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
  // Drops count, the way the server counts them: they are work performed, and
  // leaving them out made a drop-set session look lighter than a plain one.
  const volume = session.exercises.reduce(
    (sum, exercise) =>
      sum +
      exercise.sets.reduce(
        (s, set) =>
          s +
          set.weight * set.reps +
          (set.drops?.reduce((d, drop) => d + drop.weight * drop.reps, 0) ?? 0),
        0,
      ),
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
            className="rounded-lg bg-surface-container-low px-3 py-2.5"
          >
            {/* Name on its own line, sets in a grid beneath. The two used to
                share a wrapping flex row, which on a phone left the sets
                ragged — two on one line, one alone on the next, aligned to
                nothing. A grid gives every set the same box. */}
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-sm font-semibold text-on-surface">
                {exercise.name}
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {t('workout.setCountShort', { count: exercise.sets.length })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {exercise.sets.map((set, setIndex) => (
                <SetChip
                  key={setIndex}
                  set={set}
                  ordinal={setIndex + 1}
                  kg={t('common.kg')}
                />
              ))}
            </div>

            {exercise.notes && (
              <p className="mt-2 text-xs text-on-surface-variant">
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

  // Set by the dashboard's personal-bests card, so tapping a best opens the
  // curve for that lift rather than for whatever the server picks.
  const [searchParams] = useSearchParams();
  const focusExercise = searchParams.get('exercise') ?? undefined;

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

        {/* Above the log on purpose: the trend is the reason to open this page,
            and the session list is the evidence behind it. Only shown once
            there is a log to draw from. */}
        {user?._id && !loading && !error && sessions.length > 0 && (
          <div className="mb-6">
            <StrengthCurve userId={user._id} initialExercise={focusExercise} />
          </div>
        )}

        {loading ? (
          /* Skeleton rather than a spinner: the handoff calls for shimmer on
             lists and charts, and a spinner tells you nothing about what is
             arriving. These blocks match the session-card rhythm below. */
          <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
            <span className="sr-only">{t('common.loading')}</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-24" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton h-9 w-full" />
                  <div className="skeleton h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
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
