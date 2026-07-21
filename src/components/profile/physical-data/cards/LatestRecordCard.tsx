/**
 * LatestRecordCard — latest physical-data measurement.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { StitchIcon, type StitchIconName } from '../../../common/StitchIcon';
import { formatDate } from '../helpers/calcImprovement';
import { useAuth } from '../../../../hooks/useAuth';
import type { LatestRecordCardProps } from '../../../../types/physical-data-components.types';

function TrendBadge({
  current,
  previous,
  lowerIsBetter = false,
  unit = '',
}: {
  current?: number | null;
  previous?: number | null;
  lowerIsBetter?: boolean;
  unit?: string;
}) {
  const { t } = useTranslation();

  if (current == null || previous == null) return null;

  const diff = current - previous;

  if (diff === 0) {
    return (
      <p className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 mt-1">
        <StitchIcon name="trending_flat" size={11} />
        {t('physicalData.stable')}
      </p>
    );
  }

  const isGood = lowerIsBetter ? diff < 0 : diff > 0;
  const sign = diff > 0 ? '+' : '';

  return (
    <p
      className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${
        isGood ? 'text-green-600' : 'text-error'
      }`}
    >
      <StitchIcon name={diff < 0 ? 'trending_down' : 'trending_up'} size={11} />
      {t('physicalData.trendThisMonth', {
        sign,
        diff: diff.toFixed(1),
        unit,
      })}
    </p>
  );
}

function getBodyFatZone(
  bodyFat: number,
  gender: string,
  t: TFunction,
): { label: string; pill: string } {
  const isMale = gender === 'male';
  if (bodyFat < (isMale ? 6 : 14))
    return { label: t('physicalData.zone.essentialFat'), pill: 'bg-blue-100 text-blue-700' };
  if (bodyFat < (isMale ? 14 : 21))
    return { label: t('physicalData.zone.athletic'), pill: 'bg-primary/10 text-primary' };
  if (bodyFat < (isMale ? 18 : 25))
    return { label: t('physicalData.zone.optimal'), pill: 'bg-green-100 text-green-700' };
  if (bodyFat < (isMale ? 25 : 32))
    return { label: t('physicalData.zone.acceptable'), pill: 'bg-amber-100 text-amber-700' };
  return { label: t('physicalData.zone.highRange'), pill: 'bg-error-container text-on-error-container' };
}

function getBMIZone(bmi: number, t: TFunction): { label: string; pill: string } {
  if (bmi < 18.5)
    return { label: t('physicalData.zone.underweight'), pill: 'bg-blue-100 text-blue-700' };
  if (bmi < 25)
    return { label: t('physicalData.zone.healthyRange'), pill: 'bg-green-100 text-green-700' };
  if (bmi < 30)
    return { label: t('physicalData.zone.overweight'), pill: 'bg-amber-100 text-amber-700' };
  return { label: t('physicalData.zone.obese'), pill: 'bg-error-container text-on-error-container' };
}

/** One large metric tile. */
function MetricTile({
  icon,
  chip,
  label,
  children,
  accent = false,
}: {
  icon: StitchIconName;
  chip: string;
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border border-outline-variant/10 ${
        accent ? 'bg-surface-container-low' : 'bg-surface-container-lowest'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${chip}`}>
          <StitchIcon name={icon} size={16} />
        </span>
        <span className="text-xs font-bold text-on-surface-variant">{label}</span>
      </div>
      {children}
    </div>
  );
}

export function LatestRecordCard({
  record,
  previousRecord,
  bmi,
}: LatestRecordCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userGender = user?.gender || 'male';

  const bfZone =
    record.bodyFatPercent != null
      ? getBodyFatZone(record.bodyFatPercent, userGender, t)
      : null;
  const bmiZone = bmi?.bmi != null ? getBMIZone(bmi.bmi, t) : null;

  // Crude lean-mass estimate; labelled as an estimate in the caption below
  const muscleMassPct =
    record.bodyFatPercent != null
      ? Math.max(0, 100 - record.bodyFatPercent - 15).toFixed(1)
      : null;

  const dash = '—';
  const measurements = record.measurements;
  const hasMeasurements =
    measurements && Object.values(measurements).some(Boolean);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
          {t('physicalData.latestMetrics')}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
          {t('physicalData.lastUpdate', { date: formatDate(record.dateRecorded) })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weight */}
        <MetricTile
          icon="monitor_weight"
          chip="bg-primary/10 text-primary"
          label={t('physicalData.currentWeight')}
        >
          <p className="text-3xl font-black text-on-surface leading-none">
            {record.weightKg}
            <span className="text-base font-normal text-on-surface-variant ms-1">
              {t('common.kg')}
            </span>
          </p>
          <TrendBadge
            current={record.weightKg}
            previous={previousRecord?.weightKg}
            unit={` ${t('common.kg')}`}
          />
        </MetricTile>

        {/* Body fat */}
        <MetricTile
          icon="water_drop"
          chip="bg-secondary-fixed text-on-secondary-container"
          label={t('physicalData.bodyFatPct')}
        >
          <p className="text-3xl font-black text-on-surface leading-none">
            {record.bodyFatPercent ?? dash}
            {record.bodyFatPercent != null && (
              <span className="text-base font-normal text-on-surface-variant ms-1">%</span>
            )}
          </p>
          {bfZone && (
            <span
              className={`inline-block mt-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${bfZone.pill}`}
            >
              {bfZone.label}
            </span>
          )}
        </MetricTile>

        {/* BMI */}
        <MetricTile
          icon="balance"
          chip="bg-tertiary-fixed text-tertiary"
          label={t('physicalData.bmiIndex')}
        >
          <p className="text-3xl font-black text-on-surface leading-none">
            {bmi?.bmi != null ? bmi.bmi.toFixed(1) : dash}
            {bmi?.bmi != null && (
              <span className="text-base font-normal text-on-surface-variant ms-1">
                {t('physicalData.pt')}
              </span>
            )}
          </p>
          {bmiZone && (
            <span
              className={`inline-block mt-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${bmiZone.pill}`}
            >
              {bmiZone.label}
            </span>
          )}
        </MetricTile>

        {/* Lean mass estimate */}
        <MetricTile
          icon="exercise"
          chip="bg-orange-100 text-orange-600"
          label={t('physicalData.leanMuscleFocus')}
          accent
        >
          {muscleMassPct != null ? (
            <>
              <p className="text-3xl font-black text-on-surface leading-none">
                {muscleMassPct}
                <span className="text-base font-normal text-on-surface-variant ms-1">%</span>
              </p>
              <p className="text-[10px] text-on-surface-variant mt-1">
                {t('physicalData.leanMassRatio')}
              </p>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">
              {t('physicalData.addBodyFatHint')}
            </p>
          )}
        </MetricTile>
      </div>

      {/* Body measurements */}
      {hasMeasurements && (
        <div className="mt-6 pt-6 border-t border-outline-variant/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
            {t('physicalData.bodyMeasurements')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {(['chest', 'waist', 'hips', 'arms', 'legs'] as const).map((key) =>
              measurements?.[key] ? (
                <div key={key}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {t(`physicalData.${key}`)}
                  </p>
                  <p className="font-black text-on-surface">
                    {measurements[key]} {t('physicalData.cm')}
                  </p>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
