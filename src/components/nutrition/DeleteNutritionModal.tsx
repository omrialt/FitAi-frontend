/**
 * DeleteNutritionModal - Confirmation modal for deleting nutrition plan
 */

"use client";

import { Modal, Text, Group, Button, Stack } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { NutritionPlan } from "../../types/nutrition.types";
import type { DeleteNutritionModalProps } from '../../types/nutrition-components.types';

export function DeleteNutritionModal({
  opened,
  onClose,
  nutritionPlan,
  onConfirm,
}: DeleteNutritionModalProps) {
  if (!nutritionPlan) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Nutrition Plan"
      centered
      size="md"
    >
      <Stack gap="md">
        <Group>
          <IconAlertTriangle size={24} style={{ color: "#fa5252" }} />
          <Text size="sm">
            Are you sure you want to delete this nutrition plan?
          </Text>
        </Group>

        <Text size="sm" fw={500}>
          {nutritionPlan.title}
        </Text>

        <Text size="sm" c="dimmed">
          This action cannot be undone. The nutrition plan will be permanently
          deleted.
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
