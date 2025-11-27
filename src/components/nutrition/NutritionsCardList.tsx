/**
 * NutritionsCardList - Mobile view list of nutrition plan cards
 */

"use client";

import { Stack, Text } from "@mantine/core";
import { NutritionsCard } from "./NutritionsCard";
import type { NutritionPlan } from "../../types/nutrition.types";

interface NutritionsCardListProps {
  nutritionPlans: NutritionPlan[];
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (nutritionPlan: NutritionPlan) => void;
  onExportExcel: (nutritionPlan: NutritionPlan) => void;
  onDelete?: (id: string) => void;
}

export function NutritionsCardList({
  nutritionPlans,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
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
        />
      ))}
    </Stack>
  );
}
