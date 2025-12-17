/**
 * TrainingsCardList - Mobile card list view
 */

'use client';

import { Stack, Text } from '@mantine/core';
import { TrainingsCard } from './TrainingsCard';
import type { TrainingPlan } from '../../types/training-plan.types';

interface TrainingsCardListProps {
  trainings: TrainingPlan[];
  isCoach?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (training: TrainingPlan) => void;
  onExportExcel: (training: TrainingPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

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
  if (trainings.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No training plans found
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
