/**
 * TrainingsCard - Mobile card view for a single training plan
 */

'use client';

import { Activity } from 'react';

import { Card, Text, Badge, Group, Stack, Button } from '@mantine/core';
import {
  IconEye,
  IconEdit,
} from '@tabler/icons-react';
import { TrainingsActionsMenu } from './TrainingsActionsMenu';
import type { TrainingPlan } from '../../types/training-plan.types';
import type { TrainingsCardProps } from '../../types/trainings-components.types';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
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

export function TrainingsCard({
  training,
  isCoach = false,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: TrainingsCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {training.title}
          </Text>
          <TrainingsActionsMenu
            training={training}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            onView={onView}
            onEdit={onEdit}
            onExportPDF={onExportPDF}
            onExportExcel={onExportExcel}
            onDelete={onDelete}
            onActivate={onActivate}
          />
        </Group>

        {/* Info Grid */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Difficulty:
            </Text>
            <Badge color={getDifficultyColor(training.difficulty || 'beginner')} variant="light">
              {training.difficulty || 'beginner'}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Days:
            </Text>
            <Text size="sm">{training.days?.length || 0}</Text>
          </Group>

          <Activity mode={training.focus ? "visible" : "hidden"}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Focus:
              </Text>
              <Text size="sm">{training.focus}</Text>
            </Group>
          </Activity>

          <Activity mode={training.estimatedDuration ? "visible" : "hidden"}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Duration:
              </Text>
              <Text size="sm">{training.estimatedDuration} min</Text>
            </Group>
          </Activity>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Status:
            </Text>
            <Badge color={training.isActive ? 'green' : 'gray'} variant="light">
              {training.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Created:
            </Text>
            <Text size="sm">
              {training.createdAt ? new Date(training.createdAt).toLocaleDateString('en-GB') : '-'}
            </Text>
          </Group>
        </Stack>

        {/* Quick Actions */}
        <Group gap="xs">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconEye size={14} />}
            onClick={() => onView(training._id)}
            flex={1}
          >
            View
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconEdit size={14} />}
            onClick={() => onEdit(training._id)}
            flex={1}
          >
            Edit
          </Button>
       
        </Group>
      </Stack>
    </Card>
  );
}
