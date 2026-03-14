import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Divider,
  ThemeIcon,
} from '@mantine/core';
import {
  IconListDetails,
  IconBarbell,
  IconChevronRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { TrainingPlan } from '../../types/training-plan.types';

interface TrainingOverviewProps {
  plans: TrainingPlan[];
}

const difficultyColor: Record<string, string> = {
  beginner: 'green',
  intermediate: 'yellow',
  advanced: 'red',
};

export function TrainingOverview({ plans }: TrainingOverviewProps) {
  const navigate = useNavigate();
  const display = plans.slice(0, 4);

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group justify="space-between" mb="lg">
        <Group gap="xs">
          <IconListDetails size={20} color="var(--mantine-color-indigo-5)" />
          <Title order={4}>My Training Plans</Title>
        </Group>
        <Badge variant="light" color="indigo" size="sm">
          {plans.length}
        </Badge>
      </Group>

      {display.length === 0 ? (
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            You don't have any training plans yet.
          </Text>
        </Stack>
      ) : (
        <Stack gap="xs">
          {display.map((plan, index) => (
            <div key={plan._id}>
              {index > 0 && <Divider />}
              <Group
                className="dashboard-plan-row"
                justify="space-between"
                wrap="nowrap"
                py="xs"
                px="xs"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/training-plans/${plan._id}`)}
              >
                <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                  <ThemeIcon
                    variant="light"
                    color="indigo"
                    size="sm"
                    radius="sm"
                  >
                    <IconBarbell size={14} />
                  </ThemeIcon>
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {plan.title}
                    </Text>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        {plan.days.length} days
                      </Text>
                      <Text size="xs" c="dimmed">
                        ·
                      </Text>
                      <Text size="xs" c="dimmed">
                        {plan.days.reduce(
                          (s, d) => s + d.exercises.length,
                          0,
                        )}{' '}
                        exercises
                      </Text>
                    </Group>
                  </Stack>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <Badge
                    size="xs"
                    color={difficultyColor[plan.difficulty] || 'gray'}
                    variant="light"
                  >
                    {plan.difficulty}
                  </Badge>
                  <IconChevronRight
                    size={14}
                    color="var(--mantine-color-dimmed)"
                  />
                </Group>
              </Group>
            </div>
          ))}
          {plans.length > 4 && (
            <Text
              size="xs"
              c="indigo"
              ta="center"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/my-trainings')}
              mt="xs"
            >
              View all {plans.length} plans →
            </Text>
          )}
        </Stack>
      )}
    </Paper>
  );
}
