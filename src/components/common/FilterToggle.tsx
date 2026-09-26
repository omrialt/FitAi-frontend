import { useTranslation } from 'react-i18next';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

interface FilterToggleProps {
  open: boolean;
  onToggle: () => void;
  /** How many non-default filters are applied; shown as a badge. */
  activeCount: number;
  controlsId: string;
}

/**
 * Phone-only button that reveals a filter panel's secondary controls.
 *
 * List screens stacked every select above the results, so on a 390px screen
 * the filters filled the first viewport and the plans started below the fold.
 * Search stays visible; the selects collapse behind this until asked for.
 * Hidden from `md`, where the controls sit inline in one row.
 */
export function FilterToggle({ open, onToggle, activeCount, controlsId }: FilterToggleProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controlsId}
      aria-label={t('common.filters')}
      className={`md:hidden relative shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${
        open || activeCount > 0
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-transparent bg-surface-container-low text-on-surface-variant'
      }`}
    >
      <IconAdjustmentsHorizontal size={20} stroke={1.75} aria-hidden="true" />
      {activeCount > 0 && (
        <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center tabular-nums">
          {activeCount}
        </span>
      )}
    </button>
  );
}
