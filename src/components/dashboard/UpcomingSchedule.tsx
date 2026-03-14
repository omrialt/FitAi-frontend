import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconBarbell,
  IconBrandGoogle,
} from '@tabler/icons-react';
import { startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { useWeeklyCalendar } from '../../hooks/useCalendar';

export function UpcomingSchedule() {
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), []);
  const { events, loading } = useWeeklyCalendar(weekStart);

  // Get upcoming events (from now onwards), sorted by start time
  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(e.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group gap="xs" mb="lg">
        <IconCalendarEvent size={20} color="var(--mantine-color-blue-5)" />
        <Title order={4}>Upcoming Schedule</Title>
      </Group>

      {loading ? (
        <Stack align="center" py="xl">
          <Text c="dimmed" size="sm">
            Loading schedule...
          </Text>
        </Stack>
      ) : upcoming.length === 0 ? (
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            No upcoming events this week. Sync your training plan to Google
            Calendar to see your schedule here.
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
                      {startDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {startDate.toLocaleTimeString(undefined, {
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
                  {isTraining ? 'Workout' : 'Event'}
                </Badge>
              </Group>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
