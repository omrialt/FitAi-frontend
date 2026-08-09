import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Center, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { AppLayout } from '../components/AppLayout';
import { AppBreadcrumbs } from '../components/common/AppBreadcrumbs';
import { StitchIcon } from '../components/common/StitchIcon';
import { physicalDataService } from '../services/physical-data.service';
import { progressStatsService } from '../services/progress-stats.service';
import { trainingPlanService } from '../services/training-plan.service';
import { workoutSessionService } from '../services/workout-session.service';
import userService from '../services/user.service';
import type { User } from '../types/auth.types';
import type { PhysicalData } from '../types/physical-data.types';
import type { ProgressStats } from '../types/dashboard.types';
import type { TrainingPlan } from '../types/training-plan.types';
import type {
  WorkoutSession,
  WorkoutStats,
} from '../types/workout-session.types';

/**
 * A trainer's read-only view of one client.
 *
 * This is the screen G-08 was missing. The permission work made the data
 * reachable — an accepted connection now grants a trainer read access — but
 * there was no page that asked for it, so from the trainer's seat the feature
 * still looked unbuilt.
 *
 * Every panel handles its own absence: a client with no measurements is the
 * normal early state, not an error. `allSettled` means one forbidden or empty
 * endpoint cannot blank the rest of the page — which matters here, because a
 * revoked connection turns every request into a 403 at once.
 */

interface Panel<T> {
  data: T | null;
  denied: boolean;
}

function fulfilled<T>(result: PromiseSettledResult<T>): Panel<T> {
  return result.status === 'fulfilled'
    ? { data: result.value, denied: false }
    : { data: null, denied: true };
}

/** A labelled figure. `value` is already formatted; this only presents it. */
function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4">
      <p className="text-2xl font-black tabular-nums text-on-surface">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      {hint && <p className="mt-1 text-xs text-on-surface-variant/80">{hint}</p>}
    </div>
  );
}

function Panel({
  icon,
  title,
  children,
}: {
  icon: 'fitness_center' | 'scale' | 'history' | 'trending_up';
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <StitchIcon name={icon} size={18} />
        </span>
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [client, setClient] = useState<User | null>(null);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [latest, setLatest] = useState<PhysicalData | null>(null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);

    const [
      userResult,
      plansResult,
      latestResult,
      progressResult,
      statsResult,
      sessionsResult,
    ] = await Promise.allSettled([
      userService.findOne(clientId),
      trainingPlanService.getByUserWithShared(clientId),
      physicalDataService.getLatestByUserId(clientId),
      progressStatsService.getByUserId(clientId),
      workoutSessionService.getStats(clientId),
      workoutSessionService.getByUserId(clientId, { limit: 8 }),
    ]);

    const plansPanel = fulfilled(plansResult);
    const progressPanel = fulfilled(progressResult);

    // Two independent denials is the signature of a connection that is not (or
    // no longer) accepted, rather than one endpoint having a bad day.
    setForbidden(plansPanel.denied && progressPanel.denied);

    setClient(fulfilled(userResult).data);
    setPlans(plansPanel.data ?? []);
    setLatest(fulfilled(latestResult).data);
    setProgress(progressPanel.data);
    setStats(fulfilled(statsResult).data);
    setSessions(fulfilled(sessionsResult).data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const dash = t('common.none');
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  if (loading) {
    return (
      <AppLayout>
        <Container size="lg" py="xl">
          <Center h={320}>
            <Loader size="lg" />
          </Center>
        </Container>
      </AppLayout>
    );
  }

  /**
   * No-access state.
   *
   * The design gives this its own full screen rather than an inline warning
   * strip: hitting it means the trainer has no relationship with this athlete,
   * so there is no page underneath for a banner to annotate — and it needs a
   * way back, which an Alert does not provide.
   */
  if (forbidden) {
    return (
      <AppLayout>
        <Container size="sm" py="xl">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid h-15 w-15 place-items-center rounded-[18px] bg-danger-container text-on-danger-container ring-1 ring-danger/20">
              <IconAlertCircle size={26} />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-danger">
              {t('clients.noAccessLabel')}
            </span>
            <h1 className="max-w-[22ch] text-2xl font-black leading-tight tracking-tight text-on-surface">
              {t('clients.noAccessTitle')}
            </h1>
            <p className="max-w-[34ch] text-sm leading-relaxed text-on-surface-variant">
              {t('clients.noAccessBody')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="mt-1 grid h-12 place-items-center rounded-lg border border-outline-variant bg-surface-container-high px-5 text-sm font-bold text-on-surface"
            >
              {t('clients.backToClients')}
            </button>
          </div>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="lg" py="md">
        <AppBreadcrumbs
          items={[
            { label: t('nav.home'), href: '/' },
            { label: t('clients.pageTitle'), href: '/clients' },
            { label: client?.fullName ?? t('common.unknown') },
          ]}
        />

        <header className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <StitchIcon name="chevron_left" size={16} />
            {t('clients.backToClients')}
          </button>

          <h1 className="text-2xl font-black tracking-tight text-on-surface">
            {client?.fullName ?? t('common.unknown')}
          </h1>
          <p className="text-sm text-on-surface-variant">{client?.email}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-surface-container-high px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <StitchIcon name="visibility" size={12} />
            {t('clients.readOnlyBadge')}
          </p>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat
            label={t('dashboard.workouts7d')}
            value={String(progress?.last7Days?.workoutsCompleted ?? 0)}
          />
          <Stat
            label={t('dashboard.workouts30d')}
            value={String(progress?.last30Days?.workoutsCompleted ?? 0)}
          />
          <Stat
            label={t('workout.currentStreak')}
            value={String(stats?.streak.currentWeeks ?? 0)}
            hint={t('workout.weeksUnit')}
          />
          <Stat
            label={t('workout.adherence')}
            value={
              stats?.adherence.percent == null
                ? dash
                : `${stats.adherence.percent}%`
            }
            hint={
              stats?.adherence.percent == null
                ? t('workout.noActivePlan')
                : t('workout.plannedVsDone', {
                    completed: stats.adherence.completed,
                    planned: stats.adherence.planned,
                  })
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel icon="scale" title={t('clients.latestMeasurement')}>
            {!latest ? (
              <p className="text-sm text-on-surface-variant">
                {t('dashboard.noPhysicalData')}
              </p>
            ) : (
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('dashboard.weight')}
                  </dt>
                  <dd className="text-lg font-black tabular-nums text-on-surface">
                    {latest.weightKg} {t('common.kg')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('dashboard.bodyFatPct')}
                  </dt>
                  <dd className="text-lg font-black tabular-nums text-on-surface">
                    {latest.bodyFatPercent != null
                      ? `${latest.bodyFatPercent} %`
                      : dash}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('dashboard.lastRecorded')}
                  </dt>
                  <dd className="text-sm text-on-surface-variant">
                    {formatDate(latest.dateRecorded)}
                  </dd>
                </div>
              </dl>
            )}
          </Panel>

          <Panel icon="fitness_center" title={t('nav.trainingPlans')}>
            {plans.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                {t('clients.noPlans')}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {plans.slice(0, 6).map((plan) => (
                  <li
                    key={plan._id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2"
                  >
                    <span className="truncate text-sm font-semibold text-on-surface">
                      {plan.title}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {t('clients.dayCount', { count: plan.days.length })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel icon="history" title={t('workout.recentSessions')}>
            {sessions.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                {t('workout.noSessions')}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sessions.map((session) => (
                  <li
                    key={session._id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {session.dayName || session.planTitle || t('workout.freeSession')}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatDate(session.performedAt)}
                        {session.durationMinutes
                          ? ` · ${t('workout.minutesShort', { minutes: session.durationMinutes })}`
                          : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {t('workout.exerciseCount', {
                        count: session.exercises.length,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel icon="trending_up" title={t('workout.personalBests')}>
            {!stats || stats.personalBests.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                {t('workout.noPersonalBests')}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {stats.personalBests.slice(0, 6).map((best) => (
                  <li
                    key={best.exercise}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2"
                  >
                    <span className="truncate text-sm font-semibold text-on-surface">
                      {best.exercise}
                    </span>
                    <span className="shrink-0 text-sm font-black tabular-nums text-on-surface">
                      {best.weight}
                      <span className="text-on-surface-variant">
                        {t('common.kg')} × {best.reps}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </Container>
    </AppLayout>
  );
}
