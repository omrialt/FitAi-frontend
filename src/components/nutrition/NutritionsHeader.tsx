/**
 * NutritionsHeader - Page header with title and action buttons
 */

import { Group, Title, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import type { NutritionsHeaderProps } from '../../types/nutrition-components.types';

export function NutritionsHeader({ onCreateNew }: NutritionsHeaderProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Group justify="space-between" mb="lg">
      <Title order={2} fw={700} style={{ letterSpacing: '-0.5px', fontSize: '1.75rem' }}>
        {isAdmin ? 'Nutrition Plans' : 'My Nutrition Plans'}
      </Title>
      {onCreateNew && (
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreateNew}
          variant="gradient"
          gradient={{ from: 'indigo', to: 'violet' }}
          radius="md"
          style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}
        >
          New Plan
        </Button>
      )}
    </Group>
  );
}
