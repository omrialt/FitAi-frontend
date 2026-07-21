/**
 * NoRecordsMessage - Empty state for the physical data page.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../../../common/StitchIcon';
import type { NoRecordsMessageProps } from '../../../../types/physical-data-components.types';

export function NoRecordsMessage({ onAddMeasurement }: NoRecordsMessageProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container-lowest rounded-xl p-12 border border-outline-variant/10 flex flex-col items-center gap-6">
      <span className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <StitchIcon name="monitoring" size={32} stroke={1.5} />
      </span>

      <div className="text-center">
        <p className="text-lg font-bold text-on-surface mb-1">
          {t('physicalData.noRecordsTitle')}
        </p>
        <p className="text-sm text-on-surface-variant max-w-sm">
          {t('physicalData.noRecordsText')}
        </p>
      </div>

      <button
        type="button"
        onClick={onAddMeasurement}
        className="bg-primary-gradient text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
      >
        {t('physicalData.addMeasurement')}
      </button>
    </div>
  );
}
