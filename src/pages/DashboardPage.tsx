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
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Welcome Banner */}
        <WelcomeSection user={user} currentStatus={currentStatus} />

        {/* Quick Stats */}
        <QuickStatsCards
          trainingPlans={trainingPlans}
          nutritionPlans={nutritionPlans}
          progressStats={progressStats}
          bmi={bmi}
        />

        {/* Active Plans Row */}
        <div className="dashboard-grid-main">
          <ActiveTrainingCard
            plan={activeTrainingPlan}
            currentStatus={currentStatus}
          />
          <ActiveNutritionCard plan={activeNutritionPlan} />
          <BodyProgressCard
            latestPhysicalData={latestPhysicalData}
            weightProgress={weightProgress}
            progressStats={progressStats}
            onDataUpdate={refetch}
          />
        </div>

        {/* AI Insights — full width */}
        <RecentRecommendations recommendations={aiRecommendations} />
      </Stack>
    </Container>
  );
}

export default DashboardPage;
