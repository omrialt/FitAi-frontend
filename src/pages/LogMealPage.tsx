import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@mantine/core';
import { toast } from 'sonner';

import { AppLayout } from '../components/AppLayout';
import { StitchIcon } from '../components/common/StitchIcon';
import { MealComposer } from '../components/nutrition/MealComposer';
import { RemainingToday } from '../components/nutrition/RemainingToday';
import { mealLogService, localDayString } from '../services/meal-log.service';
import { foodService } from '../services/coach.service';
import { useDashboard } from '../hooks/useDashboard';
import type {
  LoggedFood,
  MealSource,
  MealType,
} from '../types/meal-log.types';

/**
 * The screen the "log meal" button should always have gone to.
 *
 * It used to navigate to `/nutrition-plans` — a list of *templates* — which is
 * the nutrition equivalent of answering "record my workout" with "here are your
 * training plans". The button now lands somewhere that writes something down.
 *
 * The running total sits on the same screen as the form on purpose. Logging a
 * meal is not the goal; knowing what is left afterwards is, and making the user
 * navigate back to the dashboard to find out would put the answer one step
 * further away than the question.
 */

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Rough local-time guess, only to preselect a tab the user can change. */
function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

export default function LogMealPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeNutritionPlan } = useDashboard();

  const [mealType, setMealType] = useState<MealType>(guessMealType);
  const [foods, setFoods] = useState<LoggedFood[]>([]);
  const [source, setSource] = useState<MealSource>('manual');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // The day is computed in the browser and sent with the entry — the server
  // runs in UTC and does not know what day it is where the user is standing.
  const day = localDayString();

  useEffect(() => {
    let cancelled = false;
    foodService
      .getStatus()
      .then((s) => { if (!cancelled) setSearchEnabled(s.search); })
      .catch(() => undefined);
    return () => { cancelled = true; };
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

  /** Meals from the active plan, offered as a starting point. */
  const planMeals = activeNutritionPlan?.meals ?? [];

  const loadFromPlan = (index: number) => {
    const meal = planMeals[index];
    if (!meal) return;

    setFoods(
      meal.foods.map((f) => ({
        name: f.name,
        quantity: f.quantity ?? null,
        unit: (f.unit as LoggedFood['unit']) ?? null,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
      })),
    );
    setSource('plan');
    setLabel(t(`nutrition.meal_${meal.mealType}`, meal.mealType));
    if (MEAL_TYPES.includes(meal.mealType as MealType)) {
      setMealType(meal.mealType as MealType);
    }
  };

  const save = async () => {
    if (foods.length === 0 || saving) return;

    setSaving(true);
    try {
      await mealLogService.create({
        localDay: day,
        mealType,
        source,
        label: label.trim() || undefined,
        foods,
      });

      toast.success(t('mealLog.saved'));
      // Cleared rather than navigating away: logging two things in a row is
      // normal, and the running total below updates in place.
      setFoods([]);
      setLabel('');
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error(t('mealLog.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Container size="lg" py="xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-1 text-sm font-bold text-primary"
        >
          <StitchIcon name="chevron_right" size={16} />
          {t('mealLog.backToDashboard')}
        </button>

        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-on-surface">
            {t('mealLog.title')}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t('mealLog.subtitle', {
              date: new Date().toLocaleDateString(i18n.language),
            })}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr] items-start">
          <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
            <fieldset className="mb-4">
              <legend className="mb-2 text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
                {t('mealLog.mealType')}
              </legend>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mealType === m}
                    onClick={() => setMealType(m)}
                    className={`min-h-10 rounded-lg border px-4 text-sm font-bold ${
                      mealType === m
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/40 text-on-surface-variant'
                    }`}
                  >
                    {t(`mealLog.meal_${m}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Offered only when there is a plan to offer from — an empty
                "load from plan" control would just be a dead button. */}
            {planMeals.length > 0 && (
              <fieldset className="mb-4">
                <legend className="mb-2 text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
                  {t('mealLog.fromPlan')}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {planMeals.map((meal, i) => (
                    <button
                      key={`${meal.mealType}-${i}`}
                      type="button"
                      onClick={() => loadFromPlan(i)}
                      className="min-h-10 rounded-lg border border-outline-variant/40 px-3 text-xs font-bold text-on-surface-variant"
                    >
                      {t(`nutrition.meal_${meal.mealType}`, meal.mealType)}
                      <span className="ms-2 text-on-surface-variant/70">
                        {meal.foods.length}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <MealComposer
              foods={foods}
              onChange={setFoods}
              onSourceChange={setSource}
              searchEnabled={searchEnabled}
            />

            {foods.length > 0 && (
              <div className="mt-5 border-t border-outline-variant/20 pt-4">
                <p className="mb-3 text-sm font-extrabold text-on-surface">
                  {t('nutrition.macroLine', { ...totals })}
                </p>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={saving}
                  className="min-h-12 w-full rounded-lg bg-primary-gradient text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? t('mealLog.saving') : t('mealLog.save')}
                </button>
              </div>
            )}
          </section>

          {/* The answer to "so what's left", beside the form rather than a
              navigation away from it. */}
          <RemainingToday key={refreshKey} day={day} showMeals />
        </div>
      </Container>
    </AppLayout>
  );
}
