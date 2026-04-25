/**
 * NutritionsTable - Desktop table view for nutrition plans
 */

"use client";

import type React from "react";
import { Table, Badge, Text, Group, Avatar, Box } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { NutritionsActionsMenu } from "./NutritionsActionsMenu";
import type { NutritionPlan } from "../../types/nutrition.types";
import type { NutritionsTableProps } from '../../types/nutrition-components.types';

const getTargetBadgeStyle = (target?: string): { bg: string; color: string; label: string } => {
  switch (target?.toLowerCase()) {
    case "cut":
      return { bg: '#fff1f2', color: '#be123c', label: 'Weight Loss' };
    case "bulk":
      return { bg: '#eef2ff', color: '#4338ca', label: 'Muscle Gain' };
    case "maintain":
      return { bg: '#f0fdf4', color: '#15803d', label: 'Maintain' };
    default:
      return { bg: '#f8fafc', color: '#64748b', label: target ?? '—' };
  }
};

const getAvatarColor = (target?: string): string => {
  switch (target?.toLowerCase()) {
    case "cut": return '#f43f5e';
    case "bulk": return '#6366f1';
    case "maintain": return '#10b981';
    default: return '#94a3b8';
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
  onActivate,
}: NutritionsTableProps) {
  if (nutritionPlans.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No nutrition plans found
      </Text>
    );
  }

  return (
    <Box
      style={{
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid rgba(203,213,225,0.4)',
        background: '#fff',
      }}
      mb="lg"
    >
      <Table.ScrollContainer minWidth={800}>
        <Table style={{ borderCollapse: 'collapse' }}>
          <Table.Thead>
            <Table.Tr style={{ background: '#f8fafc' }}>
              <Table.Th style={thStyle}>Plan Name</Table.Th>
              <Table.Th style={thStyle}>Target</Table.Th>
              <Table.Th style={thStyle}>Meals</Table.Th>
              <Table.Th style={thStyle}>Calories</Table.Th>
              <Table.Th style={thStyle}>Creator</Table.Th>
              <Table.Th style={thStyle}>Rating</Table.Th>
              <Table.Th style={{ ...thStyle, textAlign: 'right' }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {nutritionPlans.map((plan) => {
              const badge = getTargetBadgeStyle(plan.target);
              const avatarColor = getAvatarColor(plan.target);
              const creatorName =
                typeof plan.userId === "object" && plan.userId?.fullName
                  ? plan.userId.fullName
                  : null;
              const creatorInitial = creatorName ? creatorName[0].toUpperCase() : '?';
              const mealsCount = plan.meals?.length ?? 0;

              return (
                <Table.Tr
                  key={plan._id}
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,250,252,0.6)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  {/* Plan Name */}
                  <Table.Td style={tdStyle}>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar
                        size={40}
                        radius="md"
                        style={{ background: avatarColor, flexShrink: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}
                      >
                        {plan.title[0]?.toUpperCase()}
                      </Avatar>
                      <Text
                        fw={700}
                        size="sm"
                        style={{ color: '#0f172a', lineHeight: 1.3 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#0f172a'; }}
                      >
                        {plan.title}
                      </Text>
                    </Group>
                  </Table.Td>

                  {/* Target badge */}
                  <Table.Td style={tdStyle}>
                    {plan.target ? (
                      <Badge
                        variant="light"
                        radius="xl"
                        size="sm"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          fontWeight: 700,
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          border: 'none',
                        }}
                      >
                        {badge.label}
                      </Badge>
                    ) : (
                      <Text c="dimmed" size="sm">—</Text>
                    )}
                  </Table.Td>

                  {/* Meals per day */}
                  <Table.Td style={tdStyle}>
                    <Text size="sm" fw={500} c="gray.7">
                      {mealsCount > 0 ? `${mealsCount} per day` : '—'}
                    </Text>
                  </Table.Td>

                  {/* Calories */}
                  <Table.Td style={tdStyle}>
                    <Text size="sm" fw={700} style={{ color: '#0f172a' }}>
                      {plan.totalCalories ? `${plan.totalCalories.toLocaleString()} kcal` : '—'}
                    </Text>
                  </Table.Td>

                  {/* Creator */}
                  <Table.Td style={tdStyle}>
                    <Group gap="xs" wrap="nowrap">
                      <Avatar size={24} radius="xl" color="indigo">
                        {creatorInitial}
                      </Avatar>
                      <Text size="sm" c="gray.6">
                        {creatorName ?? '—'}
                      </Text>
                    </Group>
                  </Table.Td>

                  {/* Rating */}
                  <Table.Td style={tdStyle}>
                    <Group gap={4} wrap="nowrap">
                      <IconStarFilled size={14} style={{ color: '#f59e0b' }} />
                      <Text size="sm" fw={700} style={{ color: '#0f172a' }}>
                        {plan.averageRating > 0 ? plan.averageRating.toFixed(1) : '—'}
                      </Text>
                    </Group>
                  </Table.Td>

                  {/* Actions */}
                  <Table.Td style={{ ...tdStyle, textAlign: 'right' }}>
                    <NutritionsActionsMenu
                      nutritionPlan={plan}
                      isAdmin={isAdmin}
                      currentUserId={currentUserId}
                      onView={onView}
                      onEdit={onEdit}
                      onExportPDF={onExportPDF}
                      onExportExcel={onExportExcel}
                      onDelete={onDelete}
                      onActivate={onActivate}
                    />
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Box>
  );
}

const thStyle: React.CSSProperties = {
  padding: '14px 24px',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#64748b',
  borderBottom: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '18px 24px',
};
