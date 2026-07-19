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
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const difficulty = (training.difficulty || 'beginner').toLowerCase();
  const difficultyLabel = ['beginner', 'intermediate', 'advanced', 'elite'].includes(difficulty)
    ? t(`trainings.${difficulty}`)
    : training.difficulty;

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
              {t('trainings.difficulty')}:
            </Text>
            <Badge color={getDifficultyColor(training.difficulty || 'beginner')} variant="light">
              {difficultyLabel}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('trainings.days')}:
            </Text>
            <Text size="sm">{training.days?.length || 0}</Text>
          </Group>

          <Activity mode={training.focus ? "visible" : "hidden"}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('trainings.focus')}:
              </Text>
              <Text size="sm">{training.focus}</Text>
            </Group>
          </Activity>

          <Activity mode={training.estimatedDuration ? "visible" : "hidden"}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('trainings.duration')}:
              </Text>
              <Text size="sm">{t('trainings.durationMin', { count: training.estimatedDuration })}</Text>
            </Group>
          </Activity>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('trainings.status')}:
            </Text>
            <Badge color={training.isActive ? 'green' : 'gray'} variant="light">
              {training.isActive ? t('trainings.active') : t('trainings.inactive')}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('trainings.created')}:
            </Text>
            <Text size="sm">
              {training.createdAt
                ? new Date(training.createdAt).toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-GB')
                : '-'}
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
            {t('common.view')}
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconEdit size={14} />}
            onClick={() => onEdit(training._id)}
            flex={1}
          >
            {t('common.edit')}
          </Button>
       
        </Group>
      </Stack>
    </Card>
  );
}
