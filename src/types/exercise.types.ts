/**
 * The exercise catalogue.
 *
 * Shared reference content, not user data: every signed-in user sees the same
 * rows. It exists so "chest press", "לחיצת חזה" and "Chest Press " stop being
 * three different exercises — but it never constrains what a user may type,
 * because a plan's `muscleGroup` is still a free string.
 */

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core',
  'full_body',
  'cardio',
] as const;

export const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'band',
  'other',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type Equipment = (typeof EQUIPMENT)[number];

export interface Exercise {
  slug: string;
  nameEn: string;
  nameHe: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  aliases: string[];
  isCompound: boolean;
}

export interface ExerciseSearchQuery {
  search?: string;
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  limit?: number;
}
