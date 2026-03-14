import { SimpleGrid, Paper, Group, Text, ThemeIcon, Stack } from '@mantine/core';
import {
  IconBarbell,
  IconApple,
  IconActivity,
  IconScale,
  IconFlame,
  IconTrendingUp,
} from '@tabler/icons-react';
import type { TrainingPlan } from '../../types/training-plan.types';
import type { NutritionPlan } from '../../types/nutrition.types';
import type { ProgressStats } from '../../hooks/useDashboard';

interface QuickStatsCardsProps {
  trainingPlans: TrainingPlan[];
  nutritionPlans: NutritionPlan[];
  progressStats: ProgressStats | null;
  bmi: { bmi: number; category: string } | null;
}

export function QuickStatsCards({
  trainingPlans,
  nutritionPlans,
  progressStats,
  bmi,
}: QuickStatsCardsProps) {
  const activePlans = trainingPlans.filter((p) => p.isActive).length;
  const totalExercises = trainingPlans.reduce(
    (sum, p) => sum + p.days.reduce((ds, d) => ds + d.exercises.length, 0),
    0,
  );
  const workouts7d = progressStats?.last7Days?.workoutsCompleted ?? 0;
  const workouts30d = progressStats?.last30Days?.workoutsCompleted ?? 0;

  const stats = [
    {
      label: 'Training Plans',
      value: trainingPlans.length,
      subtitle: `${activePlans} active`,
      icon: <IconBarbell size={22} />,
      color: 'indigo',
    },
    {
      label: 'Nutrition Plans',
      value: nutritionPlans.length,
      subtitle: `${nutritionPlans.filter((p) => (p.activeByUsers as string[])?.length > 0).length} active`,
      icon: <IconApple size={22} />,
      color: 'green',
    },
    {
      label: 'Workouts (7d)',
      value: workouts7d,
      subtitle: `${workouts30d} this month`,
      icon: <IconActivity size={22} />,
      color: 'violet',
    },
    {
      label: 'Total Exercises',
      value: totalExercises,
      subtitle: `across ${trainingPlans.reduce((s, p) => s + p.days.length, 0)} training days`,
      icon: <IconFlame size={22} />,
      color: 'orange',
    },
    {
      label: 'BMI',
      value: bmi ? bmi.bmi.toFixed(1) : '—',
      subtitle: bmi?.category || 'No data yet',
      icon: <IconScale size={22} />,
      color: 'cyan',
    },
    {
      label: 'Weight Change (30d)',
      value: progressStats?.last30Days?.weightDiff != null
        ? `${progressStats.last30Days.weightDiff > 0 ? '+' : ''}${progressStats.last30Days.weightDiff.toFixed(1)} kg`
        : '—',
      subtitle: progressStats?.last7Days?.weightDiff != null
        ? `${progressStats.last7Days.weightDiff > 0 ? '+' : ''}${progressStats.last7Days.weightDiff.toFixed(1)} kg this week`
        : 'No data',
      icon: <IconTrendingUp size={22} />,
      color: 'teal',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
      {stats.map((stat) => (
        <Paper
          key={stat.label}
          className="dashboard-stat-card"
          radius="md"
          p="md"
          withBorder
        >
          <Group justify="space-between" mb="xs">
            <ThemeIcon
              variant="light"
              color={stat.color}
              size="lg"
              radius="md"
            >
              {stat.icon}
            </ThemeIcon>
          </Group>
          <Stack gap={2}>
            <Text className="dashboard-stat-value" fw={700} size="xl">
              {stat.value}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              {stat.label}
            </Text>
            <Text size="xs" c="dimmed" style={{ opacity: 0.7 }}>
              {stat.subtitle}
            </Text>
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
