/**
 * SharedAccessSection - Reusable component for sharing plans with users
 */

import { MultiSelect, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import type { SharedAccessSectionProps, SharedObjectType as ObjectType } from '../../types/common.types';

const getShareDescription = (
  objectType: ObjectType,
  t: TFunction
): { title: string; description: string } => {
  switch (objectType) {
    case "trainingPlan":
      return {
        title: t("common.shareTrainingPlan"),
        description: t("common.shareTrainingPlanDescription"),
      };
    case "nutritionPlan":
      return {
        title: t("common.shareNutritionPlan"),
        description: t("common.shareNutritionPlanDescription"),
      };
    default:
      return {
        title: t("common.sharePlan"),
        description: t("common.sharePlanDescription"),
      };
  }
};

export function SharedAccessSection({
  allUsers,
  sharedAccess,
  handleViewAccessChange,
  objectType,
}: SharedAccessSectionProps) {
  const { t } = useTranslation();
  const sharedWithUsers = sharedAccess.map((sa: { userId: string | any }) => {
    // Handle both string IDs and populated User objects
    return typeof sa.userId === 'string' ? sa.userId : sa.userId?._id || sa.userId;
  });
  const allUsersData = useMemo(
    () => allUsers.map((user) => ({ value: user._id, label: user.fullName })),
    [allUsers]
  );

  const { title, description } = getShareDescription(objectType, t);

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">
        {title}
      </Text>
      <MultiSelect
        label={t("common.shareWith")}
        placeholder={t("common.shareWithPlaceholder")}
        description={description}
        data={allUsersData}
        value={sharedWithUsers}
        onChange={handleViewAccessChange}
        searchable
      />
    </Stack>
  );
}
