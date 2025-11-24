/**
 * DuplicateTrainingModal - Modal for duplicating training
 */

'use client';

import { Modal, TextInput, Button, Stack, Group, Text } from '@mantine/core';
import { useState } from 'react';
import type { Training } from '../../types/training.types';

interface DuplicateTrainingModalProps {
  opened: boolean;
  onClose: () => void;
  training: Training | null;
  onDuplicate: (name: string) => void;
}

export function DuplicateTrainingModal({
  opened,
  onClose,
  training,
  onDuplicate,
}: DuplicateTrainingModalProps) {
  const [name, setName] = useState(training ? `${training.name} (Copy)` : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length === 0) {
      setError('Name is required');
      return;
    }

    // TODO: Integrate with backend API
    onDuplicate(name);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Duplicate Training" size="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Create a copy of "{training?.name}". All settings and workouts will be duplicated.
          </Text>

          <TextInput
            label="New Training Name"
            placeholder="Enter name for duplicated training"
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            error={error}
          />

          <Group justify="flex-end" gap="xs">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Duplicate</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
