/**
 * PlanHeader - Common header component for nutrition and training plans
 * Displays plan details, badges, and action buttons (edit, export)
 */

import {
  Group,
  Stack,
  Text,
  Badge,
  Button,
  Box,
  Divider,
  Menu,
  Avatar,
} from "@mantine/core";
import {
  IconEdit,
  IconFlame,
  IconClock,
  IconTarget,
  IconTrendingUp,
  IconDownload,
  IconFileTypePdf,
  IconFileTypeXls,
} from "@tabler/icons-react";
import { StarRating } from "./StarRating";
import type { PlanType, BasePlanData, NutritionPlanData, TrainingPlanData, PlanHeaderProps } from '../../types/common.types';

const targetColors: Record<string, string> = {
  maintain: "blue",
  cut: "red",
  bulk: "green",
};

const targetLabels: Record<string, string> = {
  maintain: "Maintain",
  cut: "Cut",
  bulk: "Bulk",
};

const difficultyColors: Record<string, string> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
};

const difficultyLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function PlanHeader({
  planType,
  plan,
  isOwner,
  onEdit,
  onExportPDF,
  onExportExcel,
  creatorName,
}: PlanHeaderProps) {
  // Format date as dd/mm/yyyy
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate nutrition macros if applicable
  const nutritionStats =
    planType === "nutrition"
      ? (() => {
          const nutritionPlan = plan as NutritionPlanData;
          return {
            totalProtein: nutritionPlan.meals.reduce(
              (sum, meal) =>
                sum +
                meal.foods.reduce((foodSum, food) => foodSum + food.protein, 0),
              0
            ),
            totalCarbs: nutritionPlan.meals.reduce(
              (sum, meal) =>
                sum +
                meal.foods.reduce((foodSum, food) => foodSum + food.carbs, 0),
              0
            ),
            totalFat: nutritionPlan.meals.reduce(
              (sum, meal) =>
                sum +
                meal.foods.reduce((foodSum, food) => foodSum + food.fat, 0),
              0
            ),
          };
        })()
      : null;

  const trainingPlan =
    planType === "training" ? (plan as TrainingPlanData) : null;
  const nutritionPlan =
    planType === "nutrition" ? (plan as NutritionPlanData) : null;

  return (
    <Box mb="xl">
      <Group justify="space-between" align="flex-start" mb="md">
        <Stack gap="xs" style={{ flex: 1 }}>
          <Group gap="md" wrap="wrap">
            <Text size="xl" fw={700}>
              {plan.title}
            </Text>
            {plan?.target && (
              <Badge
                color={targetColors[plan.target]}
                leftSection={<IconTarget size={14} />}
              >
                {targetLabels[plan.target]}
              </Badge>
            )}
            {trainingPlan && (
              <>
                <Badge
                  color={difficultyColors[trainingPlan.difficulty]}
                  leftSection={<IconTrendingUp size={14} />}
                >
                  {difficultyLabels[trainingPlan.difficulty]}
                </Badge>
                {trainingPlan.isActive ? (
                  <Badge color="green">Active</Badge>
                ) : (
                  <Badge color="gray">Inactive</Badge>
                )}
              </>
            )}
          </Group>

          <Text size="sm" c="dimmed">
            {plan.description}
          </Text>
        </Stack>

        <Group gap="xs">
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                leftSection={<IconDownload size={16} />}
                variant="light"
                color="gray"
              >
                Export
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconFileTypePdf size={16} />}
                onClick={onExportPDF}
              >
                Export to PDF
              </Menu.Item>
              <Menu.Item
                leftSection={<IconFileTypeXls size={16} />}
                onClick={onExportExcel}
              >
                Export to Excel
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

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
      </Group>

      <Group gap="xl" mt="md" wrap="wrap">
        {/* Nutrition-specific stats */}
        {nutritionPlan && (
          <>
            <Group gap="xs">
              <IconFlame size={20} color="orange" />
              <Text size="sm" fw={500}>
                {nutritionPlan.totalCalories} kcal
              </Text>
            </Group>

            {nutritionStats && (
              <>
                <Group gap="xs">
                  <Text size="sm" fw={500} c="blue">
                    P: {nutritionStats.totalProtein.toFixed(0)}g
                  </Text>
                </Group>

                <Group gap="xs">
                  <Text size="sm" fw={500} c="yellow">
                    C: {nutritionStats.totalCarbs.toFixed(0)}g
                  </Text>
                </Group>

                <Group gap="xs">
                  <Text size="sm" fw={500} c="green">
                    F: {nutritionStats.totalFat.toFixed(0)}g
                  </Text>
                </Group>
              </>
            )}

            <Group gap="xs">
              <StarRating
                rating={nutritionPlan.averageRating}
                readonly
                showValue
              />
              <Text size="sm" c="dimmed">
                ({nutritionPlan.totalRatings}{" "}
                {nutritionPlan.totalRatings === 1 ? "rating" : "ratings"})
              </Text>
            </Group>
          </>
        )}
        {/* Training-specific stats */}
        {trainingPlan && (
          <>
            {trainingPlan.estimatedCalories && (
              <Group gap="xs">
                <IconFlame size={20} color="orange" />
                <Text size="sm" fw={500}>
                  {trainingPlan.estimatedCalories} kcal
                </Text>
              </Group>
            )}

            {trainingPlan.estimatedDuration && (
              <Group gap="xs">
                <IconClock size={20} color="blue" />
                <Text size="sm" fw={500}>
                  {trainingPlan.estimatedDuration} min
                </Text>
              </Group>
            )}

            {trainingPlan.focus && (
              <Text size="sm" c="dimmed">
                Focus:{" "}
                <Text component="span" fw={500}>
                  {trainingPlan.focus}
                </Text>
              </Text>
            )}

            {trainingPlan.programType && (
              <Text size="sm" c="dimmed">
                Type:{" "}
                <Text component="span" fw={500}>
                  {trainingPlan.programType === "fixedDays"
                    ? "Fixed Days"
                    : "Rotation"}
                </Text>
              </Text>
            )}

            {trainingPlan.rotationCycleLength && (
              <Text size="sm" c="dimmed">
                Cycle:{" "}
                <Text component="span" fw={500}>
                  {trainingPlan.rotationCycleLength} days
                </Text>
              </Text>
            )}
          </>
        )}

        {creatorName && (
          <Group gap="xs" align="center">
            <Avatar size="sm" radius="xl" color={planType === 'training' ? 'indigo' : 'orange'}>
              {creatorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Text size="sm" fw={600}>{creatorName}</Text>
              <Text size="xs" c="dimmed">{planType === 'training' ? 'Elite Performance Coach' : 'Nutrition Plan Creator'}</Text>
            </Box>
          </Group>
        )}

        <Text size="sm" c="dimmed">
          Created: {plan.createdAt ? formatDate(plan.createdAt) : "N/A"}
        </Text>
      </Group>

      <Divider mt="lg" />
    </Box>
  );
}
