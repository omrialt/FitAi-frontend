/**
 * PhysicalDataHeader - Header component for Physical Data page
 */

import { Group, Button, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface PhysicalDataHeaderProps {
  onAddMeasurement: () => void;
}

export function PhysicalDataHeader({ onAddMeasurement }: PhysicalDataHeaderProps) {
  return (
    <Group justify="space-between" align="center" mb="lg">
      <Title order={2}>Physical Data</Title>
      <Button 
        leftSection={<IconPlus size={18} />}
        onClick={onAddMeasurement}
      >
        Add Measurement
      </Button>
    </Group>
  );
}
