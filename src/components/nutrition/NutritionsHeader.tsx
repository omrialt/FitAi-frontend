/**
 * NutritionsHeader — page title and primary action.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { StitchIcon } from '../common/StitchIcon';
import type { NutritionsHeaderProps } from '../../types/nutrition-components.types';

export function NutritionsHeader({ onCreateNew }: NutritionsHeaderProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <h1 className="text-4xl font-black tracking-tight text-on-surface">
        {isAdmin ? t('nutrition.titleAdmin') : t('nutrition.title')}
      </h1>

      {onCreateNew && (
        <button
          type="button"
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 bg-primary-gradient text-white px-5 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform shrink-0"
        >
          <StitchIcon name="add" size={18} />
          {t('nutrition.newPlan')}
        </button>
      )}
    </header>
  );
}
