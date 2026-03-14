/**
 * TrainingsHeader - Page header with title and action buttons
 */

import { Activity } from 'react';

import { Group, Title, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import type { TrainingsHeaderProps } from '../../types/trainings-components.types';

export function TrainingsHeader({ onCreateNew }: TrainingsHeaderProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Group justify="space-between" mb="lg">
      <Title order={1}>{isAdmin ? 'Training Plans' : 'My Trainings'}</Title>
      <Activity mode={onCreateNew ? "visible" : "hidden"}>
        <Button leftSection={<IconPlus size={16} />} onClick={onCreateNew}>
          Create Training
        </Button>
      </Activity>
    </Group>
  );
}
