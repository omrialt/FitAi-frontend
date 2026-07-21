/**
 * TrainingsHeader — page title, subtitle and primary actions.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { StitchIcon } from '../common/StitchIcon';
import type { TrainingsHeaderProps } from '../../types/trainings-components.types';

export function TrainingsHeader({ onCreateNew }: TrainingsHeaderProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight text-on-surface mb-2">
          {isAdmin ? t('trainings.titleAdmin') : t('trainings.title')}
        </h1>
        <p className="text-on-surface-variant leading-relaxed">
          {t('trainings.subtitle')}
        </p>
      </div>

      <div className="flex gap-3 shrink-0">
        <button
          type="button"
          className="flex items-center gap-2 bg-surface-container-high text-on-surface px-5 py-3 rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-colors"
        >
          <StitchIcon name="report" size={18} />
          {t('trainings.export')}
        </button>

        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-primary-gradient text-white px-5 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            <StitchIcon name="add" size={18} />
            {t('trainings.newPlan')}
          </button>
        )}
      </div>
    </header>
  );
}
