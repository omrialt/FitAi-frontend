/**
 * AdminUsersTable - Desktop table view for users
 */

"use client";

import { Table, Badge, Text } from "@mantine/core";
import { AdminUsersActionsMenu } from "./AdminUsersActionsMenu";
import type { User } from "../../types/auth.types";

interface AdminUsersTableProps {
  users: User[];
  onView: (user: User) => void;
}

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "red";
    case "trainer":
      return "blue";
    case "user":
      return "gray";
    default:
      return "gray";
  }
};

export function AdminUsersTable({ users, onView }: AdminUsersTableProps) {
  if (users.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No users found
      </Text>
    );
  }

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Full Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Auth Provider</Table.Th>
            <Table.Th>Training Plans</Table.Th>
            <Table.Th>Meal Plans</Table.Th>
            <Table.Th>Created At</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u._id}>
              <Table.Td>
                <Text fw={500}>{u.fullName}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{u.email}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={getRoleColor(u.role)} variant="light">
                  {u.role}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={u.isActive ? "green" : "gray"}
                  variant="light"
                >
                  {u.isActive ? "active" : "inactive"}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text tt="capitalize">{u.authProvider || "-"}</Text>
              </Table.Td>
              <Table.Td>
                <Text>{u.trainingPlansCount ?? 0}</Text>
              </Table.Td>
              <Table.Td>
                <Text>{u.nutritionPlansCount ?? 0}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-GB")
                    : "-"}
                </Text>
              </Table.Td>
              <Table.Td>
                <AdminUsersActionsMenu user={u} onView={onView} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
