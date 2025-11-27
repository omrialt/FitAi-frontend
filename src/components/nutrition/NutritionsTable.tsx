/**
 * NutritionsTable - Desktop table view for nutrition plans
 */

"use client";

import { Table, Badge, Text, Group } from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { NutritionsActionsMenu } from "./NutritionsActionsMenu";
import type { NutritionPlan } from "../../types/nutrition.types";

interface NutritionsTableProps {
  nutritionPlans: NutritionPlan[];
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (nutritionPlan: NutritionPlan) => void;
  onExportExcel: (nutritionPlan: NutritionPlan) => void;
  onDelete?: (id: string) => void;
}

// Star rating component
function StarRating({ rating, totalRatings }: { rating: number; totalRatings: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= Math.round(rating) ? (
        <IconStarFilled key={i} size={14} style={{ color: '#FFA500' }} />
      ) : (
        <IconStar key={i} size={14} style={{ color: '#D3D3D3' }} />
      )
    );
  }

  return (
    <Group gap={4}>
      {stars}
      <Text size="xs" c="dimmed" ml={4}>
        {rating > 0 ? `${rating.toFixed(1)} (${totalRatings})` : 'No ratings'}
      </Text>
    </Group>
  );
}

const getTargetColor = (target?: string) => {
  switch (target?.toLowerCase()) {
    case "maintain":
      return "blue";
    case "cut":
      return "red";
    case "bulk":
      return "green";
    default:
      return "gray";
  }
};

export function NutritionsTable({
  nutritionPlans,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
}: NutritionsTableProps) {
  if (nutritionPlans.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No nutrition plans found
      </Text>
    );
  }

  return (
    <Table.ScrollContainer minWidth={900}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Calories</Table.Th>
            <Table.Th>Goal</Table.Th>
            <Table.Th>Rating</Table.Th>
            <Table.Th>Creator</Table.Th>
            <Table.Th>Created At</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {nutritionPlans.map((plan) => (
            <Table.Tr key={plan._id}>
              <Table.Td>
                <Text fw={500}>{plan.title}</Text>
              </Table.Td>
              <Table.Td>
                <Text>{plan.totalCalories} kcal</Text>
              </Table.Td>
              <Table.Td>
                {plan.target ? (
                  <Badge color={getTargetColor(plan.target)} variant="light">
                    {plan.target}
                  </Badge>
                ) : (
                  <Text c="dimmed">-</Text>
                )}
              </Table.Td>
              <Table.Td>
                <StarRating rating={plan.averageRating} totalRatings={plan.totalRatings} />
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {typeof plan.userId === "object" && plan.userId?.fullName
                    ? plan.userId.fullName
                    : "-"}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {plan.createdAt
                    ? new Date(plan.createdAt).toLocaleDateString("en-GB")
                    : "-"}
                </Text>
              </Table.Td>
              <Table.Td>
                <NutritionsActionsMenu
                  nutritionPlan={plan}
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                  onView={onView}
                  onEdit={onEdit}
                  onExportPDF={onExportPDF}
                  onExportExcel={onExportExcel}
                  onDelete={onDelete}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
