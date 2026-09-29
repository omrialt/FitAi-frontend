import type { TFunction } from 'i18next';

/** How a workout type, a muscle group and a day are named in the history panels. */

/** A session's `dayName`, or the label for sessions logged without one. */
export function typeLabel(t: TFunction, dayName: string | null): string {
  return dayName || t('workout.history.freeType');
}

/**
 * The catalogue's muscle label when there is one ("chest" → "חזה"), and the
 * logged value itself when there is not — plans may carry groups such as
 * "legs" that the catalogue splits into quads and hamstrings.
 */
export function muscleLabel(t: TFunction, muscleGroup: string): string {
  const key = muscleGroup.trim().toLowerCase().replace(/\s+/g, '_');
  return t(`exercises.muscle_${key}`, { defaultValue: muscleGroup });
}

/** "12 Sep" in the UI language, from an ISO day or timestamp. */
export function shortDate(iso: string, locale: string): string {
  const value = iso.length === 10 ? `${iso}T12:00:00` : iso;
  return new Date(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}
