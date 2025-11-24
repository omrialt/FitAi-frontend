/**
 * TrainingsCardList - Mobile card list view
 */

'use client';

import { Stack, Text } from '@mantine/core';
import { TrainingsCard } from './TrainingsCard';
import type { Training } from '../../types/training.types';

interface TrainingsCardListProps {
  trainings: Training[];
  isCoach?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExportPDF: (training: Training) => void;
  onExportExcel: (training: Training) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  onMakePublic?: (id: string) => void;
}

export function TrainingsCardList({
  trainings,
  isCoach = false,
  onView,
  onEdit,
  onDuplicate,
  onExportPDF,
  onExportExcel,
  onDelete,
  onShare,
  onMakePublic,
}: TrainingsCardListProps) {
  if (trainings.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No trainings found
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {trainings.map((training) => (
        <TrainingsCard
          key={training.id}
          training={training}
          isCoach={isCoach}
          onView={onView}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onExportPDF={onExportPDF}
          onExportExcel={onExportExcel}
          onDelete={onDelete}
          onShare={onShare}
          onMakePublic={onMakePublic}
        />
      ))}
    </Stack>
  );
}
