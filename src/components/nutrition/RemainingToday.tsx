import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { mealLogService, localDayString } from '../../services/meal-log.service';
import type { DailyIntake, Macros } from '../../types/meal-log.types';

/**
 * What is left today.
 *
 * Three states, and the difference between them is the whole design:
 *
 *   - **A plan is active.** Consumed, target and remaining, per macro.
 *   - **No plan is active.** Consumed only. The server sends `target: null`
 *     rather than zeros, and this renders that absence as "no target set"
 *     instead of inventing a bar that is always 100% full.
 *   - **Nothing logged and no plan.** Nothing at all — the card is absent, the
 *     same way the fatigue card stays absent rather than apologising on a new
 *     account.
 *
 * Over target shows a **negative** number in a warning tone rather than
 * clamping at zero, because "exactly on target" and "900 calories past it" must
 * not render identically.
 */

type MacroKey = keyof Macros;

const ROWS: { key: MacroKey; label: string; unit: 'kcal' | 'g' }[] = [
  { key: 'calories', label: 'nutrition.calories', unit: 'kcal' },
  { key: 'protein', label: 'nutrition.protein', unit: 'g' },
  { key: 'carbs', label: 'nutrition.carbs', unit: 'g' },
  { key: 'fat', label: 'nutrition.fat', unit: 'g' },
];

function Bar({ consumed, target }: { consumed: number; target: number }) {
  // Capped at 100% for the *fill*; the number beside it is what tells the user
  // they went over. A bar that overflows its track just looks like a bug.
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const over = target > 0 && consumed > target;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
      <div
        className={`h-full rounded-full ${over ? 'bg-warning' : 'bg-primary'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function RemainingToday({
  day = localDayString(),
  showMeals = false,
  onChanged,
}: {
  day?: string;
  /** The log screen lists the day's entries; the dashboard card does not. */
  showMeals?: boolean;
  onChanged?: () => void;
}) {
  const { t } = useTranslation();
  const [intake, setIntake] = useState<DailyIntake | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    mealLogService
      .getDay(day)
      .then(setIntake)
      // Supporting information, never a reason to break the page around it.
      .catch(() => setFailed(true));
  }, [day]);

  useEffect(load, [load]);

  if (failed || !intake) return null;

  const { consumed, target, remaining, meals } = intake;

  // Nothing eaten and nothing to aim at: no card.
  if (meals.length === 0 && !target) return null;

  const remove = async (id: string) => {
    await mealLogService.remove(id);
    load();
    onChanged?.();
  };

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
      <header className="mb-1 flex items-center gap-2">
        <StitchIcon name="restaurant" size={18} />
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {t(target ? 'mealLog.remainingTitle' : 'mealLog.consumedTitle')}
        </h2>
      </header>

      <p className="mb-4 text-xs text-on-surface-variant">
        {target
          ? t('mealLog.remainingSubtitle', { plan: intake.planTitle ?? '' })
          : t('mealLog.noTargetSubtitle')}
      </p>

      {/* Decision 1 made visible: when the plan's declared calories disagree
          with the foods it lists, say so rather than quietly picking one. */}
      {intake.calorieTargetMismatch && (
        <p className="mb-4 rounded-lg bg-warning-container px-3 py-2 text-[11px] font-bold text-on-warning-container">
          {t('mealLog.targetMismatch', intake.calorieTargetMismatch)}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {ROWS.map(({ key, label, unit }) => {
          const eaten = consumed[key];
          const goal = target?.[key] ?? null;
          const left = remaining?.[key] ?? null;
          const over = left !== null && left < 0;

          return (
            <li key={key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-on-surface">{t(label)}</span>
                <span className="ms-auto text-xs text-on-surface-variant">
                  {goal !== null
                    ? t('mealLog.ofTarget', { consumed: eaten, target: goal, unit: t(`mealLog.u_${unit}`) })
                    : `${eaten} ${t(`mealLog.u_${unit}`)}`}
                </span>
              </div>

              {goal !== null && <Bar consumed={eaten} target={goal} />}

              {left !== null && (
                <span
                  className={`text-xs font-extrabold ${over ? 'text-warning' : 'text-success'}`}
                >
                  {over
                    ? t('mealLog.over', { amount: Math.abs(left), unit: t(`mealLog.u_${unit}`) })
                    : t('mealLog.left', { amount: left, unit: t(`mealLog.u_${unit}`) })}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {showMeals && meals.length > 0 && (
        <div className="mt-5 border-t border-outline-variant/20 pt-4">
          <h3 className="mb-2 text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
            {t('mealLog.loggedToday')}
          </h3>
          <ul className="flex flex-col gap-2">
            {meals.map((meal) => (
              <li
                key={meal.id}
                className="flex items-center gap-2 rounded-lg border border-outline-variant/20 p-2"
              >
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-bold text-on-surface">
                    {meal.label || t(`mealLog.meal_${meal.mealType}`)}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {t('nutrition.macroLine', { ...meal.totals })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(meal.id)}
                  aria-label={t('common.delete')}
                  className="min-h-9 min-w-9 rounded-lg text-error"
                >
                  <StitchIcon name="delete" size={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
