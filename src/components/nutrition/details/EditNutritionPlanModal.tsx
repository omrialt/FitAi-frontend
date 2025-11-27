/**
 * EditNutritionPlanModal - Modal for editing nutrition plan details
 */

import { Modal, Button, Stack, Group, TextInput, Textarea, NumberInput, Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import type { NutritionPlan, Target } from '../../../types/nutrition.types';

interface EditNutritionPlanModalProps {
  opened: boolean;
  onClose: () => void;
  plan: NutritionPlan;
  onSave: (data: Partial<NutritionPlan>) => Promise<void>;
}

export function EditNutritionPlanModal({
  opened,
  onClose,
  plan,
  onSave,
}: EditNutritionPlanModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalCalories, setTotalCalories] = useState(0);
  const [target, setTarget] = useState<Target | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (opened && plan) {
      setTitle(plan.title);
      setDescription(plan.description);
      setTotalCalories(plan.totalCalories);
      setTarget(plan.target);
    }
  }, [opened, plan]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        title,
        description,
        totalCalories,
        target,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Nutrition Plan"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Enter plan title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter plan description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
          required
        />

        <NumberInput
          label="Total Calories"
          placeholder="Enter total calories"
          value={totalCalories}
          onChange={(value) => setTotalCalories(Number(value) || 0)}
          min={0}
          required
        />

        <Select
          label="Target Goal"
          placeholder="Select target goal"
          data={[
            { value: 'maintain', label: 'Maintain' },
            { value: 'cut', label: 'Cut' },
            { value: 'bulk', label: 'Bulk' },
          ]}
          value={target}
          onChange={(value) => setTarget(value as Target)}
          clearable
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
