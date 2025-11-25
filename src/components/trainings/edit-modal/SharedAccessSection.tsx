import { MultiSelect, Stack, Text, Group, Badge } from '@mantine/core';
import type { User } from '../../../types/auth.types';

interface SharedAccessSectionProps {
  allUsers: User[];
  sharedAccess: Array<{accessLevel: string; userId: string}>;
  handleViewAccessChange: (userIds: string[]) => void;
  handleEditAccessChange: (userIds: string[]) => void;
}

export function SharedAccessSection({ allUsers, sharedAccess, handleViewAccessChange, handleEditAccessChange }: SharedAccessSectionProps) {
  const viewAccessUsers = sharedAccess.filter((sa: {accessLevel: string}) => sa.accessLevel === 'view').map((sa: {userId: string}) => sa.userId);
  const editAccessUsers = sharedAccess.filter((sa: {accessLevel: string}) => sa.accessLevel === 'edit').map((sa: {userId: string}) => sa.userId);

  const getUserDisplayName = (userId: string) => {
    const user = allUsers.find(u => u._id === userId);
    return user ? `${user.fullName} (${user.email})` : userId;
  };

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">Shared Access</Text>
      
      <MultiSelect
        label="View Access"
        placeholder="Select users with view access"
        data={allUsers.map(user => ({ value: user._id, label: `${user.fullName} (${user.email})` }))}
        value={viewAccessUsers}
        onChange={handleViewAccessChange}
        searchable
      />
      {viewAccessUsers.length > 0 && (
        <Group gap="xs" mt="xs">
          {viewAccessUsers.map((userId: string) => (
            <Badge key={userId} variant="light" color="blue">
              {getUserDisplayName(userId)}
            </Badge>
          ))}
        </Group>
      )}
      
      <MultiSelect
        label="Edit Access"
        placeholder="Select users with edit access"
        data={allUsers.map(user => ({ value: user._id, label: `${user.fullName} (${user.email})` }))}
        value={editAccessUsers}
        onChange={handleEditAccessChange}
        searchable
      />
      {editAccessUsers.length > 0 && (
        <Group gap="xs" mt="xs">
          {editAccessUsers.map((userId: string) => (
            <Badge key={userId} variant="light" color="green">
              {getUserDisplayName(userId)}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  );
}
