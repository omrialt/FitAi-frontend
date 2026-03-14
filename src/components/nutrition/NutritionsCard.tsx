/**
 * NutritionsCard - Mobile card view for a single nutrition plan
 */

"use client";

import { Card, Text, Group, Badge, Stack, Divider } from "@mantine/core";
import { IconStar, IconStarFilled, IconCalendarEvent, IconFlame } from "@tabler/icons-react";
import { NutritionsActionsMenu } from "./NutritionsActionsMenu";
import type { NutritionPlan } from "../../types/nutrition.types";
import type { NutritionsCardProps } from '../../types/nutrition-components.types';

// Star rating component
function StarRating({ rating, totalRatings }: { rating: number; totalRatings: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= Math.round(rating) ? (
        <IconStarFilled key={i} size={14} style={{ color: '#FFA500' }} />
      ) : (
        <IconStar key={i} size={14} style={{ color: '#D3D3D3' }} />
      )
    );
  }

  return (
    <Group gap={4}>
      {stars}
      <Text size="xs" c="dimmed" ml={4}>
        {rating > 0 ? `${rating.toFixed(1)} (${totalRatings})` : 'No ratings'}
      </Text>
    </Group>
  );
}

const getTargetColor = (target?: string) => {
  switch (target?.toLowerCase()) {
    case "maintain":
      return "blue";
    case "cut":
      return "red";
    case "bulk":
      return "green";
    default:
      return "gray";
  }
};

export function NutritionsCard({
  nutritionPlan,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: NutritionsCardProps) {
  // Calculate total macros from all foods in all meals
  const totalProtein = nutritionPlan.meals?.reduce(
    (sum, meal) => sum + meal.foods.reduce((foodSum, food) => foodSum + (food.protein || 0), 0),
    0
  ) || 0;
  const totalCarbs = nutritionPlan.meals?.reduce(
    (sum, meal) => sum + meal.foods.reduce((foodSum, food) => foodSum + (food.carbs || 0), 0),
    0
  ) || 0;
  const totalFats = nutritionPlan.meals?.reduce(
    (sum, meal) => sum + meal.foods.reduce((foodSum, food) => foodSum + (food.fat || 0), 0),
    0
  ) || 0;

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header with title and actions */}
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg" style={{ flex: 1 }}>
            {nutritionPlan.title}
          </Text>
          <NutritionsActionsMenu
            nutritionPlan={nutritionPlan}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            onView={onView}
            onEdit={onEdit}
            onExportPDF={onExportPDF}
            onExportExcel={onExportExcel}
            onDelete={onDelete}
            onActivate={onActivate}
          />
        </Group>

        {/* Description */}
        <Text size="sm" c="dimmed" lineClamp={2}>
          {nutritionPlan.description}
        </Text>

        <Divider />

        {/* Details */}
        <Group gap="xs">
          <IconFlame size={16} style={{ color: '#FF6B35' }} />
          <Text size="sm" fw={500}>
            {nutritionPlan.totalCalories} kcal
          </Text>
        </Group>

        {/* Macros */}
        <Group gap="md">
          <Text size="xs" c="dimmed">
            Protein: <Text component="span" fw={500} c="dark">{totalProtein.toFixed(0)}g</Text>
          </Text>
          <Text size="xs" c="dimmed">
            Carbs: <Text component="span" fw={500} c="dark">{totalCarbs.toFixed(0)}g</Text>
          </Text>
          <Text size="xs" c="dimmed">
            Fats: <Text component="span" fw={500} c="dark">{totalFats.toFixed(0)}g</Text>
          </Text>
        </Group>

        {/* Goal badge */}
        {nutritionPlan.target && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">Goal:</Text>
            <Badge color={getTargetColor(nutritionPlan.target)} variant="light">
              {nutritionPlan.target}
            </Badge>
          </Group>
        )}

        {/* Rating */}
        <StarRating 
          rating={nutritionPlan.averageRating} 
          totalRatings={nutritionPlan.totalRatings} 
        />

        <Divider />

        {/* Footer with creator and date */}
        <Group justify="space-between" gap="xs">
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              By:
            </Text>
            <Text size="xs" fw={500}>
              {typeof nutritionPlan.userId === "object" && nutritionPlan.userId?.fullName
                ? nutritionPlan.userId.fullName
                : "Unknown"}
            </Text>
          </Group>
          <Group gap={4}>
            <IconCalendarEvent size={14} style={{ color: '#868e96' }} />
            <Text size="xs" c="dimmed">
              {nutritionPlan.createdAt
                ? new Date(nutritionPlan.createdAt).toLocaleDateString("en-GB")
                : "-"}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
