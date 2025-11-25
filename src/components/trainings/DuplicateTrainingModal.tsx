/**
 * DuplicateTrainingModal - Modal for duplicating training plan
 */

'use client';

import { Modal, TextInput, Button, Stack, Group, Text } from '@mantine/core';
import { useState } from 'react';
import type { TrainingPlan } from '../../types/training-plan.types';

interface DuplicateTrainingModalProps {
  opened: boolean;
  onClose: () => void;
  training: TrainingPlan | null;
  onDuplicate: (title: string) => void;
}

export function DuplicateTrainingModal({
  opened,
  onClose,
  training,
  onDuplicate,
}: DuplicateTrainingModalProps) {
  const [title, setTitle] = useState(training ? `${training.title} (Copy)` : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim().length === 0) {
      setError('Title is required');
      return;
    }

    onDuplicate(title);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Duplicate Training Plan" size="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Create a copy of "{training?.title}". All settings and workouts will be duplicated.
          </Text>

          <TextInput
            label="New Training Plan Title"
            placeholder="Enter title for duplicated training plan"
            required
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
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
