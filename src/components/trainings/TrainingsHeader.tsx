/**
 * TrainingsHeader - Page header with title and action buttons
 */

import { Group, Title, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface TrainingsHeaderProps {
  onCreateNew?: () => void;
}

export function TrainingsHeader({ onCreateNew }: TrainingsHeaderProps) {
  return (
    <Group justify="space-between" mb="lg">
      <Title order={1}>My Trainings</Title>
      {onCreateNew && (
        <Button leftSection={<IconPlus size={16} />} onClick={onCreateNew}>
          Create Training
        </Button>
      )}
    </Group>
  );
}
