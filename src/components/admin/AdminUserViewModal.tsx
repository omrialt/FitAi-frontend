import { Modal, Stack, Group, Avatar, Text, Badge, Button, Divider } from "@mantine/core";
import { IconUserCircle } from "@tabler/icons-react";
import type { User } from "../../types/auth.types";
import type { AdminUserViewModalProps } from '../../types/admin.types';

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

export function AdminUserViewModal({ opened, onClose, user }: AdminUserViewModalProps) {
  if (!user) return null;

  const handleViewProfile = () => {
    // TODO: Navigate to user profile page when implemented
    console.log("Navigate to user profile:", user._id);
  };

  return (
    <Modal opened={opened} onClose={onClose} title={
            <Text fw={700} size="lg">
                User Details
            </Text>
          } size="700" centered>
      <Stack gap="lg">
        {/* User Header */}
        <Group gap="md" align="center">
          <Avatar src={user.avatarUrl} size={80} radius={80} />
          <Stack gap={4}>
            <Text fw={700} size="xl">{user.fullName}</Text>
            <Text c="dimmed" size="sm">{user.email}</Text>
            <Group gap="xs">
              <Badge color={getRoleColor(user.role)} variant="light">
                {user.role}
              </Badge>
              <Badge color={user.isActive ? "green" : "gray"} variant="light">
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </Group>
          </Stack>
        </Group>

        <Divider />

        {/* User Information Grid */}
        <Stack gap="md">
          <Group grow align="flex-start">
            <Stack gap={4}>
              <Text size="sm" c="dimmed" fw={600}>Role</Text>
              <Text tt="capitalize">{user.role}</Text>
            </Stack>
            <Stack gap={4}>
              <Text size="sm" c="dimmed" fw={600}>Status</Text>
              <Text>{user.isActive ? "Active" : "Inactive"}</Text>
            </Stack>
          </Group>

          <Group grow align="flex-start">
            <Stack gap={4}>
              <Text size="sm" c="dimmed" fw={600}>Auth Provider</Text>
              <Text tt="capitalize">{user.authProvider}</Text>
            </Stack>
            <Stack gap={4}>
              <Text size="sm" c="dimmed" fw={600}>Birthdate</Text>
              <Text>{user.birthDate ? new Date(user.birthDate).toLocaleDateString("en-GB") : "-"}</Text>
            </Stack>
          </Group>

          <Group grow align="flex-start">
            <Stack gap={4}>
              <Text size="sm" c="dimmed" fw={600}>Join Date</Text>
              <Text>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : "-"}</Text>
            </Stack>
            <Stack gap={4}>
              <Text size="sm" c="dimmed" fw={600}>Last Updated</Text>
              <Text>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("en-GB") : "-"}</Text>
            </Stack>
          </Group>
        </Stack>

        <Divider />

        {/* Stats Section */}
        <Stack gap="sm">
          <Text size="sm" c="dimmed" fw={600}>Activity Stats</Text>
          <Group grow>
            <Stack gap={4} align="center">
              <Text size="lg" fw={700}>{user.trainingPlansCount ?? 0}</Text>
              <Text size="sm" c="dimmed">Training Programs</Text>
            </Stack>
            <Stack gap={4} align="center">
              <Text size="lg" fw={700}>{user.nutritionPlansCount ?? 0}</Text>
              <Text size="sm" c="dimmed">Meal Plans</Text>
            </Stack>
          </Group>
        </Stack>

        <Divider />

        {/* Action Button */}
        <Button
          leftSection={<IconUserCircle size={16} />}
          variant="light"
          onClick={handleViewProfile}
          fullWidth
        >
          View Full Profile
        </Button>
      </Stack>
    </Modal>
  );
}
