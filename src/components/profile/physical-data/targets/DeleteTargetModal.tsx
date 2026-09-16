/**
 * DeleteTargetModal - Confirmation modal for deleting a physical target.
 */

import { useTranslation } from 'react-i18next';

import { ConfirmDeleteModal } from '../../../common/ConfirmDeleteModal';
import { formatDate } from '../helpers/calcImprovement';
import type { DeleteTargetModalProps } from '../../../../types/physical-target-components.types';

export function DeleteTargetModal({ opened, onClose, target, onConfirm }: DeleteTargetModalProps) {
  const { t } = useTranslation();

  if (!target) return null;

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('physicalTargets.deleteTitle')}
      question={t('physicalTargets.deleteConfirm')}
      warning={t('physicalTargets.deleteWarning')}
      confirmLabel={t('common.delete')}
    >
      <p className="text-sm font-bold text-on-surface">
        {target.name || t('physicalTargets.target')}
      </p>
      <p className="text-sm text-on-surface-variant">
        {t('physicalTargets.targetDate')}: {formatDate(target.targetDate)}
      </p>
    </ConfirmDeleteModal>
  );
}
