import { useTranslation } from 'react-i18next';

interface WeightRepsProps {
  weight: number | string;
  reps: number | string;
  /** Classes for the wrapper. */
  className?: string;
  /** Smaller unit and gap, for chips and inline comparison rows. */
  compact?: boolean;
}

/**
 * One set as `100 kg × 6`, in the reading direction of the page.
 *
 * History: rendered as loose text inside an RTL paragraph, the run of digits,
 * a Hebrew unit and a neutral `×` was reordered by the bidi algorithm into one
 * number (`100 kg × 6` read **`1006`**). The first fix pinned the whole value
 * `dir="ltr"`, which kept the digits apart but made the set read backwards to a
 * Hebrew reader: scanning from the right they met the reps, then `×`, then the
 * unit, and only then the weight ("12 × ק"ג 36").
 *
 * Now each part is its own flex item, so bidi can no longer merge them, and the
 * flex row follows the page direction: weight and its unit first, then `×`,
 * then reps, whichever way the page reads. Each number is a `<bdi>` so a
 * decimal point or a minus sign never escapes its own run.
 *
 * Every place that shows a set uses this, so the next fix lands everywhere.
 */
export function WeightReps({ weight, reps, className, compact = false }: WeightRepsProps) {
  const { t } = useTranslation();
  return (
    <span
      data-weight-reps=""
      className={`inline-flex items-baseline ${compact ? 'gap-x-0.5' : 'gap-x-1'} tabular-nums ${className ?? ''}`}
    >
      <bdi>{weight}</bdi>
      <span className="text-[10px] font-semibold text-on-surface-variant">{t('common.kg')}</span>
      <span className="font-normal text-on-surface-variant">×</span>
      <bdi>{reps}</bdi>
    </span>
  );
}
