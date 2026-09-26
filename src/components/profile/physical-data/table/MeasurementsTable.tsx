/**
 * MeasurementsTable — full history of physical-data records.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';

import { formatDate, calcImprovement } from '../helpers/calcImprovement';
import { StitchIcon } from '../../../common/StitchIcon';
import { TableImprovementCell } from './TableImprovementCell';
import type { MeasurementsTableProps } from '../../../../types/physical-data-components.types';

const TH =
  'text-start text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-5 py-4 whitespace-nowrap';

export function MeasurementsTable({ data, onEdit, onDelete }: MeasurementsTableProps) {
  const { t } = useTranslation();

  // Newest first
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime(),
  );

  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10">
        <p className="text-on-surface-variant">
          {t('physicalData.noMeasurementsYet')}
        </p>
      </div>
    );
  }

  const dash = '—';

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
      <div className="flex items-center justify-between gap-4 p-6 flex-wrap">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
            {t('physicalData.measurementHistory')}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {t('physicalData.measurementHistorySubtitle')}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            title={t('physicalData.filter')}
            aria-label={t('physicalData.filter')}
            className="w-11 h-11 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <StitchIcon name="rebase" size={18} />
          </button>
          <button
            type="button"
            title={t('physicalData.exportData')}
            aria-label={t('physicalData.exportData')}
            className="w-11 h-11 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            <StitchIcon name="report" size={18} />
          </button>
        </div>
      </div>

      {/* Phones: one card per record. The 10-column table needs ~900px, which
          on a 390px screen meant scrolling sideways past 8 columns to reach
          the edit/delete buttons. */}
      <ul className="only-mobile list-none m-0 px-4 pb-4 space-y-3">
        {sortedData.map((record, index) => {
          const previousRecord =
            index < sortedData.length - 1 ? sortedData[index + 1] : null;
          const weightImprovement = calcImprovement(record.weightKg, previousRecord?.weightKg, true);
          const bodyFatImprovement = calcImprovement(record.bodyFatPercent, previousRecord?.bodyFatPercent, true);
          const girths = (
            [
              ['chestCm', record.measurements?.chest],
              ['waistCm', record.measurements?.waist],
              ['hipsCm', record.measurements?.hips],
              ['armsCm', record.measurements?.arms],
              ['legsCm', record.measurements?.legs],
            ] as const
          ).filter(([, v]) => !!v);

          return (
            <li
              key={record._id}
              className="rounded-xl bg-surface-container-low border border-outline-variant/40 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-on-surface">
                  {formatDate(record.dateRecorded)}
                </span>
                <div className="flex items-center -me-2">
                  <button
                    type="button"
                    onClick={() => onEdit(record)}
                    aria-label={t('common.edit')}
                    className="w-11 h-11 rounded-lg text-primary hover:bg-primary/10 flex items-center justify-center"
                  >
                    <StitchIcon name="edit" size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(record)}
                    aria-label={t('common.delete')}
                    className="w-11 h-11 rounded-lg text-error hover:bg-error-container flex items-center justify-center"
                  >
                    <StitchIcon name="delete" size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-on-surface-variant">{t('physicalData.weightKgHeader')}</p>
                  <p className="stat-number text-3xl text-on-surface">{record.weightKg}</p>
                  <TableImprovementCell value={weightImprovement} />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">{t('physicalData.bodyFatPct')}</p>
                  <p className="stat-number text-3xl text-on-surface">
                    {record.bodyFatPercent ? `${record.bodyFatPercent}%` : dash}
                  </p>
                  {record.bodyFatPercent && <TableImprovementCell value={bodyFatImprovement} />}
                </div>
              </div>

              {girths.length > 0 && (
                <dl className="mt-3 pt-3 border-t border-outline-variant/40 grid grid-cols-3 gap-x-3 gap-y-2 m-0">
                  {girths.map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-[11px] text-on-surface-variant">{t(`physicalData.${key}`)}</dt>
                      <dd className="m-0 text-sm font-semibold text-on-surface tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          );
        })}
      </ul>

      <div className="only-desktop overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              <th className={TH}>{t('common.date')}</th>
              <th className={TH}>{t('physicalData.weightKgHeader')}</th>
              <th className={TH}>{t('physicalData.bodyFatPct')}</th>
              <th className={TH}>{t('physicalData.chestCm')}</th>
              <th className={TH}>{t('physicalData.waistCm')}</th>
              <th className={TH}>{t('physicalData.hipsCm')}</th>
              <th className={TH}>{t('physicalData.armsCm')}</th>
              <th className={TH}>{t('physicalData.legsCm')}</th>
              <th className={TH}>{t('physicalData.improvement')}</th>
              <th className={TH}>{t('trainings.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((record, index) => {
              const previousRecord =
                index < sortedData.length - 1 ? sortedData[index + 1] : null;
              const weightImprovement = calcImprovement(
                record.weightKg,
                previousRecord?.weightKg,
                true,
              );
              const bodyFatImprovement = calcImprovement(
                record.bodyFatPercent,
                previousRecord?.bodyFatPercent,
                true,
              );

              return (
                <tr
                  key={record._id}
                  className="hover:bg-surface-container-low/60 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-on-surface whitespace-nowrap">
                      {formatDate(record.dateRecorded)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">
                    {record.weightKg}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">
                    {record.bodyFatPercent ? `${record.bodyFatPercent}%` : dash}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">
                    {record.measurements?.chest || dash}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">
                    {record.measurements?.waist || dash}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">
                    {record.measurements?.hips || dash}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">
                    {record.measurements?.arms || dash}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface">
                    {record.measurements?.legs || dash}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {t('physicalData.weightBadge')}
                        </span>
                        <TableImprovementCell value={weightImprovement} />
                      </div>
                      {record.bodyFatPercent && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-success-container text-on-success-container">
                            {t('physicalData.bodyFatBadge')}
                          </span>
                          <TableImprovementCell value={bodyFatImprovement} />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        title={t('common.edit')}
                        aria-label={t('common.edit')}
                        className="w-9 h-9 rounded-lg text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                      >
                        <StitchIcon name="edit" size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record)}
                        title={t('common.delete')}
                        aria-label={t('common.delete')}
                        className="w-9 h-9 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors"
                      >
                        <StitchIcon name="delete" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
