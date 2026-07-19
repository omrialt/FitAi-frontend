/**
 * TrainingsCardList - Mobile card list view
 */

'use client';

import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TrainingsCard } from './TrainingsCard';
import type { TrainingPlan } from '../../types/training-plan.types';
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
      <Text c="dimmed" ta="center" py="xl">
        {t('trainings.noTrainings')}
      </Text>
    );
  }

  return (
    <Stack gap="md">
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
    </Stack>
  );
}
