import { Activity } from 'react';
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
  UpcomingSchedule,
  QuickActions,
} from '../components/dashboard';
import '../styles/Dashboard.css';

function DashboardPage() {
  const metadata = usePresetMetadata('dashboard', {
    preconnect: ['https://api.fitai.com'],
  });

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
            Loading your dashboard...
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
          title="Failed to load dashboard"
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
        <div className="dashboard-section">
          <Activity mode="visible">
            <WelcomeSection user={user} currentStatus={currentStatus} />
          </Activity>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-section">
          <Activity mode="visible">
            <QuickStatsCards
              trainingPlans={trainingPlans}
              nutritionPlans={nutritionPlans}
              progressStats={progressStats}
              bmi={bmi}
            />
          </Activity>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <Activity mode="visible">
            <QuickActions />
          </Activity>
        </div>

        {/* Active Plans Row */}
        <div className="dashboard-section">
          <div className="dashboard-grid-main">
            <Activity mode="visible">
              <ActiveTrainingCard
                plan={activeTrainingPlan}
                currentStatus={currentStatus}
              />
            </Activity>
            <Activity mode="visible">
              <ActiveNutritionCard plan={activeNutritionPlan} />
            </Activity>
            <Activity mode="visible">
              <BodyProgressCard
                latestPhysicalData={latestPhysicalData}
                weightProgress={weightProgress}
                progressStats={progressStats}
                onDataUpdate={refetch}
              />
            </Activity>
          </div>
        </div>

        {/* Recommendations + Schedule Row */}
        <div className="dashboard-section">
          <div className="dashboard-grid-bottom">
            <Activity mode="visible">
              <RecentRecommendations recommendations={aiRecommendations} />
            </Activity>
            <Activity mode="visible">
              <UpcomingSchedule />
            </Activity>
          </div>
        </div>
      </Stack>
    </Container>
  );
}

export default DashboardPage;
