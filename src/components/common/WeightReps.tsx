import { useTranslation } from 'react-i18next';

interface WeightRepsProps {
  weight: number;
  reps: number;
  /** Classes for the wrapper. The internal order is not negotiable. */
  className?: string;
}

/**
 * A personal best as `100 kg × 6`, pinned left-to-right.
 *
 * `dir="ltr"` is the entire point of this component. The value is a run of
 * digits, a Hebrew unit and a neutral `×`, and inside a right-to-left
 * paragraph the bidi algorithm reorders that into one number: 100 kg × 6 came
 * out of the client card reading **`1006`**, and 87.5 × 8 read `87.58`.
 *
 * No amount of spacing or punctuation fixes it — every neutral character
 * between two digit runs behaves the same way under RTL. Isolating the value
 * in its own LTR element is what pins weight, unit and reps in that order, in
 * both languages, which is also the order anyone writes a set in.
 *
 * `WorkoutHistoryPage`'s `SetChip` solved this for the training log on
 * 2026-09-18; the two personal-best rows were missed by that pass. This
 * exists so the third place to show a weight has something to reuse instead
 * of rediscovering the bug.
 */
export function WeightReps({ weight, reps, className }: WeightRepsProps) {
  const { t } = useTranslation();

  return (
    <span
      dir="ltr"
      className={`inline-flex items-baseline gap-x-1 tabular-nums ${className ?? ''}`}
    >
      <span>{weight}</span>
      <span className="text-[10px] font-semibold text-on-surface-variant">
        {t('common.kg')}
      </span>
      <span className="font-normal text-on-surface-variant">×</span>
      <span>{reps}</span>
    </span>
  );
}
