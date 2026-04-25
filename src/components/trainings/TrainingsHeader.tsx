/**
 * TrainingsHeader - Page header with title and action buttons
 */

import { Group, Title, Button, Stack, Text } from '@mantine/core';
import { IconPlus, IconDownload } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import type { TrainingsHeaderProps } from '../../types/trainings-components.types';

export function TrainingsHeader({ onCreateNew }: TrainingsHeaderProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Group justify="space-between" mb="lg" align="flex-end">
      <Stack gap={4}>
        <Title order={1}>{isAdmin ? 'Training Plans' : 'My Training Plans'}</Title>
        <Text c="dimmed" size="sm">
          Manage your elite performance programs. Customize intensities, track volume metrics, and export data for your performance review.
        </Text>
      </Stack>
      <Group gap="sm">
        <Button variant="outline" leftSection={<IconDownload size={16} />} color="gray">
          Export
        </Button>
        {onCreateNew && (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreateNew} color="indigo">
            New Plan
          </Button>
        )}
      </Group>
    </Group>
  );
}
