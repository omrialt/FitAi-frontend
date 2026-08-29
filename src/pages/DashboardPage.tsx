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
} from '../components/dashboard';
import '../styles/Dashboard.css';

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
        <QuickStatsCards
          trainingPlans={trainingPlans}
          nutritionPlans={nutritionPlans}
          progressStats={progressStats}
          bmi={bmi}
        />

        {/* Bento.
            One column on phones, two from lg, and three from xl with the first
            track wider (1.25fr) — the active training plan is by far the
            densest card here and is what the screen is opened for, so it gets
            the extra width rather than being squeezed to a third. Columns are
            explicit wrappers instead of loose grid children so each one keeps
            its own vertical rhythm as the tracks change. */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr] gap-8 items-start">
          <div className="flex flex-col gap-8">
            <ActiveTrainingCard
              plan={activeTrainingPlan}
              currentStatus={currentStatus}
            />
            <TrainingRecordCard stats={workoutStats} />
            {/* Renders nothing until there is enough log to judge, so it stays
                absent rather than apologetic on a new account. */}
            {user?._id && <FatigueCard userId={user._id} />}
          </div>

          <div className="flex flex-col gap-8">
            <ActiveNutritionCard plan={activeNutritionPlan} />
            <BodyProgressCard
              latestPhysicalData={latestPhysicalData}
              weightProgress={weightProgress}
              progressStats={progressStats}
              onDataUpdate={refetch}
            />
          </div>

          <div className="flex flex-col gap-8">
            <RecentRecommendations
              recommendations={aiRecommendations}
              action={<WeeklyReviewButton onCreated={refetch} />}
            />
          </div>
        </section>
      </div>
    </Container>
  );
}

export default DashboardPage;
