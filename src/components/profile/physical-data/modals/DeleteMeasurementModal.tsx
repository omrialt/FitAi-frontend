/**
 * DeleteMeasurementModal - Confirmation modal for deleting physical data measurement
 */

import { Modal, Text, Group, Button, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { PhysicalData } from '../../../../types/physical-data.types';
import { formatDate } from '../helpers/calcImprovement';

interface DeleteMeasurementModalProps {
  opened: boolean;
  onClose: () => void;
  measurement: PhysicalData | null;
  onConfirm: () => Promise<void>;
}

export function DeleteMeasurementModal({
  opened,
  onClose,
  measurement,
  onConfirm,
}: DeleteMeasurementModalProps) {
  if (!measurement) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Measurement"
      centered
      size="md"
    >
      <Stack gap="md">
        <Group>
          <IconAlertTriangle size={24} style={{ color: '#fa5252' }} />
          <Text size="sm">
            Are you sure you want to delete this measurement?
          </Text>
        </Group>

        <Text size="sm" fw={500}>
          Record from {formatDate(measurement.dateRecorded)}
        </Text>

        <Text size="sm" c="dimmed">
          Weight: {measurement.weightKg} kg | Height: {measurement.heightCm} cm
          {measurement.bodyFatPercent && ` | Body Fat: ${measurement.bodyFatPercent}%`}
        </Text>

        <Text size="sm" c="dimmed">
          This action cannot be undone. The measurement record will be permanently deleted.
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
