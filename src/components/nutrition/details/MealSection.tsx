/**
 * MealSection - Display meals with compact mobile-friendly cards
 */

import type { ReactNode } from 'react';
import { Stack, Title, Paper, Text, Group, ThemeIcon, Divider, Box } from '@mantine/core';
import { IconCoffee, IconSoup, IconMoon, IconApple } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { MealSectionProps } from '../../../types/nutrition-components.types';
import type { MealType } from '../../../types/nutrition.types';

const mealTypeMeta: Record<MealType, { labelKey: string; color: string; icon: ReactNode }> = {
  breakfast: { labelKey: 'nutrition.breakfast', color: 'orange', icon: <IconCoffee size={16} /> },
  lunch:     { labelKey: 'nutrition.lunch',     color: 'yellow', icon: <IconSoup size={16} /> },
  dinner:    { labelKey: 'nutrition.dinner',    color: 'indigo', icon: <IconMoon size={16} /> },
  snack:     { labelKey: 'nutrition.snack',     color: 'green',  icon: <IconApple size={16} /> },
};

export function MealSection({ meals }: MealSectionProps) {
  const { t } = useTranslation();

  if (meals.length === 0) {
    return (
      <Stack gap="md" mb="xl">
        <Title order={2}>{t('nutrition.dailyMealLayout')}</Title>
        <Text c="dimmed" size="sm" ta="center">{t('nutrition.noMeals')}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md" mb="xl">
      <Title order={2}>{t('nutrition.dailyMealLayout')}</Title>

      <Stack gap="sm">
        {meals.map((meal, mealIndex) => {
          const meta = mealTypeMeta[meal.mealType];
          const mealLabel = meta ? t(meta.labelKey) : meal.mealType;
          const mealColor = meta?.color ?? 'gray';
          const mealIcon = meta?.icon ?? <IconApple size={16} />;
          const totalKcal = meal.foods.reduce((s, f) => s + f.calories, 0);
          const totalP    = meal.foods.reduce((s, f) => s + f.protein, 0);
          const totalC    = meal.foods.reduce((s, f) => s + f.carbs, 0);
          const totalF    = meal.foods.reduce((s, f) => s + f.fat, 0);

          return (
            <Paper key={mealIndex} p="md" radius="md" withBorder>
              {/* Meal type header row */}
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <ThemeIcon variant="light" color={mealColor} size="sm" radius="xl">
                    {mealIcon}
                  </ThemeIcon>
                  <Text size="sm" fw={600} c={mealColor}>{mealLabel}</Text>
                </Group>
                <Text size="sm" fw={700} c="dimmed">{totalKcal.toFixed(0)} {t('nutrition.kcal')}</Text>
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
                  <Text size="sm" c="dimmed">{t('nutrition.noFoods')}</Text>
                )}
              </Stack>

              <Divider />

              {/* Inline macros */}
              <Group gap="md" mt="xs">
                <Box>
                  <Text size="xs" c="dimmed">{t('nutrition.protein')}</Text>
                  <Text size="sm" fw={700} c="blue">{totalP.toFixed(0)}g</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">{t('nutrition.carbs')}</Text>
                  <Text size="sm" fw={700} c="yellow.7">{totalC.toFixed(0)}g</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">{t('nutrition.fats')}</Text>
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
