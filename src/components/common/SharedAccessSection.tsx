/**
 * SharedAccessSection - Reusable component for sharing plans with users
 */

import { MultiSelect, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import type { User } from "../../types/auth.types";

type ObjectType = "trainingPlan" | "nutritionPlan";

interface SharedAccessSectionProps {
  allUsers: User[];
  sharedAccess: Array<{ accessLevel: string; userId: string }>;
  handleViewAccessChange: (userIds: string[]) => void;
  objectType: ObjectType;
}

const getShareDescription = (objectType: ObjectType): { title: string; description: string } => {
  switch (objectType) {
    case "trainingPlan":
      return {
        title: "Share Training Plan",
        description: "Selected users will receive a personal copy of this plan",
      };
    case "nutritionPlan":
      return {
        title: "Share Nutrition Plan",
        description: "Selected users will have view-only access to this plan",
      };
    default:
      return {
        title: "Share Plan",
        description: "Selected users will have access to this plan",
      };
  }
};

export function SharedAccessSection({
  allUsers,
  sharedAccess,
  handleViewAccessChange,
  objectType,
}: SharedAccessSectionProps) {
  const sharedWithUsers = sharedAccess.map((sa: { userId: string | any }) => {
    // Handle both string IDs and populated User objects
    return typeof sa.userId === 'string' ? sa.userId : sa.userId?._id || sa.userId;
  });
  const allUsersData = useMemo(
    () => allUsers.map((user) => ({ value: user._id, label: user.fullName })),
    [allUsers]
  );

  const { title, description } = getShareDescription(objectType);

  return (
    <Stack gap="xs">
      <Text fw={500} size="sm">
        {title}
      </Text>
      <MultiSelect
        label="Share With"
        placeholder="Select users to share this plan with"
        description={description}
        data={allUsersData}
        value={sharedWithUsers}
        onChange={handleViewAccessChange}
        searchable
      />
    </Stack>
  );
}
