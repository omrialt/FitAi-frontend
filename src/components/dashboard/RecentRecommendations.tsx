import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import {
  IconBrain,
  IconBarbell,
  IconApple,
  IconInfoCircle,
} from '@tabler/icons-react';
import type { AiRecommendation } from '../../hooks/useDashboard';

interface RecentRecommendationsProps {
  recommendations: AiRecommendation[];
}

const categoryConfig: Record<
  string,
  { icon: React.ReactNode; color: string }
> = {
  training: {
    icon: <IconBarbell size={16} />,
    color: 'indigo',
  },
  nutrition: {
    icon: <IconApple size={16} />,
    color: 'green',
  },
  general: {
    icon: <IconInfoCircle size={16} />,
    color: 'blue',
  },
};

export function RecentRecommendations({
  recommendations,
}: RecentRecommendationsProps) {
  const recent = recommendations.slice(0, 4);

  return (
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group gap="xs" mb="lg">
        <IconBrain size={20} color="var(--mantine-color-violet-5)" />
        <Title order={4}>AI Recommendations</Title>
        {recommendations.length > 0 && (
          <Badge variant="light" color="violet" size="sm">
            {recommendations.length}
          </Badge>
        )}
      </Group>

      {recent.length === 0 ? (
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            No AI recommendations yet. They'll appear here as your trainer or AI
            generates personalized insights.
          </Text>
        </Stack>
      ) : (
        <Stack gap="sm">
          {recent.map((rec, index) => {
            const config = categoryConfig[rec.category] || categoryConfig.general;
            return (
              <div key={rec._id}>
                {index > 0 && <Divider mb="sm" />}
                <Group align="flex-start" gap="sm" wrap="nowrap">
                  <ThemeIcon
                    variant="light"
                    color={config.color}
                    size="md"
                    radius="md"
                    mt={2}
                  >
                    {config.icon}
                  </ThemeIcon>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group justify="space-between" gap="xs">
                      <Badge
                        size="xs"
                        variant="outline"
                        color={config.color}
                      >
                        {rec.category}
                      </Badge>
                      <Group gap={4}>
                        <Badge size="xs" variant="dot" color="gray">
                          {rec.generatedBy === 'ai' ? 'AI' : 'Trainer'}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {new Date(rec.createdAt).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric' },
                          )}
                        </Text>
                      </Group>
                    </Group>
                    <Text size="sm" lineClamp={3}>
                      {rec.content}
                    </Text>
                  </Stack>
                </Group>
              </div>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
