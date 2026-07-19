/**
 * TrainingsHeader - Page header with title and action buttons
 */

import { Group, Title, Button, Stack, Text } from '@mantine/core';
import { IconPlus, IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import type { TrainingsHeaderProps } from '../../types/trainings-components.types';

export function TrainingsHeader({ onCreateNew }: TrainingsHeaderProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  return (
    <Group justify="space-between" mb="lg" align="flex-end">
      <Stack gap={4}>
        <Title order={1}>{isAdmin ? t('trainings.titleAdmin') : t('trainings.title')}</Title>
        <Text c="dimmed" size="sm">
          {t('trainings.subtitle')}
        </Text>
      </Stack>
      <Group gap="sm">
        <Button variant="outline" leftSection={<IconDownload size={16} />} color="gray">
          {t('trainings.export')}
        </Button>
        {onCreateNew && (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreateNew} color="indigo">
            {t('trainings.newPlan')}
          </Button>
        )}
      </Group>
    </Group>
  );
}
