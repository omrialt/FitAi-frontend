/**
 * DeleteMeasurementModal - Confirmation modal for deleting a physical data record.
 */

import { useTranslation } from 'react-i18next';

import { ConfirmDeleteModal } from '../../../common/ConfirmDeleteModal';
import { formatDate } from '../helpers/calcImprovement';
import type { DeleteMeasurementModalProps } from '../../../../types/physical-data-components.types';

export function DeleteMeasurementModal({
  opened,
  onClose,
  measurement,
  onConfirm,
}: DeleteMeasurementModalProps) {
  const { t } = useTranslation();

  if (!measurement) return null;

  return (
    <ConfirmDeleteModal
      opened={opened}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('physicalData.deleteTitle')}
      question={t('physicalData.deleteConfirm')}
      warning={t('physicalData.deleteWarning')}
      confirmLabel={t('common.delete')}
    >
      <div className="space-y-1">
        <p className="text-sm font-bold text-on-surface">
          {t('physicalData.recordFrom', {
            date: formatDate(measurement.dateRecorded),
          })}
        </p>
        <p className="text-sm text-on-surface-variant">
          {t('physicalData.recordSummary', {
            weight: measurement.weightKg,
            height: measurement.heightCm,
          })}
          {measurement.bodyFatPercent &&
            t('physicalData.recordBodyFat', {
              value: measurement.bodyFatPercent,
            })}
        </p>
      </div>
    </ConfirmDeleteModal>
  );
}
