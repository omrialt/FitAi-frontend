/**
 * TrainingsTable - Desktop table view for trainings
 */

'use client';

import { Table, Badge, Text } from '@mantine/core';
import { TrainingsActionsMenu } from './TrainingsActionsMenu';
import type { Training } from '../../types/training.types';

interface TrainingsTableProps {
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'green';
    case 'inactive':
      return 'gray';
    case 'archived':
      return 'red';
    default:
      return 'blue';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'teal';
    case 'medium':
      return 'yellow';
    case 'hard':
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
            <Table.Th>Program Name</Table.Th>
            <Table.Th>Training Type</Table.Th>
            <Table.Th>Workouts/Week</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Creator</Table.Th>
            <Table.Th>Difficulty</Table.Th>
            <Table.Th>Created At</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {trainings.map((training) => (
            <Table.Tr key={training.id}>
              <Table.Td>
                <Text fw={500}>{training.name}</Text>
              </Table.Td>
              <Table.Td>
                <Text tt="capitalize">{training.trainingType}</Text>
              </Table.Td>
              <Table.Td>
                <Text>{training.workoutsPerWeek}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(training.status)} variant="light">
                  {training.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text tt="capitalize">{training.creator}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={getDifficultyColor(training.difficulty)} variant="light">
                  {training.difficulty}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {new Date(training.createdAt).toLocaleDateString()}
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
