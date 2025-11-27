/**
 * PlanHeader - Nutrition plan header with title, description, stats, and edit button
 */

import { Group, Stack, Text, Badge, Button, Box, Divider } from '@mantine/core';
import { IconEdit, IconFlame, IconTarget } from '@tabler/icons-react';
import { StarRating } from '../../common/StarRating';
import type { NutritionPlan } from '../../../types/nutrition.types';

interface PlanHeaderProps {
  plan: NutritionPlan;
  isOwner: boolean;
  onEdit: () => void;
  creatorName?: string;
}

const targetColors: Record<string, string> = {
  maintain: 'blue',
  cut: 'orange',
  bulk: 'green',
};

const targetLabels: Record<string, string> = {
  maintain: 'Maintain',
  cut: 'Cut',
  bulk: 'Bulk',
};

export function PlanHeader({ plan, isOwner, onEdit, creatorName }: PlanHeaderProps) {
  // Calculate total macros from all meals
  const totalProtein = plan.meals.reduce((sum, meal) => 
    sum + meal.foods.reduce((foodSum, food) => foodSum + food.protein, 0), 0
  );
  const totalCarbs = plan.meals.reduce((sum, meal) => 
    sum + meal.foods.reduce((foodSum, food) => foodSum + food.carbs, 0), 0
  );
  const totalFat = plan.meals.reduce((sum, meal) => 
    sum + meal.foods.reduce((foodSum, food) => foodSum + food.fat, 0), 0
  );

  // Format date as dd/mm/yyyy
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Box mb="xl">
      <Group justify="space-between" align="flex-start" mb="md">
        <Stack gap="xs" style={{ flex: 1 }}>
          <Group gap="md">
            <Text size="xl" fw={700}>
              {plan.title}
            </Text>
            {plan.target && (
              <Badge color={targetColors[plan.target]} leftSection={<IconTarget size={14} />}>
                {targetLabels[plan.target]}
              </Badge>
            )}
          </Group>
          
          <Text size="sm" c="dimmed">
            {plan.description}
          </Text>
        </Stack>

        {isOwner && (
          <Button
            leftSection={<IconEdit size={16} />}
            variant="light"
            onClick={onEdit}
          >
            Edit Plan
          </Button>
        )}
      </Group>

      <Group gap="xl" mt="md" wrap="wrap">
        <Group gap="xs">
          <IconFlame size={20} color="orange" />
          <Text size="sm" fw={500}>
            {plan.totalCalories} kcal
          </Text>
        </Group>

        <Group gap="xs">
          <Text size="sm" fw={500} c="blue">
            P: {totalProtein.toFixed(0)}g
          </Text>
        </Group>

        <Group gap="xs">
          <Text size="sm" fw={500} c="yellow">
            C: {totalCarbs.toFixed(0)}g
          </Text>
        </Group>

        <Group gap="xs">
          <Text size="sm" fw={500} c="green">
            F: {totalFat.toFixed(0)}g
          </Text>
        </Group>

        <Group gap="xs">
          <StarRating rating={plan.averageRating} readonly showValue />
          <Text size="sm" c="dimmed">
            ({plan.totalRatings} {plan.totalRatings === 1 ? 'rating' : 'ratings'})
          </Text>
        </Group>

        {creatorName && (
          <Text size="sm" c="dimmed">
            Created by: <Text component="span" fw={500}>{creatorName}</Text>
          </Text>
        )}

        <Text size="sm" c="dimmed">
          Created: {formatDate(plan.createdAt)}
        </Text>
      </Group>

      <Divider mt="lg" />
    </Box>
  );
}
