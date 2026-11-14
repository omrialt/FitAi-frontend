import type { TFunction } from 'i18next';

/**
 * A plan's focus as the user should read it.
 *
 * Generated plans store the goal id ("hypertrophy", "fat_loss"), which the
 * coach screens already translate as `coach.goal_*`; trainers type free text
 * ("פלג גוף עליון"). Only a bare id is looked up, so free text containing a
 * "." or ":" is never mistaken for an i18n key path.
 */
export function focusLabel(t: TFunction, focus: string): string {
  const id = focus.trim().toLowerCase();
  if (!/^[a-z_]+$/.test(id)) return focus;
  return t(`coach.goal_${id}`, { defaultValue: focus });
}
