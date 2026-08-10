/**
 * TrainingsFilters — search, difficulty, target and an active/archived toggle.
 * "Performance Lab" design: one raised surface, labels above each control.
 */

'use client';

import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { TrainingFilters } from '../../types/training.types';
import type { TrainingsFiltersProps } from '../../types/trainings-components.types';

/** Shared field styling so the controls line up as one bar. */
const CONTROL =
  'w-full py-3 bg-surface-container-low rounded-lg border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-on-surface';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 block">
      {children}
    </span>
  );
}

export function TrainingsFilters({
  filters,
  onFiltersChange,
  search,
  onSearchChange,
}: TrainingsFiltersProps) {
  const { t } = useTranslation();

  const handleFilterChange = (
    key: keyof TrainingFilters,
    value: string | undefined,
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const status = filters.status === 'archived' ? 'archived' : 'active';

  const difficulties = [
    { value: '', label: t('trainings.allLevels') },
    { value: 'beginner', label: t('trainings.beginner') },
    { value: 'intermediate', label: t('trainings.intermediate') },
    { value: 'advanced', label: t('trainings.advanced') },
    { value: 'elite', label: t('trainings.elite') },
  ];

  const targets = [
    { value: '', label: t('trainings.allTargets') },
    { value: 'maintain', label: t('trainings.maintain') },
    { value: 'cut', label: t('trainings.cut') },
    { value: 'bulk', label: t('trainings.bulk') },
  ];

  return (
    <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 border border-outline-variant/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Search */}
        <div>
          <FieldLabel>{t('trainings.planName')}</FieldLabel>
          <div className="relative">
            <input
              type="search"
              className={`${CONTROL} ps-4 pe-11`}
              placeholder={t('trainings.searchPlaceholder')}
              value={search}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
            />
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              <StitchIcon name="search" size={18} />
            </span>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <FieldLabel>{t('trainings.difficulty')}</FieldLabel>
          <div className="relative">
            <select
              className={`${CONTROL} ps-4 pe-10 appearance-none`}
              value={filters.difficulty || ''}
              onChange={(e) =>
                handleFilterChange('difficulty', e.target.value || undefined)
              }
            >
              {difficulties.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              <StitchIcon name="expand_more" size={18} />
            </span>
          </div>
        </div>

        {/* Target */}
        <div>
          <FieldLabel>{t('trainings.primaryTarget')}</FieldLabel>
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
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              <StitchIcon name="expand_more" size={18} />
            </span>
          </div>
        </div>

        {/* Active / Archived */}
        <div
          role="tablist"
          aria-label={t('trainings.status')}
          className="flex bg-surface-container-high rounded-lg p-1"
        >
          {(['active', 'archived'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={status === value}
              onClick={() => onFiltersChange({ ...filters, status: value })}
              className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${
                status === value
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t(`trainings.${value}`)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
