import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { ActiveNutritionCardProps } from '../../types/dashboard-components.types';

/**
 * Active nutrition plan — "Performance Lab" design.
 *
 * The macro ring is a plain SVG rather than Mantine's RingProgress so it can
 * use the design's token colours and stroke weight directly. Segments are laid
 * out with stroke-dasharray around a single circle, each offset by the sum of
 * the previous ones.
 */

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface Macro {
  key: string;
  label: string;
  grams: number;
  percent: number;
  /** Ring stroke colour. */
  stroke: string;
  /** Dot + bar colour. */
  bar: string;
}

export function ActiveNutritionCard({ plan }: ActiveNutritionCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!plan) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
            <StitchIcon name="restaurant" size={18} />
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
            {t('dashboard.activeNutritionPlan')}
          </h3>
        </div>
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-on-surface-variant text-center">
            {t('dashboard.noActiveNutritionPlan')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/nutrition-plans')}
            className="bg-primary-gradient text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:scale-[1.02] transition-transform"
          >
            {t('dashboard.browseNutritionPlans')}
          </button>
        </div>
      </div>
    );
  }

  // Totals across every food in every meal
  const totals = plan.meals.reduce(
    (acc, meal) => {
      meal.foods.forEach((food) => {
        acc.protein += food.protein || 0;
        acc.carbs += food.carbs || 0;
        acc.fat += food.fat || 0;
        acc.calories += food.calories || 0;
      });
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  );

  const totalGrams = totals.protein + totals.carbs + totals.fat;
  const pct = (value: number) => (totalGrams > 0 ? (value / totalGrams) * 100 : 0);

  const macros: Macro[] = [
    {
      key: 'protein',
      label: t('nutrition.protein'),
      grams: totals.protein,
      percent: pct(totals.protein),
      stroke: 'var(--color-primary)',
      bar: 'bg-primary',
    },
    {
      key: 'carbs',
      label: t('nutrition.carbs'),
      grams: totals.carbs,
      percent: pct(totals.carbs),
      stroke: 'var(--color-secondary-container)',
      bar: 'bg-secondary-container',
    },
    {
      key: 'fats',
      label: t('nutrition.fats'),
      grams: totals.fat,
      percent: pct(totals.fat),
      stroke: '#fb923c',
      bar: 'bg-orange-400',
    },
  ];

  const goalLabel: Record<string, string> = {
    bulk: t('dashboard.goalBulk'),
    cut: t('dashboard.goalCut'),
    maintain: t('dashboard.goalMaintain'),
  };

  const calories = plan.totalCalories || Math.round(totals.calories);

  // Running offset so each arc starts where the previous one ended
  let offset = 0;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white shrink-0">
            <StitchIcon name="restaurant" size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold tracking-tight text-on-surface truncate">
              {plan.title}
            </h3>
            {plan.target && (
              <p className="text-xs text-on-surface-variant">
                {t('nutrition.goal')}: {goalLabel[plan.target] ?? plan.target}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/nutrition-plans')}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline shrink-0"
        >
          {t('dashboard.macroView')}
          <StitchIcon name="chevron_right" size={14} />
        </button>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        {/* Macro ring */}
        <div className="relative shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128" role="img"
            aria-label={t('nutrition.totalDailyFuel')}>
            <circle
              cx="64"
              cy="64"
              r={RING_RADIUS}
              fill="none"
              stroke="var(--color-surface-container-high)"
              strokeWidth="12"
            />
            {macros.map((m) => {
              const length = (m.percent / 100) * RING_CIRCUMFERENCE;
              const dash = `${length} ${RING_CIRCUMFERENCE - length}`;
              const thisOffset = offset;
              offset += length;
              return (
                <circle
                  key={m.key}
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  stroke={m.stroke}
                  strokeWidth="12"
                  strokeDasharray={dash}
                  strokeDashoffset={-thisOffset}
                  transform="rotate(-90 64 64)"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-on-surface leading-none">
              {calories.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">
              {t('nutrition.kcal')}
            </span>
          </div>
        </div>

        {/* Macro breakdown */}
        <div className="flex-1 min-w-[180px] space-y-3">
          {macros.map((m) => (
            <div key={m.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${m.bar}`} />
                  <span className="text-xs font-bold text-on-surface">
                    {m.label}
                  </span>
                </div>
                <span className="text-xs font-black text-on-surface">
                  {Math.round(m.grams)}
                  <span className="text-on-surface-variant/50 font-normal">g</span>
                </span>
              </div>
              <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${m.bar} h-full`}
                  style={{ width: `${m.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-outline-variant/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {t('nutrition.mealCount', { count: plan.meals.length })}
        </span>
        {plan.averageRating > 0 && (
          <span className="text-[10px] font-bold text-amber-600">
            ★ {plan.averageRating.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
