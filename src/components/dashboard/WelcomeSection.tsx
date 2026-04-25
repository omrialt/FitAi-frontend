import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Avatar,
  Stack,
  Button,
} from '@mantine/core';
import {
  IconFlame,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconBarbell,
  IconApple,
  IconCalendar,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/auth.types';
import type { CurrentStatus } from '../../types/current-status.types';
import type { WelcomeSectionProps } from '../../types/dashboard-components.types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const phaseConfig = {
  bulk: {
    label: 'Bulking',
    color: 'orange',
    icon: <IconTrendingUp size={14} />,
    description: 'Building muscle mass',
  },
  cut: {
    label: 'Cutting',
    color: 'red',
    icon: <IconTrendingDown size={14} />,
    description: 'Reducing body fat',
  },
  maintain: {
    label: 'Maintaining',
    color: 'teal',
    icon: <IconMinus size={14} />,
    description: 'Keeping current form',
  },
};

export function WelcomeSection({ user, currentStatus }: WelcomeSectionProps) {
  const greeting = getGreeting();
  const navigate = useNavigate();
  const phase = currentStatus?.phase || user.target || 'maintain';
  const config = phaseConfig[phase];

  return (
    <Paper className="dashboard-welcome" radius="lg" p="xl">
      <Group justify="space-between" wrap="wrap" gap="md">
        <Group gap="lg">
          <Avatar
            src={user.avatarUrl}
            size={64}
            radius="xl"
            color="indigo"
            alt={user.fullName}
          >
            {user.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </Avatar>
          <Stack gap={4}>
            <Text size="sm" c="dimmed">
              {greeting}
            </Text>
            <Title order={2} className="dashboard-welcome-name">
              {user.fullName}
            </Title>
            <Group gap="xs">
              <Badge
                variant="light"
                color={config.color}
                leftSection={config.icon}
                size="md"
              >
                {config.label}
              </Badge>
              {currentStatus?.lastWorkoutDate && (
                <Group gap={4}>
                  <IconCalendar size={13} color="var(--mantine-color-dimmed)" />
                  <Text size="xs" c="dimmed">
                    Last workout:{' '}
                    {new Date(currentStatus.lastWorkoutDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </Text>
                </Group>
              )}
            </Group>
            <Group gap="xs" mt={6}>
              <Button
                size="sm"
                variant="filled"
                color="indigo"
                leftSection={<IconBarbell size={15} />}
                onClick={() => navigate('/my-trainings')}
              >
                Start Today's Session
              </Button>
              <Button
                size="sm"
                variant="light"
                color="green"
                leftSection={<IconApple size={15} />}
                onClick={() => navigate('/my-nutritions')}
              >
                Log Meal
              </Button>
            </Group>
          </Stack>
        </Group>
        <Group gap="xs" className="dashboard-welcome-streak">
          <IconFlame size={20} color="var(--mantine-color-orange-5)" />
          <Text size="sm" fw={600}>
            {currentStatus?.lastWorkoutDate
              ? `Last workout: ${new Date(currentStatus.lastWorkoutDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}`
              : 'No workouts yet — start today!'}
          </Text>
        </Group>
      </Group>
    </Paper>
  );
}
