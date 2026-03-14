import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  RingProgress,
  Button,
  Divider,
} from '@mantine/core';
import {
  IconApple,
  IconFlame,
  IconChevronRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { NutritionPlan } from '../../types/nutrition.types';

interface ActiveNutritionCardProps {
  plan: NutritionPlan | null;
}

export function ActiveNutritionCard({ plan }: ActiveNutritionCardProps) {
  const navigate = useNavigate();

  if (!plan) {
    return (
      <Paper className="dashboard-card" radius="md" p="lg" withBorder>
        <Group gap="xs" mb="md">
          <IconApple size={20} color="var(--mantine-color-green-5)" />
          <Title order={4}>Active Nutrition Plan</Title>
        </Group>
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            No active nutrition plan selected.
          </Text>
          <Button
            variant="light"
            color="green"
            size="sm"
            onClick={() => navigate('/nutrition-plans')}
          >
            Browse Nutrition Plans
          </Button>
        </Stack>
      </Paper>
    );
  }

  // Calculate total macros from all meals
  const totals = plan.meals.reduce(
    (acc, meal) => {
      meal.foods.forEach((food) => {
        acc.protein += food.protein || 0;
        acc.carbs += food.carbs || 0;
        acc.fat += food.fat || 0;
        acc.calories += food.calories || 0;
      });
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  );

  const totalMacroGrams = totals.protein + totals.carbs + totals.fat;
  const proteinPct = totalMacroGrams > 0 ? (totals.protein / totalMacroGrams) * 100 : 0;
  const carbsPct = totalMacroGrams > 0 ? (totals.carbs / totalMacroGrams) * 100 : 0;
  const fatPct = totalMacroGrams > 0 ? (totals.fat / totalMacroGrams) * 100 : 0;

  const targetColor: Record<string, string> = {
    bulk: 'orange',
    cut: 'red',
    maintain: 'teal',
  };

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconApple size={20} color="var(--mantine-color-green-5)" />
          <Title order={4}>Active Nutrition Plan</Title>
        </Group>
        {plan.target && (
          <Badge color={targetColor[plan.target] || 'gray'} size="sm">
            {plan.target}
          </Badge>
        )}
      </Group>

      <Text fw={600} size="lg" mb={4}>
        {plan.title}
      </Text>
      <Text size="sm" c="dimmed" lineClamp={2} mb="md">
        {plan.description}
      </Text>

      <Group justify="center" mb="md">
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[
            { value: proteinPct, color: 'indigo', tooltip: `Protein ${Math.round(proteinPct)}%` },
            { value: carbsPct, color: 'cyan', tooltip: `Carbs ${Math.round(carbsPct)}%` },
            { value: fatPct, color: 'orange', tooltip: `Fat ${Math.round(fatPct)}%` },
          ]}
          label={
            <Stack align="center" gap={0}>
              <IconFlame size={16} color="var(--mantine-color-orange-5)" />
              <Text size="xs" fw={700}>
                {plan.totalCalories || Math.round(totals.calories)}
              </Text>
              <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
                kcal
              </Text>
            </Stack>
          }
        />
      </Group>

      <Group justify="center" gap="lg" mb="md">
        <Stack align="center" gap={2}>
          <Text size="xs" fw={700} c="indigo">
            {Math.round(totals.protein)}g
          </Text>
          <Text size="xs" c="dimmed">
            Protein
          </Text>
        </Stack>
        <Stack align="center" gap={2}>
          <Text size="xs" fw={700} c="cyan">
            {Math.round(totals.carbs)}g
          </Text>
          <Text size="xs" c="dimmed">
            Carbs
          </Text>
        </Stack>
        <Stack align="center" gap={2}>
          <Text size="xs" fw={700} c="orange">
            {Math.round(totals.fat)}g
          </Text>
          <Text size="xs" c="dimmed">
            Fat
          </Text>
        </Stack>
      </Group>

      <Group justify="center" gap="xs" mb="md">
        <Badge variant="dot" color="blue" size="sm">
          {plan.meals.length} meals
        </Badge>
        {plan.averageRating > 0 && (
          <Badge variant="dot" color="yellow" size="sm">
            ★ {plan.averageRating.toFixed(1)}
          </Badge>
        )}
      </Group>

      <Divider mb="md" />

      <Group justify="flex-end">
        <Button
          variant="subtle"
          color="green"
          size="xs"
          rightSection={<IconChevronRight size={14} />}
          onClick={() => navigate(`/nutrition-plans/${plan._id}`)}
        >
          View Plan
        </Button>
      </Group>
    </Paper>
  );
}
