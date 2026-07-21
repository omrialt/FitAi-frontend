/**
 * DeleteTrainingModal - Confirmation modal for deleting a training plan.
 */

'use client';

import { useTranslation } from 'react-i18next';

import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import type { DeleteTrainingModalProps } from '../../types/trainings-components.types';

export function DeleteTrainingModal({
  opened,
  onClose,
  training,
  onConfirm,
}: DeleteTrainingModalProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('trainings.deleteTitle')}
      question={t('trainings.deleteConfirm')}
      warning={t('trainings.deleteWarning')}
    >
      <p className="text-sm text-on-surface-variant">
        {t('trainings.planLabel')}:{' '}
        <strong className="text-on-surface">{training?.title}</strong>
      </p>
    </ConfirmDeleteModal>
  );
}
