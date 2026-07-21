/**
 * NutritionsCard — mobile card view for a single nutrition plan.
 * "Performance Lab" design.
 */

"use client";

import { useTranslation } from "react-i18next";

import { StitchIcon } from "../common/StitchIcon";
import { NutritionsActionsMenu } from "./NutritionsActionsMenu";
import type { NutritionsCardProps } from '../../types/nutrition-components.types';

function StarRating({
  rating,
  totalRatings,
}: {
  rating: number;
  totalRatings: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= Math.round(rating) ? 'text-amber-500' : 'text-outline/40'}
        >
          <StitchIcon name="verified" size={14} />
        </span>
      ))}
      <span className="text-xs text-on-surface-variant ms-1">
        {rating > 0
          ? `${rating.toFixed(1)} (${totalRatings})`
          : t('nutrition.noRatingsShort')}
      </span>
    </div>
  );
}

const TARGET_LABEL_KEYS: Record<string, string> = {
  cut: 'nutrition.weightLoss',
  bulk: 'nutrition.muscleGain',
  maintain: 'nutrition.maintain',
};

const getTargetPill = (target?: string) => {
  switch (target?.toLowerCase()) {
    case 'maintain':
      return 'bg-blue-100 text-blue-700';
    case 'cut':
      return 'bg-error-container text-on-error-container';
    case 'bulk':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
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
  const { t, i18n } = useTranslation();

  // Totals across every food in every meal
  const sumMacro = (pick: (f: { protein?: number; carbs?: number; fat?: number }) => number) =>
    nutritionPlan.meals?.reduce(
      (sum, meal) => sum + meal.foods.reduce((s, food) => s + (pick(food) || 0), 0),
      0,
    ) || 0;

  const macros = [
    { label: t('nutrition.protein'), value: sumMacro((f) => f.protein ?? 0) },
    { label: t('nutrition.carbs'), value: sumMacro((f) => f.carbs ?? 0) },
    { label: t('nutrition.fats'), value: sumMacro((f) => f.fat ?? 0) },
  ];

  const creator =
    typeof nutritionPlan.userId === "object" && nutritionPlan.userId?.fullName
      ? nutritionPlan.userId.fullName
      : t('common.unknown');

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-extrabold tracking-tight text-on-surface min-w-0 flex-1">
          {nutritionPlan.title}
        </h3>
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
      </div>

      {nutritionPlan.description && (
        <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">
          {nutritionPlan.description}
        </p>
      )}

      {/* Calories */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-outline-variant/10">
        <span className="text-orange-500">
          <StitchIcon name="bolt" size={16} />
        </span>
        <span className="text-sm font-bold text-on-surface">
          {nutritionPlan.totalCalories} {t('nutrition.kcal')}
        </span>
      </div>

      {/* Macros */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {macros.map((m) => (
          <span key={m.label} className="text-xs text-on-surface-variant">
            {m.label}:{' '}
            <span className="font-bold text-on-surface">{m.value.toFixed(0)}g</span>
          </span>
        ))}
      </div>

      {/* Goal */}
      {nutritionPlan.target && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-on-surface-variant">
            {t('nutrition.goal')}:
          </span>
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${getTargetPill(nutritionPlan.target)}`}
          >
            {TARGET_LABEL_KEYS[nutritionPlan.target.toLowerCase()]
              ? t(TARGET_LABEL_KEYS[nutritionPlan.target.toLowerCase()])
              : nutritionPlan.target}
          </span>
        </div>
      )}

      <div className="mt-3">
        <StarRating
          rating={nutritionPlan.averageRating}
          totalRatings={nutritionPlan.totalRatings}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-outline-variant/10">
        <span className="text-xs text-on-surface-variant">
          {t('nutrition.by')}{' '}
          <span className="font-bold text-on-surface">{creator}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <StitchIcon name="event" size={14} />
          {nutritionPlan.createdAt
            ? new Date(nutritionPlan.createdAt).toLocaleDateString(
                i18n.language === 'he' ? 'he-IL' : 'en-GB',
              )
            : t('common.none')}
        </span>
      </div>
    </div>
  );
}
