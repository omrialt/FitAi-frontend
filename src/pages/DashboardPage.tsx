import { AppLayout } from '../components/AppLayout';
import { LandingHero } from '../components/LandingHero';
import {
  Container,
  Stack,
  Center,
  Loader,
  Text,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { usePresetMetadata } from '../hooks/useMetadata';
import { useAuthStore } from '../store/authStore';
import { useDashboard } from '../hooks/useDashboard';
import {
  WelcomeSection,
  QuickStatsCards,
  ActiveTrainingCard,
  ActiveNutritionCard,
  BodyProgressCard,
  RecentRecommendations,
  WeeklyReviewButton,
  TrainingRecordCard,
  FatigueCard,
  CoachChat,
} from '../components/dashboard';
import { OverloadCard } from '../components/workout/OverloadCard';
import { DeloadCard } from '../components/workout/DeloadCard';
import { coachService } from '../services/coach.service';
import { RemainingToday } from '../components/nutrition/RemainingToday';
import { useEffect, useState, type ReactNode } from 'react';
import '../styles/Dashboard.css';

/**
 * A card-shaped placeholder for a slice that has not arrived yet.
 *
 * Only for the moment before the first answer: rendering the real card with
 * empty props would show "no active plan" or "no measurements" for half a
 * second on an account that has both, which reads as a bug.
 */
function CardSkeleton({ lines = 3, tall = false }: { lines?: number; tall?: boolean }) {
  return (
    <div
      className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5"
      aria-hidden="true"
    >
      <div className="skeleton mb-4 h-4 w-40" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={`skeleton w-full ${tall ? 'h-12' : 'h-8'}`} />
        ))}
      </div>
    </div>
  );
}

function WhenReady({
  ready,
  children,
  lines,
  tall,
}: {
  ready: boolean;
  children: ReactNode;
  lines?: number;
  tall?: boolean;
}) {
  return ready ? <>{children}</> : <CardSkeleton lines={lines} tall={tall} />;
}

function DashboardPage() {
  const metadata = usePresetMetadata('dashboard');

  const { isAuthenticated } = useAuthStore();

  return (
    <AppLayout>
      {metadata}

      {!isAuthenticated ? (
        <LandingHero />
      ) : (
        <DashboardContent />
      )}
    </AppLayout>
  );
}

function DashboardContent() {
  // Asked once per dashboard load. The chat is a paid feature the server can
  // have switched off, and a button that 503s is worse than no button.
  const [coachEnabled, setCoachEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    coachService
      .getStatus()
      .then((status) => {
        if (!cancelled) setCoachEnabled(status.chat);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const { t } = useTranslation();
  const {
    user,
    loading,
    error,
    currentStatus,
    activeTrainingPlan,
    activeNutritionPlan,
    trainingPlans,
    nutritionPlans,
    latestPhysicalData,
    weightProgress,
    bmi,
    progressStats,
    workoutStats,
    aiRecommendations,
    ready,
    refetch,
  } = useDashboard();

  if (loading) {
    return (
      <Center py={100}>
        <Stack align="center" gap="md">
          <Loader color="indigo" size="lg" />
          <Text c="dimmed" size="sm">
            {t('dashboard.loading')}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('dashboard.loadFailed')}
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!user) return null;

  return (
    // Layout follows the Stitch dashboard: a full-width banner and stat bento,
    // then two equal-width rows pairing the active plans and, below them, body
    // progress against AI insights.
    <Container size="xl" py="md">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <WelcomeSection user={user} currentStatus={currentStatus} />

        {/* Quick Stats */}
        {ready.trainingPlans &&
        ready.nutritionPlans &&
        ready.progressStats &&
        ready.bmi ? (
          <QuickStatsCards
            trainingPlans={trainingPlans}
            nutritionPlans={nutritionPlans}
            progressStats={progressStats}
            bmi={bmi}
          />
        ) : (
          <div
            className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6"
            aria-hidden="true"
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Bento.
            One column on phones, two from lg, and three from xl with the first
            track wider (1.25fr) — the active training plan is by far the
            densest card here and is what the screen is opened for, so it gets
            the extra width rather than being squeezed to a third. Columns are
            explicit wrappers instead of loose grid children so each one keeps
            its own vertical rhythm as the tracks change. */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr] gap-8 items-start">
          <div className="flex flex-col gap-8">
            <WhenReady ready={ready.activeTrainingPlan} lines={4} tall>
              <ActiveTrainingCard
                plan={activeTrainingPlan}
                currentStatus={currentStatus}
              />
            </WhenReady>
            <WhenReady ready={ready.workoutStats}>
              <TrainingRecordCard stats={workoutStats} />
            </WhenReady>
            {/* Renders nothing until there is enough log to judge, so it stays
                absent rather than apologetic on a new account. */}
            {user?._id && <FatigueCard userId={user._id} />}
            {/* The prescription sits directly under the signal that prompts
                it. Two cards on opposite sides of the screen would make the
                user connect them, and most would not. */}
            {user?._id && <DeloadCard userId={user._id} />}
          </div>

          <div className="flex flex-col gap-8">
            {/* What to do next session, from the log. No key required, so this
                is the one AI-shaped card on the dashboard that always works. */}
            {user?._id && <OverloadCard userId={user._id} />}
            {/* Renders nothing until something is logged or a plan is active,
                so it stays absent rather than empty on a new account. */}
            <RemainingToday />
            <WhenReady ready={ready.activeNutritionPlan}>
              <ActiveNutritionCard plan={activeNutritionPlan} />
            </WhenReady>
            <WhenReady
              ready={
                ready.latestPhysicalData &&
                ready.weightProgress &&
                ready.progressStats
              }
              lines={4}
            >
              <BodyProgressCard
                latestPhysicalData={latestPhysicalData}
                weightProgress={weightProgress}
                progressStats={progressStats}
                onDataUpdate={refetch}
              />
            </WhenReady>
          </div>

          <div className="flex flex-col gap-8">
            <WhenReady ready={ready.aiRecommendations}>
              <RecentRecommendations
                recommendations={aiRecommendations}
                action={<WeeklyReviewButton onCreated={refetch} />}
              />
            </WhenReady>
            {/* Hidden entirely when the server has no key, rather than offered
                and failing. */}
            <CoachChat enabled={coachEnabled} />
          </div>
        </section>
      </div>
    </Container>
  );
}

export default DashboardPage;
