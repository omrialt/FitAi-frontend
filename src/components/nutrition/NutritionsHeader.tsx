/**
 * NutritionsHeader — page title and primary action.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { useIsMobile } from '../../hooks/useIsMobile';
import { StitchIcon } from '../common/StitchIcon';
import type { NutritionsHeaderProps } from '../../types/nutrition-components.types';

export function NutritionsHeader({ onCreateNew }: NutritionsHeaderProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  // On a phone the day-to-day action here is logging, which lives in the
  // bar's Log tab; a new plan is occasional, so it is the secondary button.
  const isMobile = useIsMobile();

  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <h1 className="font-bold text-on-surface">
        {isAdmin ? t('nutrition.titleAdmin') : t('nutrition.title')}
      </h1>

      {onCreateNew && (
        <button
          type="button"
          onClick={onCreateNew}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-sm shrink-0 ${
            isMobile
              ? 'min-h-11 border border-primary/50 text-primary'
              : 'bg-primary-gradient text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform'
          }`}
        >
          <StitchIcon name="add" size={18} />
          {t('nutrition.newPlan')}
        </button>
      )}
    </header>
  );
}
