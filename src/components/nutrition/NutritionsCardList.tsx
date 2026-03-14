/**
 * NutritionsCardList - Mobile view list of nutrition plan cards
 */

"use client";

import { Stack, Text } from "@mantine/core";
import { NutritionsCard } from "./NutritionsCard";
import type { NutritionPlan } from "../../types/nutrition.types";
import type { NutritionsCardListProps } from '../../types/nutrition-components.types';

export function NutritionsCardList({
  nutritionPlans,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: NutritionsCardListProps) {
  if (nutritionPlans.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No nutrition plans found
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {nutritionPlans.map((plan) => (
        <NutritionsCard
          key={plan._id}
          nutritionPlan={plan}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onView={onView}
          onEdit={onEdit}
          onExportPDF={onExportPDF}
          onExportExcel={onExportExcel}
          onDelete={onDelete}
          onActivate={onActivate}
        />
      ))}
    </Stack>
  );
}
