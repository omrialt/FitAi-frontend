import { AppLayout } from './components/AppLayout';
import { Container, Title, Text, Paper, Grid, Card, Badge, Group } from '@mantine/core';

function DashboardPage() {
  return (
    <AppLayout>
      <Container size="xl">
        <Title order={1} mb="xl">
          Dashboard
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Active Workouts</Text>
                <Badge color="indigo">12</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Your current training plans
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Completed Sessions</Text>
                <Badge color="green">45</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Total workouts completed
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>AI Recommendations</Text>
                <Badge color="cyan">3</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Personalized suggestions
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Paper shadow="xs" p="xl" mt="xl" radius="md">
          <Title order={2} size="h3" mb="md">
            Recent Activity
          </Title>
          <Text c="dimmed">
            Your recent workout history and AI-generated insights will appear here.
          </Text>
        </Paper>
      </Container>
    </AppLayout>
  );
}

export default DashboardPage;
