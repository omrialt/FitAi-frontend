/**
 * TrainingsTable - Desktop table view for trainings
 */

'use client';

import { Table, Badge, Text } from '@mantine/core';
import { TrainingsActionsMenu } from './TrainingsActionsMenu';
import type { TrainingPlan } from '../../types/training.types';

interface TrainingsTableProps {
  trainings: TrainingPlan[];
  isCoach?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExportPDF: (training: TrainingPlan) => void;
  onExportExcel: (training: TrainingPlan) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  onMakePublic?: (id: string) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'teal';
    case 'intermediate':
      return 'yellow';
    case 'advanced':
      return 'red';
    default:
      return 'gray';
  }
};

export function TrainingsTable({
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
}: TrainingsTableProps) {
  if (trainings.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No trainings found
      </Text>
    );
  }

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Difficulty</Table.Th>
            <Table.Th>Days</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Focus</Table.Th>
            <Table.Th>Created At</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {trainings.map((training) => (
            <Table.Tr key={training._id}>
              <Table.Td>
                <Text fw={500}>{training.title}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={getDifficultyColor(training.difficulty)} variant="light">
                  {training.difficulty}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text>{training.days?.length || 0}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={training.isActive ? 'green' : 'gray'} variant="light">
                  {training.isActive ? 'active' : 'inactive'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text tt="capitalize">{training.focus || '-'}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {training.createdAt ? new Date(training.createdAt).toLocaleDateString('en-GB') : '-'}
                </Text>
              </Table.Td>
              <Table.Td>
                <TrainingsActionsMenu
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
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
