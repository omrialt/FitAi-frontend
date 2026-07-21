/**
 * PlanHeader - Common header component for nutrition and training plans
 * Displays plan details, badges, and action buttons (edit, export)
 */

import { Group, Stack, Text, Badge, Button, Box, Divider, Menu, Avatar } from "@mantine/core";
import { IconEdit, IconFlame, IconClock, IconTarget, IconTrendingUp, IconDownload, IconFileTypePdf, IconFileTypeXls } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { StarRating } from "./StarRating";
import type { NutritionPlanData, TrainingPlanData, PlanHeaderProps } from '../../types/common.types';

const targetColors: Record<string, string> = {
  maintain: "blue",
  cut: "red",
  bulk: "green",
};

const difficultyColors: Record<string, string> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
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
  const { t } = useTranslation();

  const targetLabels: Record<string, string> = {
    maintain: t("common.maintain"),
    cut: t("common.cut"),
    bulk: t("common.bulk"),
  };

  const difficultyLabels: Record<string, string> = {
    beginner: t("common.beginner"),
    intermediate: t("common.intermediate"),
    advanced: t("common.advanced"),
  };

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
                  <Badge color="green">{t("common.active")}</Badge>
                ) : (
                  <Badge color="gray">{t("common.inactive")}</Badge>
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
                {t("common.export")}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconFileTypePdf size={16} />}
                onClick={onExportPDF}
              >
                {t("common.exportToPDF")}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconFileTypeXls size={16} />}
                onClick={onExportExcel}
              >
                {t("common.exportToExcel")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {isOwner && (
            <Button
              leftSection={<IconEdit size={16} />}
              variant="light"
              onClick={onEdit}
            >
              {t("common.editPlan")}
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
                {nutritionPlan.totalCalories} {t("common.kcal")}
              </Text>
            </Group>

            {nutritionStats && (
              <>
                <Group gap="xs">
                  <Text size="sm" fw={500} c="blue">
                    {t("common.proteinShort")}{" "}
                    {t("common.grams", { value: nutritionStats.totalProtein.toFixed(0) })}
                  </Text>
                </Group>

                <Group gap="xs">
                  <Text size="sm" fw={500} c="yellow">
                    {t("common.carbsShort")}{" "}
                    {t("common.grams", { value: nutritionStats.totalCarbs.toFixed(0) })}
                  </Text>
                </Group>

                <Group gap="xs">
                  <Text size="sm" fw={500} c="green">
                    {t("common.fatShort")}{" "}
                    {t("common.grams", { value: nutritionStats.totalFat.toFixed(0) })}
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
                {t("common.ratingCount", { count: nutritionPlan.totalRatings })}
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
                  {trainingPlan.estimatedCalories} {t("common.kcal")}
                </Text>
              </Group>
            )}

            {trainingPlan.estimatedDuration && (
              <Group gap="xs">
                <IconClock size={20} color="blue" />
                <Text size="sm" fw={500}>
                  {trainingPlan.estimatedDuration} {t("common.minShort")}
                </Text>
              </Group>
            )}

            {trainingPlan.focus && (
              <Text size="sm" c="dimmed">
                {t("common.focusLabel")}{" "}
                <Text component="span" fw={500}>
                  {trainingPlan.focus}
                </Text>
              </Text>
            )}

            {trainingPlan.programType && (
              <Text size="sm" c="dimmed">
                {t("common.typeLabel")}{" "}
                <Text component="span" fw={500}>
                  {trainingPlan.programType === "fixedDays"
                    ? t("common.fixedDays")
                    : t("common.rotation")}
                </Text>
              </Text>
            )}

            {trainingPlan.rotationCycleLength && (
              <Text size="sm" c="dimmed">
                {t("common.cycleLabel")}{" "}
                <Text component="span" fw={500}>
                  {t("common.dayCount", { count: trainingPlan.rotationCycleLength })}
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
              <Text size="xs" c="dimmed">{planType === 'training' ? t('common.elitePerformanceCoach') : t('common.nutritionPlanCreator')}</Text>
            </Box>
          </Group>
        )}

        <Text size="sm" c="dimmed">
          {t("common.createdLabel")}{" "}
          {plan.createdAt ? formatDate(plan.createdAt) : t("common.notAvailable")}
        </Text>
      </Group>

      <Divider mt="lg" />
    </Box>
  );
}
