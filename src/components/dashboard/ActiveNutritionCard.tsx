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
  Progress,
} from '@mantine/core';
import {
  IconApple,
  IconFlame,
  IconChevronRight,
  IconTarget,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { NutritionPlan } from '../../types/nutrition.types';
import type { ActiveNutritionCardProps } from '../../types/dashboard-components.types';

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

  const goalLabel: Record<string, string> = {
    bulk: '+0.5 kg / week',
    cut: '−0.5 kg / week',
    maintain: 'Maintain weight',
  };

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group justify="space-between" mb="xs">
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

      <Text fw={600} size="lg" mb={2}>
        {plan.title}
      </Text>

      {plan.target && (
        <Group gap={4} mb="sm">
          <IconTarget size={13} color="var(--mantine-color-green-5)" />
          <Text size="xs" c="dimmed">
            Goal: {goalLabel[plan.target] ?? plan.target}
          </Text>
        </Group>
      )}

      <Group justify="space-between" align="center" mb="md">
        <RingProgress
          size={110}
          thickness={10}
          roundCaps
          sections={[
            { value: proteinPct, color: 'indigo', tooltip: `Protein ${Math.round(proteinPct)}%` },
            { value: carbsPct, color: 'yellow', tooltip: `Carbs ${Math.round(carbsPct)}%` },
            { value: fatPct, color: 'red', tooltip: `Fat ${Math.round(fatPct)}%` },
          ]}
          label={
            <Stack align="center" gap={0}>
              <IconFlame size={14} color="var(--mantine-color-orange-5)" />
              <Text size="xs" fw={700} lh={1.2}>
                {plan.totalCalories || Math.round(totals.calories)}
              </Text>
              <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
                kcal
              </Text>
            </Stack>
          }
        />

        <Stack gap={8} style={{ flex: 1, marginLeft: 16 }}>
          <Stack gap={2}>
            <Group justify="space-between">
              <Text size="xs" fw={600} c="indigo">Protein</Text>
              <Text size="xs" c="dimmed">{Math.round(totals.protein)}g</Text>
            </Group>
            <Progress value={proteinPct} color="indigo" size="sm" radius="xl" />
          </Stack>
          <Stack gap={2}>
            <Group justify="space-between">
              <Text size="xs" fw={600} c="yellow">Carbs</Text>
              <Text size="xs" c="dimmed">{Math.round(totals.carbs)}g</Text>
            </Group>
            <Progress value={carbsPct} color="yellow" size="sm" radius="xl" />
          </Stack>
          <Stack gap={2}>
            <Group justify="space-between">
              <Text size="xs" fw={600} c="red">Fat</Text>
              <Text size="xs" c="dimmed">{Math.round(totals.fat)}g</Text>
            </Group>
            <Progress value={fatPct} color="red" size="sm" radius="xl" />
          </Stack>
        </Stack>
      </Group>

      <Divider mb="md" />

      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Badge variant="dot" color="blue" size="sm">
            {plan.meals.length} meals
          </Badge>
          {plan.averageRating > 0 && (
            <Badge variant="dot" color="yellow" size="sm">
              ★ {plan.averageRating.toFixed(1)}
            </Badge>
          )}
        </Group>
        <Button
          variant="subtle"
          color="green"
          size="xs"
          rightSection={<IconChevronRight size={14} />}
          onClick={() => navigate(`/my-nutritions`)}
        >
          Macro View
        </Button>
      </Group>
    </Paper>
  );
}
