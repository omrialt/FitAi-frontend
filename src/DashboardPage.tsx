// React 19: Using Activity component for performance optimization
import { Activity } from 'react';
import { AppLayout } from './components/AppLayout';
import { Container, Title, Text, Paper, Grid, Card, Badge, Group } from '@mantine/core';
import { usePresetMetadata } from './hooks/useMetadata';

function DashboardPage() {
  // React 19: Clean metadata management with custom hook
  const metadata = usePresetMetadata('dashboard', {
    preconnect: ['https://api.fitai.com'],
  });

  return (
    <AppLayout>
      {metadata}
      
      <Container size="xl">
        <Title order={1} mb="xl">
          Dashboard
        </Title>

        {/* React 19: Activity components keep state but pause effects when hidden */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            {/* React 19: Activity - card stays mounted when hidden, preserving state */}
            <Activity mode="visible">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>Active Workouts</Text>
                  <Badge color="indigo">12</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  Your current training plans
                </Text>
              </Card>
            </Activity>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Activity mode="visible">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>Completed Sessions</Text>
                  <Badge color="green">45</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  Total workouts completed
                </Text>
              </Card>
            </Activity>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Activity mode="visible">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>AI Recommendations</Text>
                  <Badge color="cyan">3</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  Personalized suggestions
                </Text>
              </Card>
            </Activity>
          </Grid.Col>
        </Grid>

        {/* React 19: Activity - recent activity section stays mounted when not visible */}
        <Activity mode="visible">
          <Paper shadow="xs" p="xl" mt="xl" radius="md">
            <Title order={2} size="h3" mb="md">
              Recent Activity
            </Title>
            <Text c="dimmed">
              Your recent workout history and AI-generated insights will appear here.
            </Text>
          </Paper>
        </Activity>
      </Container>
    </AppLayout>
  );
}

export default DashboardPage;
