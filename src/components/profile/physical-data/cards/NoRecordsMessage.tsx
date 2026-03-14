/**
 * NoRecordsMessage - Message displayed when no physical data records exist
 */

import { Paper, Stack, Text, Button } from '@mantine/core';
import { IconRuler } from '@tabler/icons-react';
import type { NoRecordsMessageProps } from '../../../../types/physical-data-components.types';

export function NoRecordsMessage({ onAddMeasurement }: NoRecordsMessageProps) {
  return (
    <Paper p="xl" withBorder>
      <Stack align="center" gap="lg">
        <IconRuler size={64} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
        <Stack align="center" gap="xs">
          <Text size="lg" fw={500}>
            No physical data records found
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Add your first measurement to start tracking your fitness progress
          </Text>
        </Stack>
        <Button onClick={onAddMeasurement}>
          Add Measurement
        </Button>
      </Stack>
    </Paper>
  );
}
