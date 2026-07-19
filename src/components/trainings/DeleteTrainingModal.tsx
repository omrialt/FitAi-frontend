/**
 * DeleteTrainingModal - Confirmation modal for deleting training plan
 */

'use client';

import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { TrainingPlan } from '../../types/training-plan.types';
import type { DeleteTrainingModalProps } from '../../types/trainings-components.types';

export function DeleteTrainingModal({
  opened,
  onClose,
  training,
  onConfirm,
}: DeleteTrainingModalProps) {
  const { t } = useTranslation();

  const handleDelete = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t('trainings.deleteTitle')} size="md">
      <Stack gap="md">
        <Group gap="xs" align="flex-start">
          <IconAlertTriangle size={24} color="var(--mantine-color-red-6)" />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text fw={500}>{t('trainings.deleteConfirm')}</Text>
            <Text size="sm" c="dimmed">
              {t('trainings.planLabel')}: <strong>{training?.title}</strong>
            </Text>
            <Text size="sm" c="red">
              {t('trainings.deleteWarning')}
            </Text>
          </Stack>
        </Group>

        <Group justify="flex-end" gap="xs">
          <Button variant="light" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="red" onClick={handleDelete}>
            {t('trainings.deleteTitle')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
