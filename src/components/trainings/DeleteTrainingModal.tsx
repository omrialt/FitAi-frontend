/**
 * DeleteTrainingModal - Confirmation modal for deleting training
 */

'use client';

import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { Training } from '../../types/training.types';

interface DeleteTrainingModalProps {
  opened: boolean;
  onClose: () => void;
  training: Training | null;
  onConfirm: () => void;
}

export function DeleteTrainingModal({
  opened,
  onClose,
  training,
  onConfirm,
}: DeleteTrainingModalProps) {
  const handleDelete = () => {
    // TODO: Integrate with backend API
    onConfirm();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Training" size="md">
      <Stack gap="md">
        <Group gap="xs" align="flex-start">
          <IconAlertTriangle size={24} color="var(--mantine-color-red-6)" />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text fw={500}>Are you sure you want to delete this training?</Text>
            <Text size="sm" c="dimmed">
              Training: <strong>{training?.name}</strong>
            </Text>
            <Text size="sm" c="red">
              This action cannot be undone. All associated workouts and progress data will be
              permanently deleted.
            </Text>
          </Stack>
        </Group>

        <Group justify="flex-end" gap="xs">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete Training
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
