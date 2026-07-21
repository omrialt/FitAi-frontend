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
            className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <StitchIcon name="rebase" size={18} />
          </button>
          <button
            type="button"
            title={t('physicalData.exportData')}
            aria-label={t('physicalData.exportData')}
            className="w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            <StitchIcon name="report" size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
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
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-green-100 text-green-700">
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
