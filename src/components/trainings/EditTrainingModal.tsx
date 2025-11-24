/**
 * EditTrainingModal - Modal for editing training
 */

'use client';

import { Modal, TextInput, Select, NumberInput, Textarea, Button, Stack, Group } from '@mantine/core';
import { useState, useEffect } from 'react';
import type { Training, TrainingType, TrainingStatus, TrainingDifficulty } from '../../types/training.types';

interface EditTrainingModalProps {
  opened: boolean;
  onClose: () => void;
  training: Training | null;
  onSave: (data: Partial<Training>) => void;
}

export function EditTrainingModal({
  opened,
  onClose,
  training,
  onSave,
}: EditTrainingModalProps) {
  const [formData, setFormData] = useState({
    name: training?.name || '',
    trainingType: training?.trainingType || 'strength',
    workoutsPerWeek: training?.workoutsPerWeek || 3,
    status: training?.status || 'active',
    difficulty: training?.difficulty || 'medium',
    description: training?.description || '',
    duration: training?.duration || 8,
  });

  useEffect(() => {
    if (training) {
      setFormData({
        name: training.name,
        trainingType: training.trainingType,
        workoutsPerWeek: training.workoutsPerWeek,
        status: training.status,
        difficulty: training.difficulty,
        description: training.description || '',
        duration: training.duration || 8,
      });
    }
  }, [training]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    onSave(formData);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Training" size="lg">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Program Name"
            placeholder="Enter training name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
          />

          <Select
            label="Training Type"
            data={[
              { value: 'strength', label: 'Strength' },
              { value: 'cardio', label: 'Cardio' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'flexibility', label: 'Flexibility' },
              { value: 'sports', label: 'Sports' },
            ]}
            value={formData.trainingType}
            onChange={(value) => value && setFormData({ ...formData, trainingType: value as TrainingType })}
          />

          <NumberInput
            label="Workouts per Week"
            min={1}
            max={7}
            value={formData.workoutsPerWeek}
            onChange={(value) => typeof value === 'number' && setFormData({ ...formData, workoutsPerWeek: value })}
          />

          <NumberInput
            label="Duration (weeks)"
            min={1}
            max={52}
            value={formData.duration}
            onChange={(value) => typeof value === 'number' && setFormData({ ...formData, duration: value })}
          />

          <Select
            label="Status"
            data={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'archived', label: 'Archived' },
            ]}
            value={formData.status}
            onChange={(value) => value && setFormData({ ...formData, status: value as TrainingStatus })}
          />

          <Select
            label="Difficulty"
            data={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
            value={formData.difficulty}
            onChange={(value) => value && setFormData({ ...formData, difficulty: value as TrainingDifficulty })}
          />

          <Textarea
            label="Description"
            placeholder="Enter training description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
          />

          <Group justify="flex-end" gap="xs">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
