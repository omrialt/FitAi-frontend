/**
 * PhysicalDataHeader - Header component for Physical Data page.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../../common/StitchIcon';
import type { PhysicalDataHeaderProps } from '../../../types/physical-data-components.types';

export function PhysicalDataHeader({ onAddMeasurement, onSetTarget }: PhysicalDataHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-on-surface mb-2">
          {t('physicalData.title')}
        </h1>
        <p className="text-on-surface-variant">{t('physicalData.subtitle')}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onSetTarget}
          className="flex items-center justify-center gap-2 bg-surface-container-high text-on-surface px-5 py-3 rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-colors"
        >
          <StitchIcon name="track_changes" size={18} />
          {t('physicalTargets.setTarget')}
        </button>

        <button
          type="button"
          onClick={onAddMeasurement}
          className="flex items-center justify-center gap-2 bg-primary-gradient text-white px-5 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          <StitchIcon name="add" size={18} />
          {t('physicalData.addMeasurement')}
        </button>
      </div>
    </header>
  );
}
