/**
 * TrainingsCard - Mobile card view for a single training
 */

'use client';

import { Card, Text, Badge, Group, Stack, Button } from '@mantine/core';
import {
  IconEye,
  IconEdit,
  IconCopy,
} from '@tabler/icons-react';
import { TrainingsActionsMenu } from './TrainingsActionsMenu';
import type { Training } from '../../types/training.types';

interface TrainingsCardProps {
  training: Training;
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

export function TrainingsCard({
  training,
  isCoach = false,
  onView,
  onEdit,
  onDuplicate,
  onExportPDF,
  onExportExcel,
  onDelete,
  onShare,
  onMakePublic,
}: TrainingsCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {training.name}
          </Text>
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
        </Group>

        {/* Info Grid */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Type:
            </Text>
            <Text size="sm" tt="capitalize">
              {training.trainingType}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Workouts/Week:
            </Text>
            <Text size="sm">{training.workoutsPerWeek}</Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Creator:
            </Text>
            <Text size="sm" tt="capitalize">
              {training.creator}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Created:
            </Text>
            <Text size="sm">{new Date(training.createdAt).toLocaleDateString()}</Text>
          </Group>
        </Stack>

        {/* Badges */}
        <Group gap="xs">
          <Badge color={getStatusColor(training.status)} variant="light">
            {training.status}
          </Badge>
          <Badge color={getDifficultyColor(training.difficulty)} variant="light">
            {training.difficulty}
          </Badge>
        </Group>

        {/* Quick Actions */}
        <Group gap="xs">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconEye size={14} />}
            onClick={() => onView(training.id)}
            flex={1}
          >
            View
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconEdit size={14} />}
            onClick={() => onEdit(training.id)}
            flex={1}
          >
            Edit
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconCopy size={14} />}
            onClick={() => onDuplicate(training.id)}
            flex={1}
          >
            Duplicate
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
