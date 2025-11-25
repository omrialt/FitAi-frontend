import { MultiSelect, Stack, Text } from '@mantine/core';
import type { User } from '../../../types/auth.types';

interface SharedAccessSectionProps {
  allUsers: User[];
  sharedAccess: Array<{accessLevel: string; userId: string}>;
  handleViewAccessChange: (userIds: string[]) => void;
  handleEditAccessChange: (userIds: string[]) => void;
}

export function SharedAccessSection({ allUsers, sharedAccess, handleViewAccessChange }: SharedAccessSectionProps) {
  const sharedWithUsers = sharedAccess.map((sa: {userId: string}) => sa.userId);

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">Share Training Plan</Text>
      
      <MultiSelect
        label="Share With"
        placeholder="Select users to share this plan with"
        description="Selected users will receive a personal copy of this plan"
        data={allUsers.map(user => ({ value: user._id, label: `${user.fullName} (${user.email})` }))}
        value={sharedWithUsers}
        onChange={handleViewAccessChange}
        searchable
      />
    </Stack>
  );
}
