/**
 * DeleteNutritionModal - Confirmation modal for deleting a nutrition plan.
 */

"use client";

import { useTranslation } from "react-i18next";

import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import type { DeleteNutritionModalProps } from '../../types/nutrition-components.types';

export function DeleteNutritionModal({
  opened,
  onClose,
  nutritionPlan,
  onConfirm,
}: DeleteNutritionModalProps) {
  const { t } = useTranslation();

  if (!nutritionPlan) return null;

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('nutrition.deleteTitle')}
      question={t('nutrition.deleteConfirm')}
      warning={t('nutrition.deleteWarning')}
      confirmLabel={t('common.delete')}
    >
      <p className="text-sm text-on-surface-variant">
        <strong className="text-on-surface">{nutritionPlan.title}</strong>
      </p>
    </ConfirmDeleteModal>
  );
}
