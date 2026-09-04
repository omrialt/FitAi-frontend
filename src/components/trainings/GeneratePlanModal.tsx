import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { coachService } from '../../services/coach.service';
import type { CoachGoal } from '../../types/coach.types';

/**
 * Four questions, then a plan.
 *
 * The form is short on purpose. Every field here is one the model genuinely
 * cannot infer — a goal, how many evenings a week, what equipment is actually
 * available, and what not to load — and each maps to a constraint the server
 * enforces rather than a preference it passes along as prose.
 *
 * The injury field is the one worth reading twice. It offers muscle groups, not
 * a free-text box, and the word used in the copy is "avoid" rather than
 * "injury": "do not load my shoulder" is a programming constraint the catalogue
 * can enforce, while "I have a torn rotator cuff" is a medical detail this app
 * should neither store nor reason about. A textarea here would collect the
 * second while appearing to ask for the first.
 */

const GOALS: CoachGoal[] = ['strength', 'hypertrophy', 'fat_loss', 'general'];

const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'band',
] as const;

const AVOIDABLE = [
  'shoulders',
  'back',
  'chest',
  'quads',
  'hamstrings',
  'core',
] as const;

const EXPERIENCE = ['beginner', 'intermediate', 'advanced'] as const;

function Chips<T extends string>({
  options,
  selected,
  onToggle,
  labelPrefix,
}: {
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  /**
   * Concatenated with the option, not dotted onto it — the catalogue's labels
   * are already flat keys (`exercises.equipment_barbell`) and this reuses them
   * rather than adding a second copy of the same vocabulary.
   */
  labelPrefix: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option)}
            className={`min-h-9 rounded-lg border px-3 text-xs font-bold transition-colors ${
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline-variant/40 text-on-surface-variant'
            }`}
          >
            {t(`${labelPrefix}${option}`)}
          </button>
        );
      })}
    </div>
  );
}

export function GeneratePlanModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (planId: string) => void;
}) {
  const { t, i18n } = useTranslation();

  const [goal, setGoal] = useState<CoachGoal>('hypertrophy');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [equipment, setEquipment] = useState<string[]>(['barbell', 'dumbbell']);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [experience, setExperience] = useState<(typeof EXPERIENCE)[number]>(
    'beginner',
  );

  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropped, setDropped] = useState<string[]>([]);

  if (!open) return null;

  const toggle = (list: string[], setList: (next: string[]) => void) =>
    (value: string) =>
      setList(
        list.includes(value)
          ? list.filter((item) => item !== value)
          : [...list, value],
      );

  const submit = async () => {
    setWorking(true);
    setError(null);
    setDropped([]);

    try {
      const result = await coachService.generatePlan({
        goal,
        daysPerWeek,
        equipment: equipment.length > 0 ? equipment : undefined,
        avoid: avoid.length > 0 ? avoid : undefined,
        experience,
        language: i18n.language.startsWith('he') ? 'he' : 'en',
      });

      // Surfaced, not swallowed: a non-empty list means the plan is thinner
      // than the one that was written, and the user is about to open it.
      if (result.droppedSlugs.length > 0) {
        setDropped(result.droppedSlugs);
      }

      onCreated(result.plan._id as string);
    } catch {
      setError(t('coach.generateFailed'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('coach.generateTitle')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface-container-lowest p-6">
        <header className="mb-1 flex items-center gap-2">
          <StitchIcon name="brain" size={20} />
          <h2 className="flex-1 text-lg font-extrabold tracking-tight text-on-surface">
            {t('coach.generateTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="min-h-10 min-w-10 rounded-lg text-on-surface-variant"
          >
            <StitchIcon name="close" size={18} />
          </button>
        </header>

        <p className="mb-5 text-xs text-on-surface-variant">
          {t('coach.generateSubtitle')}
        </p>

        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-2 text-xs font-black uppercase tracking-widest text-on-surface-variant">
              {t('coach.goal')}
            </legend>
            <Chips
              options={GOALS}
              selected={[goal]}
              onToggle={(value) => setGoal(value)}
              labelPrefix="coach.goal_"
            />
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-black uppercase tracking-widest text-on-surface-variant">
              {t('coach.daysPerWeek')}
            </legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={daysPerWeek === days}
                  onClick={() => setDaysPerWeek(days)}
                  className={`min-h-10 flex-1 rounded-lg border text-sm font-bold ${
                    daysPerWeek === days
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/40 text-on-surface-variant'
                  }`}
                >
                  {days}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-black uppercase tracking-widest text-on-surface-variant">
              {t('coach.experience')}
            </legend>
            <Chips
              options={EXPERIENCE}
              selected={[experience]}
              onToggle={(value) => setExperience(value)}
              labelPrefix="coach.experience_"
            />
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-black uppercase tracking-widest text-on-surface-variant">
              {t('coach.equipment')}
            </legend>
            <Chips
              options={EQUIPMENT}
              selected={equipment}
              onToggle={toggle(equipment, setEquipment)}
              labelPrefix="exercises.equipment_"
            />
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-xs font-black uppercase tracking-widest text-on-surface-variant">
              {t('coach.avoid')}
            </legend>
            {/* States plainly that this is an exclusion and not a consultation,
                so nobody types a diagnosis into an app that will not read it. */}
            <p className="mb-2 text-[11px] text-on-surface-variant">
              {t('coach.avoidHint')}
            </p>
            <Chips
              options={AVOIDABLE}
              selected={avoid}
              onToggle={toggle(avoid, setAvoid)}
              labelPrefix="exercises.muscle_"
            />
          </fieldset>
        </div>

        {error && (
          <p className="mt-4 text-sm font-bold text-error" role="alert">
            {error}
          </p>
        )}

        {dropped.length > 0 && (
          <p className="mt-4 text-xs text-on-surface-variant" role="status">
            {t('coach.droppedExercises', { count: dropped.length })}
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-lg border border-outline-variant/40 text-sm font-bold text-on-surface-variant"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={working}
            className="min-h-11 flex-1 rounded-lg bg-primary-gradient text-sm font-bold text-white disabled:opacity-60"
          >
            {working ? t('coach.generating') : t('coach.generate')}
          </button>
        </div>
      </div>
    </div>
  );
}
