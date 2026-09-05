export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** Provenance only — nothing branches on it, but it answers "where did this number come from". */
export type MealSource = 'plan' | 'search' | 'manual';

export type FoodUnit =
  | 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'lb' | 'cup' | 'tbsp' | 'tsp' | 'unit';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Same shape as a nutrition plan's food, on purpose. */
export interface LoggedFood {
  name: string;
  quantity?: number | null;
  unit?: FoodUnit | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fdcId?: number | null;
}

export interface MealLogEntry {
  id: string;
  localDay: string;
  loggedAt: string;
  mealType: MealType;
  source: MealSource;
  label: string | null;
  foods: LoggedFood[];
  notes: string | null;
  /** Summed from `foods` by the server; never stored. */
  totals: Macros;
}

/**
 * One day of eating.
 *
 * `target` and `remaining` are both `null` when no nutrition plan is active —
 * not zero. Zero would read as "you have nothing left"; null means "there is
 * nothing to compare against", which is a different and truer statement.
 *
 * `remaining` is **not clamped**: going past the target yields negative
 * numbers, because "300 over" and "exactly on target" must not look alike.
 */
export interface DailyIntake {
  localDay: string;
  meals: MealLogEntry[];
  consumed: Macros;
  target: Macros | null;
  remaining: Macros | null;
  planId: string | null;
  planTitle: string | null;
  /** Set when the plan's declared calories disagree with the foods it lists. */
  calorieTargetMismatch: { declared: number; summed: number } | null;
}

export interface CreateMealLogInput {
  localDay: string;
  mealType: MealType;
  source?: MealSource;
  label?: string;
  foods: LoggedFood[];
  notes?: string;
}
