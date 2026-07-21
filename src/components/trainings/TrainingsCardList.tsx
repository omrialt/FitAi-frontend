/**
 * TrainingsCardList - Mobile card list view
 */

'use client';

import { useTranslation } from 'react-i18next';
import { TrainingsCard } from './TrainingsCard';

import type { TrainingsCardListProps } from '../../types/trainings-components.types';

export function TrainingsCardList({
  trainings,
  isCoach = false,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: TrainingsCardListProps) {
  const { t } = useTranslation();

  if (trainings.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10">
        <p className="text-on-surface-variant">{t('trainings.noTrainings')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {trainings.map((training) => (
        <TrainingsCard
          key={training._id}
          training={training}
          isCoach={isCoach}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onView={onView}
          onEdit={onEdit}
          onExportPDF={onExportPDF}
          onExportExcel={onExportExcel}
          onDelete={onDelete}
          onActivate={onActivate}
        />
      ))}
    </div>
  );
}
