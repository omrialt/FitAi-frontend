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
  IconToolsKitchen2,
  IconApple,
  IconChevronRight,
  IconStar,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { NutritionPlan } from '../../types/nutrition.types';

interface NutritionOverviewProps {
  plans: NutritionPlan[];
}

const targetColor: Record<string, string> = {
  bulk: 'orange',
  cut: 'red',
  maintain: 'teal',
};

export function NutritionOverview({ plans }: NutritionOverviewProps) {
  const navigate = useNavigate();
  const display = plans.slice(0, 4);

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group justify="space-between" mb="lg">
        <Group gap="xs">
          <IconToolsKitchen2 size={20} color="var(--mantine-color-green-5)" />
          <Title order={4}>My Nutrition Plans</Title>
        </Group>
        <Badge variant="light" color="green" size="sm">
          {plans.length}
        </Badge>
      </Group>

      {display.length === 0 ? (
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            You don't have any nutrition plans yet.
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
                onClick={() => navigate(`/nutrition-plans/${plan._id}`)}
              >
                <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                  <ThemeIcon
                    variant="light"
                    color="green"
                    size="sm"
                    radius="sm"
                  >
                    <IconApple size={14} />
                  </ThemeIcon>
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {plan.title}
                    </Text>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        {plan.totalCalories} kcal
                      </Text>
                      <Text size="xs" c="dimmed">
                        ·
                      </Text>
                      <Text size="xs" c="dimmed">
                        {plan.meals.length} meals
                      </Text>
                    </Group>
                  </Stack>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  {plan.averageRating > 0 && (
                    <Group gap={2}>
                      <IconStar
                        size={12}
                        fill="var(--mantine-color-yellow-5)"
                        color="var(--mantine-color-yellow-5)"
                      />
                      <Text size="xs" fw={500}>
                        {plan.averageRating.toFixed(1)}
                      </Text>
                    </Group>
                  )}
                  {plan.target && (
                    <Badge
                      size="xs"
                      color={targetColor[plan.target] || 'gray'}
                      variant="light"
                    >
                      {plan.target}
                    </Badge>
                  )}
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
              c="green"
              ta="center"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/nutrition-plans')}
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
