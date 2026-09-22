import { Card, Group, Avatar, Box, Text, Badge, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { alertColor } from './alerts';
import type { TrainerDashboardRow } from '../../types/trainer-dashboard.types';

interface ClientAlertCardProps {
  row: TrainerDashboardRow;
  onOpen: (clientId: string) => void;
}

/**
 * One client on the roster overview: who they are, what needs saying, and the
 * three numbers behind it.
 *
 * Every figure here can be absent, and absence is rendered as a dash rather
 * than a zero. "0 days since last workout" and "no workout ever" are opposite
 * facts that happen to share a shape, and the trainer is scanning, not reading.
 */
export function ClientAlertCard({ row, onOpen }: ClientAlertCardProps) {
  const { t } = useTranslation();

  const idle =
    row.daysSinceLastWorkout === null
      ? t('trainerDashboard.never')
      : t('trainerDashboard.daysAgo', { count: row.daysSinceLastWorkout });

  const adherence =
    row.adherencePercent === null ? '—' : `${row.adherencePercent}%`;

  const weight = row.weight
    ? `${row.weight.latestKg} ${t('trainerDashboard.kg')} (${
        row.weight.changeKg > 0 ? '+' : ''
      }${row.weight.changeKg})`
    : '—';

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Group wrap="nowrap" gap="sm" style={{ minWidth: 0 }}>
          <Avatar src={row.avatarUrl ?? undefined} radius="xl" color="indigo">
            {row.fullName?.[0]?.toUpperCase()}
          </Avatar>
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} truncate>
              {row.fullName}
            </Text>
            <Text size="sm" c="dimmed" truncate>
              {row.email}
            </Text>
          </Box>
        </Group>
        <Button
          size="xs"
          variant="light"
          onClick={() => onOpen(row.clientId)}
          aria-label={t('trainerDashboard.openClient', { name: row.fullName })}
        >
          {t('clients.viewClient')}
        </Button>
      </Group>

      {row.alerts.length > 0 && (
        <Group gap="xs" mt="sm" wrap="wrap">
          {row.alerts.map((alert) => (
            <Badge
              key={alert.code}
              color={alertColor(alert.severity)}
              variant="light"
            >
              {t(`trainerDashboard.alerts.${alert.code}`)}
            </Badge>
          ))}
        </Group>
      )}

      <Group gap="lg" mt="sm" wrap="wrap">
        <Figure label={t('trainerDashboard.lastWorkout')} value={idle} />
        <Figure
          label={t('trainerDashboard.sessions30')}
          value={String(row.sessionsLast30)}
        />
        <Figure label={t('trainerDashboard.adherence')} value={adherence} />
        <Figure label={t('trainerDashboard.weight')} value={weight} />
      </Group>
    </Card>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600} size="sm">
        {value}
      </Text>
    </Box>
  );
}
