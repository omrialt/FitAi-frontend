import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  Divider,
} from '@mantine/core';
import {
  IconBarbell,
  IconCalendar,
  IconClock,
  IconFlame,
  IconChevronRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { TrainingPlan } from '../../types/training-plan.types';
import type { CurrentStatus } from '../../types/current-status.types';
import type { ActiveTrainingCardProps } from '../../types/dashboard-components.types';

const difficultyColor: Record<string, string> = {
  beginner: 'green',
  intermediate: 'yellow',
  advanced: 'red',
};

export function ActiveTrainingCard({
  plan,
  currentStatus,
}: ActiveTrainingCardProps) {
  const navigate = useNavigate();

  if (!plan) {
    return (
      <Paper className="dashboard-card" radius="md" p="lg" withBorder>
        <Group gap="xs" mb="md">
          <IconBarbell size={20} color="var(--mantine-color-indigo-5)" />
          <Title order={4}>Active Training Plan</Title>
        </Group>
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            No active training plan selected.
          </Text>
          <Button
            variant="light"
            color="indigo"
            size="sm"
            onClick={() => navigate('/my-trainings')}
          >
            Browse Training Plans
          </Button>
        </Stack>
      </Paper>
    );
  }

  const totalExercises = plan.days.reduce(
    (sum, d) => sum + d.exercises.length,
    0,
  );

  const nextWorkoutDate = currentStatus?.nextWorkoutDate
    ? new Date(currentStatus.nextWorkoutDate)
    : null;

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconBarbell size={20} color="var(--mantine-color-indigo-5)" />
          <Title order={4}>Active Training Plan</Title>
        </Group>
        <Badge color={difficultyColor[plan.difficulty] || 'gray'} size="sm">
          {plan.difficulty}
        </Badge>
      </Group>

      <Text fw={600} size="lg" mb={4}>
        {plan.title}
      </Text>
      <Text size="sm" c="dimmed" lineClamp={2} mb="md">
        {plan.description}
      </Text>

      <Group gap="lg" mb="md">
        <Group gap={4}>
          <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
          <Text size="xs" c="dimmed">
            {plan.days.length} days
          </Text>
        </Group>
        <Group gap={4}>
          <IconBarbell size={14} color="var(--mantine-color-dimmed)" />
          <Text size="xs" c="dimmed">
            {totalExercises} exercises
          </Text>
        </Group>
        {plan.estimatedDuration && (
          <Group gap={4}>
            <IconClock size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              ~{plan.estimatedDuration} min
            </Text>
          </Group>
        )}
        {plan.estimatedCalories && (
          <Group gap={4}>
            <IconFlame size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              ~{plan.estimatedCalories} kcal
            </Text>
          </Group>
        )}
      </Group>

      <Divider mb="md" />

      <Group justify="space-between">
        {nextWorkoutDate && (
          <Text size="xs" c="dimmed">
            Next workout:{' '}
            <Text span fw={600} c="indigo">
              {nextWorkoutDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </Text>
        )}
        <Button
          variant="subtle"
          color="indigo"
          size="xs"
          rightSection={<IconChevronRight size={14} />}
          onClick={() => navigate(`/training-plans/${plan._id}`)}
          ml="auto"
        >
          View Plan
        </Button>
      </Group>
    </Paper>
  );
}
