/**
 * AdminUsersCardList - Mobile card list view for users
 */

import { Stack, Text } from '@mantine/core';
import { AdminUsersCard } from './AdminUsersCard';
import type { User } from '../../types/auth.types';

interface AdminUsersCardListProps {
  users: User[];
  onView: (user: User) => void;
}

export function AdminUsersCardList({
  users,
  onView,
}: AdminUsersCardListProps) {
  if (users.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No users found
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {users.map((user) => (
        <AdminUsersCard
          key={user._id}
          user={user}
          onView={onView}
        />
      ))}
    </Stack>
  );
}
