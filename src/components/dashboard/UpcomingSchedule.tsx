import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Button,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconBarbell,
  IconBrandGoogle,
  IconChevronRight,
} from '@tabler/icons-react';
import { startOfWeek, startOfDay, addDays, addWeeks } from 'date-fns';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWeeklyCalendar } from '../../hooks/useCalendar';

export function UpcomingSchedule() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), []);
  const nextWeekStart = useMemo(() => addWeeks(weekStart, 1), [weekStart]);

  const { events: thisWeekEvents, loading: loadingThis } = useWeeklyCalendar(weekStart);
  const { events: nextWeekEvents, loading: loadingNext } = useWeeklyCalendar(nextWeekStart);

  const loading = loadingThis || loadingNext;

  // Show events from start of today through end of day+4 (5 days total)
  const today = startOfDay(new Date());
  const endRange = addDays(today, 5);

  const upcoming = [...thisWeekEvents, ...nextWeekEvents]
    .filter((e) => {
      const start = new Date(e.start);
      return start >= today && start < endRange;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group justify="space-between" mb="lg">
        <Group gap="xs">
          <IconCalendarEvent size={20} color="var(--mantine-color-blue-5)" />
          <Title order={4}>{t('dashboard.upcomingSchedule')}</Title>
        </Group>
        <Button
          variant="subtle"
          color="blue"
          size="xs"
          rightSection={<IconChevronRight size={14} />}
          onClick={() => navigate('/calendar')}
        >
          {t('dashboard.viewAll')}
        </Button>
      </Group>

      {loading ? (
        <Stack align="center" py="xl">
          <Text c="dimmed" size="sm">
            {t('dashboard.loadingSchedule')}
          </Text>
        </Stack>
      ) : upcoming.length === 0 ? (
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            {t('dashboard.noUpcomingEvents')}
          </Text>
        </Stack>
      ) : (
        <Stack gap="sm">
          {upcoming.map((event, index) => {
            const startDate = new Date(event.start);
            const isTraining = event.type === 'training';

            return (
              <Group
                key={event.id || index}
                className="dashboard-schedule-item"
                gap="sm"
                wrap="nowrap"
                p="xs"
              >
                <ThemeIcon
                  variant="light"
                  color={isTraining ? 'indigo' : 'blue'}
                  size="md"
                  radius="md"
                >
                  {isTraining ? (
                    <IconBarbell size={16} />
                  ) : (
                    <IconBrandGoogle size={16} />
                  )}
                </ThemeIcon>
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {event.title}
                  </Text>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {startDate.toLocaleDateString(i18n.language, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {startDate.toLocaleTimeString(i18n.language, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Group>
                </Stack>
                <Badge
                  variant="light"
                  color={isTraining ? 'indigo' : 'blue'}
                  size="xs"
                >
                  {isTraining ? t('dashboard.workout') : t('dashboard.event')}
                </Badge>
              </Group>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
