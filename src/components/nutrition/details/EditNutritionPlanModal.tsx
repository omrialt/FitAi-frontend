/**
 * EditNutritionPlanModal - Modal for editing nutrition plan details
 */

import { Modal, Button, Stack, Group, TextInput, Textarea, NumberInput, Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Target } from '../../../types/nutrition.types';
import type { EditNutritionPlanModalProps } from '../../../types/nutrition-components.types';

export function EditNutritionPlanModal({
  opened,
  onClose,
  plan,
  onSave,
}: EditNutritionPlanModalProps) {
  const { t } = useTranslation();
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
      title={t('nutrition.editPlanTitle')}
      size="900"
    >
      <Stack gap="md">
        <TextInput
          label={t('nutrition.planTitle')}
          placeholder={t('nutrition.planTitlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        <Textarea
          label={t('nutrition.description')}
          placeholder={t('nutrition.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
          required
        />

        <NumberInput
          label={t('nutrition.totalCalories')}
          placeholder={t('nutrition.totalCaloriesPlaceholder')}
          value={totalCalories}
          onChange={(value) => setTotalCalories(Number(value) || 0)}
          min={0}
          required
        />

        <Select
          label={t('nutrition.targetGoal')}
          placeholder={t('nutrition.targetGoalPlaceholder')}
          data={[
            { value: 'maintain', label: t('nutrition.maintain') },
            { value: 'cut', label: t('nutrition.cut') },
            { value: 'bulk', label: t('nutrition.bulk') },
          ]}
          value={target}
          onChange={(value) => setTarget(value as Target)}
          clearable
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {t('common.saveChanges')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
