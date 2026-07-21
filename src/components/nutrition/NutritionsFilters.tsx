/**
 * NutritionsFilters — search, target and minimum-rating filters.
 * "Performance Lab" design.
 */

'use client';

import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { NutritionFilters } from '../../types/nutrition.types';
import type { NutritionsFiltersProps } from '../../types/nutrition-components.types';

const CONTROL =
  'w-full py-3 bg-surface-container-low rounded-lg border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-on-surface';

export function NutritionsFilters({
  filters,
  onFiltersChange,
  search,
  onSearchChange,
}: NutritionsFiltersProps) {
  const { t } = useTranslation();

  const handleFilterChange = (
    key: keyof NutritionFilters,
    value: string | number | undefined,
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const targets = [
    { value: '', label: t('nutrition.targetAll') },
    { value: 'cut', label: t('nutrition.weightLoss') },
    { value: 'bulk', label: t('nutrition.muscleGain') },
    { value: 'maintain', label: t('nutrition.maintain') },
  ];

  const ratings = [
    { value: '', label: t('nutrition.ratingAny') },
    { value: '4', label: t('nutrition.rating4Plus') },
    { value: '4.5', label: t('nutrition.rating45Plus') },
    { value: '5', label: t('nutrition.rating5') },
  ];

  return (
    <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 border border-outline-variant/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative lg:col-span-1">
          <input
            type="search"
            className={`${CONTROL} ps-4 pe-11`}
            placeholder={t('nutrition.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            <StitchIcon name="search" size={18} />
          </span>
        </div>

        {/* Target */}
        <div className="relative">
          <select
            className={`${CONTROL} ps-4 pe-10 appearance-none`}
            value={filters.target || ''}
            onChange={(e) =>
              handleFilterChange('target', e.target.value || undefined)
            }
          >
            {targets.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            <StitchIcon name="expand_more" size={18} />
          </span>
        </div>

        {/* Minimum rating */}
        <div className="relative">
          <select
            className={`${CONTROL} ps-4 pe-10 appearance-none`}
            value={filters.minRating?.toString() || ''}
            onChange={(e) =>
              handleFilterChange(
                'minRating',
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          >
            {ratings.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            <StitchIcon name="expand_more" size={18} />
          </span>
        </div>
      </div>
    </section>
  );
}
