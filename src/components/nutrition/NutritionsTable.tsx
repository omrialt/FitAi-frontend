/**
 * NutritionsTable — desktop table view. "Performance Lab" design.
 *
 * Rows previously carried `cursor: pointer` with no click handler, so they
 * looked interactive but weren't; they now open the plan, matching the
 * trainings table.
 */

"use client";

import { useTranslation } from "react-i18next";

import { StitchIcon } from "../common/StitchIcon";
import { NutritionsActionsMenu } from "./NutritionsActionsMenu";
import type { NutritionsTableProps } from '../../types/nutrition-components.types';

const getTargetPill = (
  target?: string,
): { pill: string; labelKey?: string } => {
  switch (target?.toLowerCase()) {
    case "cut":
      return { pill: 'bg-error-container text-on-error-container', labelKey: 'nutrition.weightLoss' };
    case "bulk":
      return { pill: 'bg-primary/10 text-primary', labelKey: 'nutrition.muscleGain' };
    case "maintain":
      return { pill: 'bg-green-100 text-green-700', labelKey: 'nutrition.maintain' };
    default:
      return { pill: 'bg-surface-container-high text-on-surface-variant' };
  }
};

/** Tint of the leading plan avatar, colour-coded by target. */
const getAvatarTint = (target?: string): string => {
  switch (target?.toLowerCase()) {
    case "cut":
      return 'bg-error';
    case "bulk":
      return 'bg-primary';
    case "maintain":
      return 'bg-green-600';
    default:
      return 'bg-outline';
  }
};

const TH =
  "text-start text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-6 py-4";

export function NutritionsTable({
  nutritionPlans,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: NutritionsTableProps) {
  const { t } = useTranslation();

  if (nutritionPlans.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10">
        <p className="text-on-surface-variant">{t('nutrition.noPlans')}</p>
      </div>
    );
  }

  const dash = t('common.none');

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 mb-8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              <th className={TH}>{t('nutrition.planName')}</th>
              <th className={TH}>{t('nutrition.target')}</th>
              <th className={TH}>{t('nutrition.meals')}</th>
              <th className={TH}>{t('nutrition.calories')}</th>
              <th className={TH}>{t('nutrition.creator')}</th>
              <th className={TH}>{t('nutrition.rating')}</th>
              <th className={TH} />
            </tr>
          </thead>
          <tbody>
            {nutritionPlans.map((plan) => {
              const badge = getTargetPill(plan.target);
              const creatorName =
                typeof plan.userId === "object" && plan.userId?.fullName
                  ? plan.userId.fullName
                  : null;
              const mealsCount = plan.meals?.length ?? 0;

              return (
                <tr
                  key={plan._id}
                  onClick={() => onView(plan._id)}
                  className="cursor-pointer hover:bg-surface-container-low/60 transition-colors"
                >
                  {/* Plan name */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-lg text-white text-lg font-black flex items-center justify-center shrink-0 ${getAvatarTint(plan.target)}`}
                      >
                        {plan.title[0]?.toUpperCase()}
                      </span>
                      <span className="font-bold text-on-surface">
                        {plan.title}
                      </span>
                    </div>
                  </td>

                  {/* Target */}
                  <td className="px-6 py-5">
                    {plan.target ? (
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${badge.pill}`}
                      >
                        {badge.labelKey ? t(badge.labelKey) : plan.target}
                      </span>
                    ) : (
                      <span className="text-sm text-on-surface-variant">{dash}</span>
                    )}
                  </td>

                  {/* Meals per day */}
                  <td className="px-6 py-5">
                    <span className="text-sm text-on-surface-variant">
                      {mealsCount > 0
                        ? t('nutrition.mealsPerDay', { count: mealsCount })
                        : dash}
                    </span>
                  </td>

                  {/* Calories */}
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-on-surface">
                      {plan.totalCalories
                        ? t('nutrition.caloriesValue', {
                            value: plan.totalCalories.toLocaleString(),
                          })
                        : dash}
                    </span>
                  </td>

                  {/* Creator */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">
                        {creatorName ? creatorName[0].toUpperCase() : '?'}
                      </span>
                      <span className="text-sm text-on-surface-variant">
                        {creatorName ?? dash}
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">
                        <StitchIcon name="verified" size={14} />
                      </span>
                      <span className="text-sm font-bold text-on-surface">
                        {plan.averageRating > 0
                          ? plan.averageRating.toFixed(1)
                          : dash}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-end" onClick={(e) => e.stopPropagation()}>
                    <NutritionsActionsMenu
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
