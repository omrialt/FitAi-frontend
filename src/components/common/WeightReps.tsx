import { useTranslation } from 'react-i18next';

interface WeightRepsProps {
  weight: number | string;
  reps: number | string;
  className?: string;
  /** Classes for the "kg ×" part, which is usually subdued. */
  unitClassName?: string;
}

/**
 * "100 kg × 6", safe in both directions.
 *
 * This used to be `{weight}<span>kg × {reps}</span>` inside a `.tabular-nums`
 * span, which theme.css forces to LTR. With a Hebrew unit in the middle the
 * bidi algorithm pulled the reps across it, so Hebrew rows read "1006 ק"ג ×"
 * — weight and reps glued together. Each number is now its own isolate and
 * the row follows the document direction, so Hebrew reads 100 ק"ג × 6 from
 * the right and English reads 100 kg × 6 from the left.
 */
export function WeightReps({ weight, reps, className = '', unitClassName = '' }: WeightRepsProps) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-baseline gap-1 whitespace-nowrap ${className}`}>
      <bdi className="num" style={{ fontVariantNumeric: 'tabular-nums' }}>{weight}</bdi>
      <span className={unitClassName}>{t('common.kg')}</span>
      <span className={unitClassName} aria-hidden="true">×</span>
      <bdi className="num" style={{ fontVariantNumeric: 'tabular-nums' }}>{reps}</bdi>
    </span>
  );
}
