// React 19: Using use() hook with Suspense for async data fetching
import { useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useApi } from '../hooks/useApi';
import type { TrainingPlan, TrainingPlansResponse } from '../types/training-plan.types';
import {
  Container,
  Title,
  Card,
  Text,
  Grid,
  Badge,
  Group,
  Loader,
  Center,
  Stack,
  Alert,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

function TrainingPlansPage() {
  const { data, loading, error, execute } = useApi<TrainingPlansResponse>();

  useEffect(() => {
    // Fetch training plans when component mounts
    execute('/training-plans', { method: 'GET' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Log the data when it changes
    if (data) {
      console.log('Training plans loaded:', data);
    }
  }, [data]);

  return (
    <AppLayout>
      <Container size="xl">
        <Title order={1} mb="xl">
          Training Plans
        </Title>

        {loading && (
          <Center h="50vh">
            <Loader size="lg" />
          </Center>
        )}

        {error && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Error loading training plans"
            color="red"
            mb="md"
          >
            {error.message}
          </Alert>
        )}

        {data && data.items && (
          <>
            <Grid>
              {data.items.map((plan) => (
                <Grid.Col key={plan._id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                    <Stack gap="md">
                      <div>
                        <Title order={3} size="h4" mb="xs">
                          {plan.name}
                        </Title>
                        <Text size="sm" c="dimmed">
                          {plan.description || 'No description available'}
                        </Text>
                      </div>

                      <Group gap="xs">
                        {plan.level && (
                          <Badge color="blue" variant="light">
                            Level: {plan.level}
                          </Badge>
                        )}
                        {plan.duration && (
                          <Badge color="green" variant="light">
                            {plan.duration} weeks
                          </Badge>
                        )}
                      </Group>

                      {plan.exercises && plan.exercises.length > 0 && (
                        <div>
                          <Text size="sm" fw={500} mb="xs">
                            Exercises ({plan.exercises.length})
                          </Text>
                          <Stack gap="xs">
                            {plan.exercises.slice(0, 3).map((exercise, index) => (
                              <Card key={index} padding="xs" withBorder>
                                <Text size="sm" fw={500}>
                                  {exercise.name}
                                </Text>
                                <Group gap="xs" mt={4}>
                                  <Text size="xs" c="dimmed">
                                    {exercise.sets} sets
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    ×
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {exercise.reps} reps
                                  </Text>
                                  {exercise.rest && (
                                    <>
                                      <Text size="xs" c="dimmed">
                                        •
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {exercise.rest}s rest
                                      </Text>
                                    </>
                                  )}
                                </Group>
                              </Card>
                            ))}
                            {plan.exercises.length > 3 && (
                              <Text size="xs" c="dimmed" ta="center">
                                +{plan.exercises.length - 3} more exercises
                              </Text>
                            )}
                          </Stack>
                        </div>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {data.items.length === 0 && !loading && (
              <Center h="30vh">
                <Text size="lg" c="dimmed">
                  No training plans found
                </Text>
              </Center>
            )}
          </>
        )}
      </Container>
    </AppLayout>
  );
}

export default TrainingPlansPage;
