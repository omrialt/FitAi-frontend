import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { LoggedFood } from '../../types/meal-log.types';
import type { NutritionPlan } from '../../types/nutrition.types';

/**
 * Picks food out of the active plan — a whole meal, or one item from it.
 *
 * The first version of this screen offered whole meals only, which assumed the
 * day goes to plan. It usually does not: people eat the chicken and skip the
 * rice, or take one item from breakfast and one from lunch. A picker that can
 * only take all four items of a meal pushes that user into typing food by hand
 * that the app already knows the macros for.
 *
 * Two behaviours follow from that, and both differ from the original:
 *
 *   - **Adding appends rather than replaces.** Taking an item from breakfast
 *     and another from lunch has to be possible in one meal, and the composer
 *     below already lets anything added be removed again.
 *
 *   - **Meals start collapsed.** Expanded-by-default would put every food in
 *     the plan on screen at once — for a four-meal plan that is a wall of rows
 *     above the form people actually came to use.
 */
export function PlanFoodPicker({
  plan,
  onAddFoods,
}: {
  plan: NutritionPlan | null;
  /** Appended to whatever is already in the composer. */
  onAddFoods: (foods: LoggedFood[], label?: string, mealType?: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);

  const meals = plan?.meals ?? [];
  if (meals.length === 0) return null;

  /** A plan food is already the shape a logged food is — only `fdcId` differs. */
  const toLogged = (f: NutritionPlan['meals'][number]['foods'][number]): LoggedFood => ({
    name: f.name,
    quantity: f.quantity ?? null,
    unit: (f.unit as LoggedFood['unit']) ?? null,
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
  });

  return (
    <fieldset className="mb-4">
      <legend className="mb-2 text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
        {t('mealLog.fromPlan')}
      </legend>

      <div className="flex flex-col gap-2">
        {meals.map((meal, mi) => {
          const expanded = open === mi;
          const mealCalories = meal.foods.reduce((a, f) => a + f.calories, 0);

          return (
            <div
              key={`${meal.mealType}-${mi}`}
              className="rounded-lg border border-outline-variant/20"
            >
              <div className="flex items-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : mi)}
                  aria-expanded={expanded}
                  className="flex flex-1 items-center gap-2 text-start"
                >
                  <StitchIcon
                    name={expanded ? 'expand_less' : 'expand_more'}
                    size={16}
                  />
                  <span className="text-sm font-bold text-on-surface">
                    {t(`nutrition.meal_${meal.mealType}`, meal.mealType)}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {t('mealLog.itemsAndCalories', {
                      count: meal.foods.length,
                      calories: Math.round(mealCalories),
                    })}
                  </span>
                </button>

                {/* The whole meal in one tap, for the day that does go to
                    plan — the common case should not cost four taps. */}
                <button
                  type="button"
                  onClick={() =>
                    onAddFoods(
                      meal.foods.map(toLogged),
                      t(`nutrition.meal_${meal.mealType}`, meal.mealType),
                      meal.mealType,
                    )
                  }
                  className="min-h-9 shrink-0 rounded-lg border border-primary px-3 text-[11px] font-bold text-primary"
                >
                  {t('mealLog.addWholeMeal')}
                </button>
              </div>

              {expanded && (
                <ul className="flex flex-col gap-1 border-t border-outline-variant/20 p-2">
                  {meal.foods.map((food, fi) => (
                    <li
                      key={`${food.name}-${fi}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-container-low"
                    >
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm text-on-surface">
                          {food.name}
                          {food.quantity
                            ? ` · ${food.quantity}${
                                food.unit && food.unit !== 'unit' ? food.unit : ''
                              }`
                            : ''}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {t('nutrition.macroLine', {
                            calories: food.calories,
                            protein: food.protein,
                            carbs: food.carbs,
                            fat: food.fat,
                          })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddFoods([toLogged(food)])}
                        aria-label={t('mealLog.addItem', { name: food.name })}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant/40 text-primary hover:bg-primary/10"
                      >
                        <StitchIcon name="add" size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
