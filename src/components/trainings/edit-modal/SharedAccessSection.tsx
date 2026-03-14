import { MultiSelect, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import type { User } from "../../../types/auth.types";
import type { SharedAccessSectionProps } from '../../../types/trainings-components.types';

export function SharedAccessSection({
  allUsers,
  sharedAccess,
  handleViewAccessChange,
}: SharedAccessSectionProps) {
  const sharedWithUsers = sharedAccess.map((sa: { userId: string }) => sa.userId);
  const allUsersData = useMemo(
    () => allUsers.map((user) => ({ value: user._id, label: user.fullName })),
    [allUsers]
  );

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">
        Share Training Plan
      </Text>
      <MultiSelect
        label="Share With"
        placeholder="Select users to share this plan with"
        description="Selected users will receive a personal copy of this plan"
        data={allUsersData}
        value={sharedWithUsers}
        onChange={handleViewAccessChange}
        searchable
      />
    </Stack>
  );
}
