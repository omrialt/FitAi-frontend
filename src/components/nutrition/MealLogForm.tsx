/**
 * The meal-logging form, shared by the /log-meal page and the bottom sheet the
 * quick-add opens (redesign, direction B).
 *
 * Feedback follows the design's spec: the meal type is pre-picked from the
 * clock, saving closes the sheet at once and confirms with a toast that offers
 * Undo for a few seconds — undo rather than "are you sure" (feedback-patterns).
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MealComposer } from './MealComposer';
import { PlanFoodPicker } from './PlanFoodPicker';
import { mealLogService, localDayString } from '../../services/meal-log.service';
import { foodService } from '../../services/coach.service';
import type { NutritionPlan } from '../../types/nutrition.types';
import type { LoggedFood, MealLogEntry, MealSource, MealType } from '../../types/meal-log.types';
import { MEAL_TYPES, guessMealType } from '../../utils/mealType';

/** Fired on window after a meal is saved or undone, so open screens refresh. */
export const MEAL_LOGGED_EVENT = 'fitai:meal-logged';

export function MealLogForm({
  plan,
  onSaved,
}: {
  plan: NutritionPlan | null;
  onSaved?: (entry: MealLogEntry) => void;
}) {
  const { t } = useTranslation();
  const [mealType, setMealType] = useState<MealType>(guessMealType);
  const [foods, setFoods] = useState<LoggedFood[]>([]);
  const [source, setSource] = useState<MealSource>('manual');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    foodService
      .getStatus()
      .then((s) => {
        if (!cancelled) setSearchEnabled(s.search);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(
    () =>
      foods.reduce(
        (acc, f) => ({
          calories: acc.calories + (f.calories || 0),
          protein: Math.round((acc.protein + (f.protein || 0)) * 10) / 10,
          carbs: Math.round((acc.carbs + (f.carbs || 0)) * 10) / 10,
          fat: Math.round((acc.fat + (f.fat || 0)) * 10) / 10,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [foods],
  );

  const addFromPlan = (picked: LoggedFood[], mealLabel?: string, pickedType?: string) => {
    if (picked.length === 0) return;
    setFoods((current) => [...current, ...picked]);
    setSource('plan');
    if (mealLabel) setLabel(mealLabel);
    if (pickedType && MEAL_TYPES.includes(pickedType as MealType)) {
      setMealType(pickedType as MealType);
    }
  };

  const save = async () => {
    if (foods.length === 0 || saving) return;
    setSaving(true);
    try {
      const entry = await mealLogService.create({
        localDay: localDayString(),
        mealType,
        source,
        label: label.trim() || undefined,
        foods,
      });
      window.dispatchEvent(new Event(MEAL_LOGGED_EVENT));
      toast.success(t('mealLog.savedTo', { meal: t(`mealLog.meal_${mealType}`) }), {
        duration: 5000,
        action: {
          label: t('common.undo'),
          onClick: () => {
            void mealLogService
              .remove(entry.id)
              .then(() => {
                window.dispatchEvent(new Event(MEAL_LOGGED_EVENT));
                toast(t('mealLog.undone'));
              })
              .catch(() => toast.error(t('mealLog.undoFailed')));
          },
        },
      });
      setFoods([]);
      setLabel('');
      onSaved?.(entry);
    } catch {
      toast.error(t('mealLog.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* One segmented control instead of four loose buttons. */}
      <div
        role="group"
        aria-label={t('mealLog.mealType')}
        className="grid grid-cols-4 gap-1 rounded-[14px] bg-surface-container-high p-1"
      >
        {MEAL_TYPES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mealType === m}
            onClick={() => setMealType(m)}
            className={`min-h-11 rounded-[10px] text-sm font-semibold transition-colors ${
              mealType === m
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant'
            }`}
          >
            {t(`mealLog.meal_${m}`)}
          </button>
        ))}
      </div>

      <PlanFoodPicker plan={plan} onAddFoods={addFromPlan} />

      <MealComposer
        foods={foods}
        onChange={setFoods}
        onSourceChange={setSource}
        searchEnabled={searchEnabled}
      />

      {foods.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-4">
          <p className="text-sm font-bold text-on-surface">
            {t('nutrition.macroLine', { ...totals })}
          </p>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="bg-primary-gradient min-h-[52px] w-full rounded-[var(--radius-control)] text-base font-bold transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? t('mealLog.saving') : t('mealLog.saveTo', { meal: t(`mealLog.meal_${mealType}`) })}
          </button>
        </div>
      )}
    </div>
  );
}
