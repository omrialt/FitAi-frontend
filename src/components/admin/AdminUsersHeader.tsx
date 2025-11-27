/**
 * AdminUsersHeader - Page header with title for admin users page
 */

import { Group, Title } from '@mantine/core';

export function AdminUsersHeader() {
  return (
    <Group justify="space-between" mb="lg">
      <Title order={1}>Users Management</Title>
    </Group>
  );
}
