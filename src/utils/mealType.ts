import type { MealType } from '../types/meal-log.types';

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** The meal a log most likely belongs to, from the clock. */
export function guessMealType(date: Date = new Date()): MealType {
  const h = date.getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}
