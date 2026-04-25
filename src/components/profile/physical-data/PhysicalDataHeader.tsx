/**
 * PhysicalDataHeader - Header component for Physical Data page
 */

import { Group, Button, Title, Text, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { PhysicalDataHeaderProps } from '../../../types/physical-data-components.types';

export function PhysicalDataHeader({ onAddMeasurement }: PhysicalDataHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" mb="lg">
      <Stack gap={2}>
        <Title order={2}>Physical Data</Title>
        <Text size="sm" c="dimmed">Track your body measurements and progress over time</Text>
      </Stack>
      <Button 
        leftSection={<IconPlus size={18} />}
        onClick={onAddMeasurement}
        color="indigo"
      >
        Add Measurement
      </Button>
    </Group>
  );
}
