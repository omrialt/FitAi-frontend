/**
 * TrainingsTable - Desktop table view for trainings
 */

"use client";

import { Table, Badge, Text, Group, ThemeIcon, Avatar, Box } from "@mantine/core";
import { IconBarbell, IconYoga, IconFlame } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { TrainingsActionsMenu } from "./TrainingsActionsMenu";
import type { TrainingsTableProps } from '../../types/trainings-components.types';

const getDifficultyMeta = (difficulty: string): { labelKey: string | null; color: string } => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return { labelKey: "trainings.beginner", color: "gray" };
    case "intermediate":
      return { labelKey: "trainings.intermediate", color: "cyan" };
    case "advanced":
      return { labelKey: "trainings.advanced", color: "indigo" };
    case "elite":
      return { labelKey: "trainings.elite", color: "red" };
    default:
      return { labelKey: null, color: "gray" };
  }
};

const getPlanIcon = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner": return <IconYoga size={16} />;
    case "advanced":
    case "elite":    return <IconFlame size={16} />;
    default:         return <IconBarbell size={16} />;
  }
};

const getPlanIconColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":     return "teal";
    case "intermediate": return "blue";
    case "advanced":     return "orange";
    case "elite":        return "red";
    default:             return "indigo";
  }
};

const formatModified = (t: TFunction, lng: string, date?: string | Date) => {
  if (!date) return null;
  const d = new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return t('trainings.modifiedToday');
  if (days === 1) return t('trainings.modifiedYesterday');
  if (days < 7) return t('trainings.modifiedDaysAgo', { count: days });
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return t('trainings.modifiedWeeksAgo', { count: weeks });
  const formatted = d.toLocaleDateString(lng === 'he' ? 'he-IL' : 'en-GB', { month: 'short', day: 'numeric' });
  return t('trainings.modifiedOn', { date: formatted });
};

export function TrainingsTable({
  trainings,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: TrainingsTableProps) {
  const { t, i18n } = useTranslation();

  if (trainings.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t('trainings.noTrainings')}
      </Text>
    );
  }

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('trainings.planDetails')}</Text></Table.Th>
            <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('trainings.difficulty')}</Text></Table.Th>
            <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('trainings.target')}</Text></Table.Th>
            <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('trainings.days')}</Text></Table.Th>
            <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('trainings.leadTrainer')}</Text></Table.Th>
            <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('trainings.status')}</Text></Table.Th>
            <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">{t('trainings.actions')}</Text></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {trainings.map((training) => {
            const diffMeta = getDifficultyMeta(training.difficulty);
            const trainerName = training.trainerId && typeof training.trainerId === "object"
              ? training.trainerId.fullName
              : training.userId && typeof training.userId === "object"
              ? training.userId.fullName
              : null;
            const modifiedText = formatModified(t, i18n.language, (training as any).updatedAt || training.createdAt);

            return (
              <Table.Tr key={training._id} style={{ cursor: 'pointer' }} onClick={() => onView(training._id)}>
                {/* Plan Details */}
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon variant="light" color={getPlanIconColor(training.difficulty)} size="md" radius="md">
                      {getPlanIcon(training.difficulty)}
                    </ThemeIcon>
                    <Box>
                      <Text fw={600} size="sm">{training.title}</Text>
                      {modifiedText && <Text size="xs" c="dimmed">{modifiedText}</Text>}
                    </Box>
                  </Group>
                </Table.Td>

                {/* Difficulty */}
                <Table.Td>
                  <Badge color={diffMeta.color} variant="light" size="sm" tt="uppercase" fw={700}>
                    {diffMeta.labelKey ? t(diffMeta.labelKey) : training.difficulty || t('common.none')}
                  </Badge>
                </Table.Td>

                {/* Target */}
                <Table.Td>
                  <Text size="sm" tt="capitalize">{training.focus || training.target || "—"}</Text>
                </Table.Td>

                {/* Days */}
                <Table.Td>
                  <Text size="sm" fw={700} c="indigo">{training.days?.length || 0}</Text>
                </Table.Td>

                {/* Lead Trainer */}
                <Table.Td>
                  {trainerName ? (
                    <Group gap="xs" wrap="nowrap">
                      <Avatar size="sm" radius="xl" color="indigo">
                        {trainerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </Avatar>
                      <Text size="sm">{trainerName}</Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">{'—'}</Text>
                  )}
                </Table.Td>

                {/* Status */}
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <Box
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        backgroundColor: training.isActive
                          ? 'var(--mantine-color-green-6)'
                          : 'var(--mantine-color-gray-5)',
                        flexShrink: 0,
                      }}
                    />
                    <Text size="sm" c={training.isActive ? 'green' : 'dimmed'}>
                      {training.isActive ? t('trainings.active') : t('trainings.inactive')}
                    </Text>
                  </Group>
                </Table.Td>

                {/* Actions */}
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <TrainingsActionsMenu
                    training={training}
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
  );
}
