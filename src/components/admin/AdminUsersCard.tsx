/**
 * AdminUsersCard - Individual user card for mobile view
 */

import { Card, Group, Stack, Text, Badge, Button, Avatar } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import type { User } from '../../types/auth.types';

interface AdminUsersCardProps {
  user: User;
  onView: (user: User) => void;
}

export function AdminUsersCard({ user, onView }: AdminUsersCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="md">
          <Avatar src={user.avatarUrl} size={50} radius={50} />
          <Stack gap={4}>
            <Text fw={600}>{user.fullName}</Text>
            <Text size="sm" c="dimmed">{user.email}</Text>
            <Group gap="xs">
              <Badge color={user.role === "admin" ? "red" : user.role === "trainer" ? "blue" : "gray"}>
                {user.role}
              </Badge>
              <Badge color={user.isActive ? "green" : "gray"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </Group>
          </Stack>
        </Group>
        <Button
          size="xs"
          leftSection={<IconEye size={16} />}
          variant="light"
          onClick={() => onView(user)}
        >
          View
        </Button>
      </Group>
    </Card>
  );
}
