import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { BodyProgressCardProps } from '../../types/dashboard-components.types';
import type { CreatePhysicalDataDto, UpdatePhysicalDataDto } from '../../types/physical-data.types';
import { MeasurementModal } from '../profile/physical-data/modals/MeasurementModal';
import { physicalDataService } from '../../services/physical-data.service';

/**
 * Body progress — "Performance Lab" design.
 *
 * The Stitch design shows Muscle Mass and Visceral Fat as the third and fourth
 * tiles. PhysicalData tracks neither, and the only "muscle mass" figure in the
 * codebase is a rough `100 - bodyFat - 15` estimate, so those tiles would be
 * presenting a guess as a measurement. Height and Waist are shown instead —
 * both are recorded values, and they are what this card already displayed.
 * Adding the design's metrics is a schema change, not a styling one.
 */

/** A trend line under a metric: direction arrow + caption. */
function Trend({ value, unit, t }: { value: number | null | undefined; unit: string; t: (k: string, o?: Record<string, unknown>) => string }) {
  if (value == null) return null;

  if (value === 0) {
    return (
      <p className="text-[10px] text-primary font-bold flex items-center gap-0.5 mt-1">
        <StitchIcon name="trending_flat" size={11} />
        {t('dashboard.stable')}
      </p>
    );
  }

  const up = value > 0;
  return (
    <p
      className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
        up ? 'text-success' : 'text-danger'
      }`}
    >
      <StitchIcon name={up ? 'trending_up' : 'trending_down'} size={11} />
      {t('dashboard.kgThisMonth', {
        value: `${up ? '+' : ''}${value.toFixed(1)}${unit}`,
      })}
    </p>
  );
}

/**
 * Weight series as a sparkline.
 *
 * The dashboard already fetched this series on every load and then dropped it —
 * the value was passed down to this card and never read. A sparkline is the
 * smallest honest use for it: the tiles above give the latest number and the
 * 30-day delta, and this gives the shape of the path between them.
 *
 * Plain SVG rather than a chart library: two dozen points, no axes, no
 * interaction. `preserveAspectRatio="none"` lets it stretch to the card width
 * while the stroke stays a constant screen width via `vector-effect`.
 */
function WeightSparkline({
  points,
  label,
}: {
  points: Array<{ date: Date | string; weight: number }>;
  label: string;
}) {
  // Two points are the minimum that describes a direction.
  if (points.length < 2) return null;

  // `/physical-data/user/:id/progress` returns newest-first. Plotting in that
  // order drew time right-to-left, so a steady gain rendered as a decline —
  // sorting here means the chart is correct whatever order the API returns.
  const weights = [...points]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  // A flat series would divide by zero; render it down the middle instead.
  const span = max - min || 1;

  const path = weights
    .map((w, i) => {
      const x = (i / (weights.length - 1)) * 100;
      // SVG y grows downward, so a heavier reading has to sit lower on screen.
      const y = 30 - ((w - min) / span) * 28 - 1;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className="w-full h-10 mt-4 text-tertiary"
      role="img"
      aria-label={label}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** One metric tile in the 2x2 grid. */
function Tile({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-transparent hover:border-tertiary/20 transition-all">
      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="text-xl font-black text-on-surface">{value}</p>
      {children}
    </div>
  );
}

export function BodyProgressCard({
  latestPhysicalData,
  weightProgress,
  progressStats,
  onDataUpdate,
}: BodyProgressCardProps) {
  const { t, i18n } = useTranslation();
  const [modalOpened, setModalOpened] = useState(false);

  const hasData = latestPhysicalData != null;

  const handleSave = async (data: CreatePhysicalDataDto) => {
    await physicalDataService.create(data);
    onDataUpdate?.();
  };

  const handleUpdate = async (id: string, data: UpdatePhysicalDataDto) => {
    await physicalDataService.update(id, data);
    onDataUpdate?.();
  };

  const dash = t('common.none');

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
              <StitchIcon name="scale" size={18} />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
              {t('dashboard.bodyProgress')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setModalOpened(true)}
            className="text-xs font-bold text-primary hover:underline shrink-0"
          >
            {hasData ? t('dashboard.updateRecord') : t('dashboard.addRecord')}
          </button>
        </div>

        {!hasData ? (
          <p className="text-sm text-on-surface-variant">
            {t('dashboard.noPhysicalData')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Tile
                label={t('dashboard.weight')}
                value={`${latestPhysicalData.weightKg} ${t('common.kg')}`}
              >
                <Trend
                  value={progressStats?.last30Days?.weightDiff}
                  unit={t('common.kg')}
                  t={t}
                />
              </Tile>

              <Tile
                label={t('dashboard.bodyFatPct')}
                value={
                  latestPhysicalData.bodyFatPercent != null
                    ? `${latestPhysicalData.bodyFatPercent} %`
                    : dash
                }
              >
                <Trend
                  value={progressStats?.last30Days?.fatDiff}
                  unit="%"
                  t={t}
                />
              </Tile>

              <Tile
                label={t('dashboard.height')}
                value={
                  latestPhysicalData.heightCm != null
                    ? `${latestPhysicalData.heightCm} ${t('physicalData.cm')}`
                    : dash
                }
              />

              <Tile
                label={t('dashboard.waist')}
                value={
                  latestPhysicalData.measurements?.waist != null
                    ? `${latestPhysicalData.measurements.waist} ${t('physicalData.cm')}`
                    : dash
                }
              />
            </div>

            <WeightSparkline
              points={weightProgress?.data ?? []}
              label={t('dashboard.weightTrendChart')}
            />

            <p className="text-[10px] text-on-surface-variant/70 mt-4">
              {t('dashboard.lastRecorded')}{' '}
              {new Date(latestPhysicalData.dateRecorded).toLocaleDateString(
                i18n.language,
                { day: '2-digit', month: '2-digit', year: 'numeric' },
              )}
            </p>
          </>
        )}
      </div>

      <MeasurementModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        measurement={hasData ? latestPhysicalData : null}
        lastRecord={latestPhysicalData}
        onSave={handleSave}
        onUpdate={handleUpdate}
      />
    </>
  );
}
