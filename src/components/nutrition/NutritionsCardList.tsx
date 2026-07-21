/**
 * NutritionsCardList - Mobile view list of nutrition plan cards
 */

"use client";

import { useTranslation } from "react-i18next";
import { NutritionsCard } from "./NutritionsCard";

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
  const { t } = useTranslation();

  if (nutritionPlans.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10">
        <p className="text-on-surface-variant">{t('nutrition.noPlans')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
    </div>
  );
}
