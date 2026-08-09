import { useTranslation } from 'react-i18next';

import { StitchIcon, type StitchIconName } from '../common/StitchIcon';
import type { QuickStatsCardsProps } from '../../types/dashboard-components.types';

/**
 * Quick stats bento grid — "Performance Lab" design.
 *
 * Each tile is a "Signature Data Block" per DESIGN.md section 3: a large value
 * paired with a small uppercase caption. Values are zero-padded to two digits,
 * matching the design's editorial treatment ("04", not "4"). Counts of 100+ are
 * left as-is so nothing is truncated.
 */

interface StatTile {
  id: string;
  label: string;
  value: string;
  icon: StitchIconName;
  /** Tailwind classes for the icon chip, taken from the Stitch export. */
  chip: string;
  /** Border colour on hover, likewise from the export. */
  hover: string;
}

/** The design renders small counts zero-padded; larger ones untouched. */
function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function QuickStatsCards({
  trainingPlans,
  nutritionPlans,
  progressStats,
  bmi,
}: QuickStatsCardsProps) {
  const { t } = useTranslation();

  const totalExercises = trainingPlans.reduce(
    (sum, p) => sum + p.days.reduce((ds, d) => ds + d.exercises.length, 0),
    0,
  );

  const tiles: StatTile[] = [
    {
      id: 'trainingPlans',
      label: t('dashboard.trainingPlans'),
      value: pad(trainingPlans.length),
      icon: 'fitness_center',
      chip: 'bg-primary/10 text-primary',
      hover: 'hover:border-primary/30',
    },
    {
      id: 'nutritionPlans',
      label: t('dashboard.nutritionPlans'),
      value: pad(nutritionPlans.length),
      icon: 'restaurant',
      chip: 'bg-success-container text-on-success-container',
      hover: 'hover:border-success/30',
    },
    {
      id: 'workouts7d',
      label: t('dashboard.workouts7d'),
      value: pad(progressStats?.last7Days?.workoutsCompleted ?? 0),
      icon: 'calendar_view_week',
      chip: 'bg-info-container text-on-info-container',
      hover: 'hover:border-info/30',
    },
    {
      id: 'workouts30d',
      label: t('dashboard.workouts30d'),
      value: pad(progressStats?.last30Days?.workoutsCompleted ?? 0),
      icon: 'history',
      chip: 'bg-secondary-container text-on-secondary-container',
      hover: 'hover:border-secondary-container/30',
    },
    {
      id: 'totalExercises',
      label: t('dashboard.totalExercises'),
      value: pad(totalExercises),
      icon: 'exercise',
      chip: 'bg-secondary-container text-on-secondary-container',
      hover: 'hover:border-secondary/30',
    },
    {
      id: 'bmi',
      label: t('dashboard.currentBmi'),
      // BMI is a ratio, not a count — never zero-padded
      value: bmi ? bmi.bmi.toFixed(1) : t('common.none'),
      icon: 'monitor_weight',
      chip: 'bg-tertiary-container text-on-tertiary-container',
      hover: 'hover:border-tertiary/30',
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className={`bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 transition-all ${tile.hover}`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${tile.chip}`}
          >
            <StitchIcon name={tile.icon} size={20} />
          </div>
          <p className="text-2xl font-black text-on-surface">{tile.value}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {tile.label}
          </p>
        </div>
      ))}
    </section>
  );
}
