import { useTranslation } from 'react-i18next';
import { StitchIcon } from '../../common/StitchIcon';
import { muscleLabel, typeLabel } from './labels';
import { RANGE_OPTIONS, type HistoryFilterValues } from './filters';

/**
 * Search and filters for the training log.
 *
 * The type chips come from the workout types the user has actually logged,
 * not from the active plan: the log outlives plans, and a chip for a day that
 * was never trained would only ever filter to nothing.
 */

interface HistoryFiltersProps {
  value: HistoryFilterValues;
  onChange: (next: Partial<HistoryFilterValues>) => void;
  types: string[];
  muscles: string[];
  /** Plan titles in the log. The picker only appears when there are two or more. */
  plans: string[];
}

export function HistoryFilters({
  value,
  onChange,
  types,
  muscles,
  plans,
}: HistoryFiltersProps) {
  const { t } = useTranslation();
  const active =
    !!value.search ||
    !!value.type ||
    !!value.muscle ||
    !!value.plan ||
    value.days !== 0;

  const chip = (selected: boolean) =>
    `min-h-9 shrink-0 rounded-full border px-3 text-xs font-bold transition-colors ${
      selected
        ? 'border-primary bg-primary text-on-primary'
        : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
    }`;

  return (
    <section
      aria-label={t('workout.history.searchLabel')}
      className="mb-6 flex flex-col gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4"
    >
      <label className="relative block">
        <span className="sr-only">{t('workout.history.searchLabel')}</span>
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-on-surface-variant">
          <StitchIcon name="search" size={18} />
        </span>
        <input
          type="search"
          value={value.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder={t('workout.history.searchPlaceholder')}
          className="h-11 w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest ps-10 pe-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:border-primary"
        />
      </label>

      {types.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {t('workout.history.typeFilter')}
          </p>
          {/* One scrolling row on a phone rather than a wrapped block that
              pushes the log below the fold. */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              className={chip(!value.type)}
              aria-pressed={!value.type}
              onClick={() => onChange({ type: '' })}
            >
              {t('workout.history.allTypes')}
            </button>
            {types.map((type) => (
              <button
                key={type}
                type="button"
                className={chip(value.type === type)}
                aria-pressed={value.type === type}
                onClick={() =>
                  onChange({ type: value.type === type ? '' : type })
                }
              >
                {typeLabel(t, type)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* One plan is no choice at all, so the picker stays out of the way
            until the log spans more than one. */}
        {plans.length > 1 && (
          <select
            value={value.plan}
            aria-label={t('workout.history.planFilter')}
            onChange={(e) => onChange({ plan: e.target.value })}
            className="h-10 min-w-0 flex-1 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-sm text-on-surface outline-none focus:border-primary sm:flex-none"
          >
            <option value="">{t('workout.history.allPlans')}</option>
            {plans.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        )}

        <select
          value={value.muscle}
          aria-label={t('workout.history.muscleFilter')}
          onChange={(e) => onChange({ muscle: e.target.value })}
          className="h-10 min-w-0 flex-1 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-sm text-on-surface outline-none focus:border-primary sm:flex-none"
        >
          <option value="">{t('workout.history.allMuscles')}</option>
          {muscles.map((muscle) => (
            <option key={muscle} value={muscle}>
              {muscleLabel(t, muscle)}
            </option>
          ))}
        </select>

        <div
          role="group"
          aria-label={t('workout.history.rangeFilter')}
          className="flex overflow-hidden rounded-lg border border-outline-variant/30"
        >
          {RANGE_OPTIONS.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => onChange({ days })}
              aria-pressed={value.days === days}
              className={`min-h-10 px-2.5 text-xs font-bold transition-colors ${
                value.days === days
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {days === 0
                ? t('workout.windowAll')
                : t('workout.windowMonths', {
                    months: Math.round(days / 30),
                  })}
            </button>
          ))}
        </div>

        {active && (
          <button
            type="button"
            onClick={() =>
              onChange({ search: '', type: '', muscle: '', plan: '', days: 0 })
            }
            className="min-h-10 px-2 text-xs font-bold text-primary hover:underline"
          >
            {t('workout.history.clearFilters')}
          </button>
        )}
      </div>
    </section>
  );
}
