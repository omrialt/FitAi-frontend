import { MultiSelect, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { SharedAccessSectionProps } from '../../../types/trainings-components.types';

export function SharedAccessSection({
  allUsers,
  sharedAccess,
  handleViewAccessChange,
}: SharedAccessSectionProps) {
  const { t } = useTranslation();
  const sharedWithUsers = sharedAccess.map((sa: { userId: string }) => sa.userId);
  const allUsersData = useMemo(
    () => allUsers.map((user) => ({ value: user._id, label: user.fullName })),
    [allUsers]
  );

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">
        {t('trainings.sharePlan')}
      </Text>
      <MultiSelect
        label={t('common.shareWith')}
        placeholder={t('common.shareWithPlaceholder')}
        description={t('common.shareWithDescription')}
        data={allUsersData}
        value={sharedWithUsers}
        onChange={handleViewAccessChange}
        searchable
      />
    </Stack>
  );
}
