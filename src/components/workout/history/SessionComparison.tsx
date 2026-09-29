import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkoutSession } from '../../../types/workout-session.types';
import { StitchIcon } from '../../common/StitchIcon';
import { compareSessions, type ExerciseSnapshot } from './compareSessions';
import { Delta } from './shared';

/**
 * Two sessions of one workout type, side by side.
 *
 * Opens on the latest against the one before it — "did today beat last
 * time" is the comparison nearly everyone wants — and either side can be
 * pointed at any other session of the type to compare across a block.
 */

interface SessionComparisonProps {
  /** Sessions of one type, newest first. */
  sessions: WorkoutSession[];
  name: string;
}

export function SessionComparison({ sessions, name }: SessionComparisonProps) {
  const { t, i18n } = useTranslation();
  const kg = t('common.kg');

  const [laterId, setLaterId] = useState<string | null>(null);
  const [earlierId, setEarlierId] = useState<string | null>(null);

  // Fall back to the defaults whenever a picked id is no longer in the list —
  // the filters above can narrow it underneath this panel. Each side only
  // offers sessions on its own side of the other, so "later" can never be
  // pointed at something older than "earlier" and invert every delta.
  const time = (s: WorkoutSession) => new Date(s.performedAt).getTime();
  const later = sessions.find((s) => s._id === laterId) ?? sessions[0];
  const olderThanLater = later
    ? sessions.filter((s) => s._id !== later._id && time(s) <= time(later))
    : [];
  const earlier =
    olderThanLater.find((s) => s._id === earlierId) ?? olderThanLater[0];
  const newerThanEarlier = earlier
    ? sessions.filter((s) => s._id !== earlier._id && time(s) >= time(earlier))
    : sessions;

  const comparison = useMemo(
    () => (later && earlier ? compareSessions(earlier, later) : null),
    [earlier, later],
  );

  // Two sessions on one day are common (a morning and an evening, or a
  // re-logged workout), and two identical dates in the pickers read as one
  // session compared with itself — so the time joins the label when a day
  // repeats.
  const dayOf = (s: WorkoutSession) => new Date(s.performedAt).toDateString();
  const repeatedDays = new Set(
    sessions
      .map(dayOf)
      .filter((day, i, all) => all.indexOf(day) !== i),
  );
  const label = (session: WorkoutSession) => {
    const date = new Date(session.performedAt);
    const text = date.toLocaleDateString(i18n.language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
    return repeatedDays.has(dayOf(session))
      ? `${text} · ${date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}`
      : text;
  };

  const picker = (
    value: WorkoutSession | undefined,
    onPick: (id: string) => void,
    options: WorkoutSession[],
    aria: string,
  ) => (
    <select
      value={value?._id ?? ''}
      aria-label={aria}
      onChange={(e) => onPick(e.target.value)}
      className="h-10 w-full min-w-0 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-sm text-on-surface outline-none focus:border-primary"
    >
      {options.map((s) => (
        <option key={s._id} value={s._id}>
          {label(s)}
        </option>
      ))}
    </select>
  );

  const topSet = (snap: ExerciseSnapshot | null) =>
    !snap ? (
      <span className="text-on-surface-variant/70">
        {t('workout.history.compareNotDone')}
      </span>
    ) : snap.topSet ? (
      <span dir="ltr" className="tabular-nums">
        {snap.topSet.weight} {kg} × {snap.topSet.reps}
      </span>
    ) : (
      '—'
    );

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-on-surface">
          <StitchIcon name="balance" size={18} />
          {t('workout.history.compareTitle')}
        </h2>
        <p className="text-xs text-on-surface-variant">
          {t('workout.history.compareSubtitle', { name })}
        </p>
      </header>

      {!comparison || !later || !earlier ? (
        <p className="rounded-lg bg-surface-container-low px-3 py-4 text-center text-sm text-on-surface-variant">
          {t('workout.history.compareNeedTwo')}
        </p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                {t('workout.history.compareEarlier')}
              </p>
              {picker(earlier, setEarlierId, olderThanLater, t('workout.history.compareEarlier'))}
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                {t('workout.history.compareLater')}
              </p>
              {picker(later, setLaterId, newerThanEarlier, t('workout.history.compareLater'))}
            </div>
          </div>

          {/* Totals: earlier → later, with the change. */}
          <dl className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ['compareVolume', comparison.a.volume, comparison.b.volume, comparison.volumePercent, '%'],
                ['compareSets', comparison.a.sets, comparison.b.sets, comparison.b.sets - comparison.a.sets, ''],
                ['compareExercises', comparison.a.exercises, comparison.b.exercises, comparison.b.exercises - comparison.a.exercises, ''],
                [
                  'compareDuration',
                  comparison.a.durationMinutes,
                  comparison.b.durationMinutes,
                  comparison.a.durationMinutes !== null && comparison.b.durationMinutes !== null
                    ? comparison.b.durationMinutes - comparison.a.durationMinutes
                    : null,
                  '′',
                ],
              ] as const
            ).map(([key, a, b, change, unit]) => (
              <div key={key} className="rounded-lg bg-surface-container-low px-3 py-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {t(`workout.history.${key}`)}
                </dt>
                <dd className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-2">
                  <span dir="ltr" className="text-sm font-extrabold tabular-nums text-on-surface">
                    {a?.toLocaleString(i18n.language) ?? '—'} → {b?.toLocaleString(i18n.language) ?? '—'}
                  </span>
                  <span className="text-xs">
                    <Delta value={change} unit={unit} digits={0} />
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          {/* Per exercise. A list rather than a table: four columns of kilos
              do not fit a phone, and each row reads as one sentence. */}
          <ul className="flex flex-col gap-2">
            {comparison.exercises.map((row) => (
              <li
                key={row.name}
                className="rounded-lg bg-surface-container-low px-3 py-2.5"
              >
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-semibold text-on-surface">
                    {row.name}
                  </span>
                  <span className="shrink-0 text-xs">
                    <Delta value={row.e1rmDelta} unit={` ${kg}`} />
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                  <div>
                    <span className="me-1 text-[10px] font-bold uppercase tracking-wider">
                      {t('workout.history.compareEarlier')}
                    </span>
                    {topSet(row.a)}
                  </div>
                  <div>
                    <span className="me-1 text-[10px] font-bold uppercase tracking-wider">
                      {t('workout.history.compareLater')}
                    </span>
                    {topSet(row.b)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
