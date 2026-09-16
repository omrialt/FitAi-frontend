/**
 * TargetCard - one physical target, with a progress bar per metric it covers.
 */

import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../../../common/StitchIcon';
import { formatDate } from '../helpers/calcImprovement';
import type { TargetCardProps } from '../../../../types/physical-target-components.types';
import type { TargetMetric } from '../../../../types/physical-target.types';

const METRIC_LABEL_KEYS: Record<TargetMetric, string> = {
  weightKg: 'physicalData.weightKgHeader',
  bodyFatPercent: 'physicalData.bodyFatPct',
  chest: 'physicalData.chestCm',
  waist: 'physicalData.waistCm',
  hips: 'physicalData.hipsCm',
  arms: 'physicalData.armsCm',
  legs: 'physicalData.legsCm',
};

// Unit label keys; null means a literal '%' (the same in every language).
const METRIC_UNIT: Record<TargetMetric, string | null> = {
  weightKg: 'common.kg',
  bodyFatPercent: null,
  chest: 'physicalData.cm',
  waist: 'physicalData.cm',
  hips: 'physicalData.cm',
  arms: 'physicalData.cm',
  legs: 'physicalData.cm',
};

function statusPill(status: string): string {
  if (status === 'achieved') return 'bg-success-container text-on-success-container';
  if (status === 'abandoned') return 'bg-surface-container-high text-on-surface-variant';
  return 'bg-primary/10 text-primary';
}

export function TargetCard({ target, progress, onEdit, onDelete }: TargetCardProps) {
  const { t } = useTranslation();

  const daysRemaining = progress?.daysRemaining;
  let dueLabel: string | null = null;
  if (target.status === 'active' && daysRemaining != null) {
    if (daysRemaining > 0) dueLabel = t('physicalTargets.daysRemaining', { count: daysRemaining });
    else if (daysRemaining === 0) dueLabel = t('physicalTargets.dueToday');
    else dueLabel = t('physicalTargets.overdue', { count: Math.abs(daysRemaining) });
  }

  // Iterate the known metrics, not the object's keys: targets stored before the
  // backend dropped subdocument ids carry an extra `_id` key in targetValues.
  const metrics = (Object.keys(METRIC_UNIT) as TargetMetric[]).filter(
    (metric) => target.targetValues[metric] !== undefined,
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-extrabold tracking-tight text-on-surface">
              {target.name || t('physicalTargets.target')}
            </h4>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusPill(target.status)}`}
            >
              {t(`physicalTargets.status.${target.status}`)}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            {t('physicalTargets.targetDate')}: {formatDate(target.targetDate)}
            {dueLabel && <span className="ms-2 font-bold">· {dueLabel}</span>}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('common.edit')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <StitchIcon name="edit" size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={t('common.delete')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
          >
            <StitchIcon name="delete" size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((metric) => {
          const metricProgress = progress?.metrics.find((m) => m.metric === metric);
          const pct = metricProgress?.percentComplete ?? 0;
          const unitKey = METRIC_UNIT[metric];
          const unit = unitKey ? t(unitKey) : '%';

          return (
            <div key={metric}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-on-surface">{t(METRIC_LABEL_KEYS[metric])}</span>
                {/* Each value is isolated so its number and unit never reorder
                    against the surrounding text in RTL; the arrow is an icon so
                    the global RTL rule in index.css mirrors it to point at the
                    target in both directions. */}
                <span className="inline-flex items-center gap-1 text-on-surface-variant">
                  <bdi>
                    {metricProgress?.current != null ? metricProgress.current : '—'} {unit}
                  </bdi>
                  <StitchIcon name="arrow_forward" size={12} />
                  <bdi>
                    {target.targetValues[metric]} {unit}
                  </bdi>
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-primary-gradient rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {target.notes && (
        <p className="text-xs text-on-surface-variant mt-4 pt-4 border-t border-outline-variant/10">
          {target.notes}
        </p>
      )}
    </div>
  );
}
