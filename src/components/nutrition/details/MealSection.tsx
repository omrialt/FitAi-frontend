/**
 * MealSection - Display meals with compact mobile-friendly cards
 */

import type { ReactNode } from 'react';
import { Stack, Title, Paper, Text, Group, ThemeIcon, Divider, Box } from '@mantine/core';
import { IconCoffee, IconSoup, IconMoon, IconApple } from '@tabler/icons-react';
import type { MealSectionProps } from '../../../types/nutrition-components.types';
import type { MealType } from '../../../types/nutrition.types';

const mealTypeMeta: Record<MealType, { label: string; color: string; icon: ReactNode }> = {
  breakfast: { label: 'Breakfast', color: 'orange', icon: <IconCoffee size={16} /> },
  lunch:     { label: 'Lunch',     color: 'yellow', icon: <IconSoup size={16} /> },
  dinner:    { label: 'Dinner',    color: 'indigo', icon: <IconMoon size={16} /> },
  snack:     { label: 'Snack',     color: 'green',  icon: <IconApple size={16} /> },
};

export function MealSection({ meals }: MealSectionProps) {
  if (meals.length === 0) {
    return (
      <Stack gap="md" mb="xl">
        <Title order={2}>Daily Meal Layout</Title>
        <Text c="dimmed" size="sm" ta="center">No meals added to this plan yet</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md" mb="xl">
      <Title order={2}>Daily Meal Layout</Title>

      <Stack gap="sm">
        {meals.map((meal, mealIndex) => {
          const meta = mealTypeMeta[meal.mealType] ?? { label: meal.mealType, color: 'gray', icon: <IconApple size={16} /> };
          const totalKcal = meal.foods.reduce((s, f) => s + f.calories, 0);
          const totalP    = meal.foods.reduce((s, f) => s + f.protein, 0);
          const totalC    = meal.foods.reduce((s, f) => s + f.carbs, 0);
          const totalF    = meal.foods.reduce((s, f) => s + f.fat, 0);

          return (
            <Paper key={mealIndex} p="md" radius="md" withBorder>
              {/* Meal type header row */}
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <ThemeIcon variant="light" color={meta.color} size="sm" radius="xl">
                    {meta.icon}
                  </ThemeIcon>
                  <Text size="sm" fw={600} c={meta.color}>{meta.label}</Text>
                </Group>
                <Text size="sm" fw={700} c="dimmed">{totalKcal.toFixed(0)} kcal</Text>
              </Group>

              {/* Food names */}
              <Stack gap={2} mb="sm">
                {meal.foods.map((food, fi) => (
                  <Text key={fi} size="sm" fw={fi === 0 ? 600 : 400} c={fi === 0 ? undefined : 'dimmed'}>
                    {food.name}
                    {food.quantity && food.unit && (
                      <Text span size="xs" c="dimmed"> {'\u2014'} {food.quantity} {food.unit}</Text>
                    )}
                  </Text>
                ))}
                {meal.foods.length === 0 && (
                  <Text size="sm" c="dimmed">No foods added</Text>
                )}
              </Stack>

              <Divider />

              {/* Inline macros */}
              <Group gap="md" mt="xs">
                <Box>
                  <Text size="xs" c="dimmed">Protein</Text>
                  <Text size="sm" fw={700} c="blue">{totalP.toFixed(0)}g</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Carbs</Text>
                  <Text size="sm" fw={700} c="yellow.7">{totalC.toFixed(0)}g</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Fats</Text>
                  <Text size="sm" fw={700} c="green">{totalF.toFixed(0)}g</Text>
                </Box>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}
