/**
 * NutritionsHeader - Page header with title and action buttons
 */

import { Group, Title, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

interface NutritionsHeaderProps {
  onCreateNew?: () => void;
}

export function NutritionsHeader({ onCreateNew }: NutritionsHeaderProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Group justify="space-between" mb="lg">
      <Title order={1}>{isAdmin ? 'Nutrition Plans' : 'My Nutrition Plans'}</Title>
      {onCreateNew && (
        <Button leftSection={<IconPlus size={16} />} onClick={onCreateNew}>
          Create Nutrition Plan
        </Button>
      )}
    </Group>
  );
}
