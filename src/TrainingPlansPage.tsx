import { useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { trainingPlanService } from './services/training-plan.service';
import type { TrainingPlan } from './services/training-plan.service';
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
  Alert,
  Stack,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

function TrainingPlansPage() {
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingPlans = async () => {
      try {
        const response = await trainingPlanService.getAll();
        setTrainingPlans(response.items);
        setError(null);
      } catch (err) {
        setError('Failed to fetch training plans');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingPlans();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <Center h="50vh">
          <Loader size="xl" />
        </Center>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Container size="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="filled"
          >
            {error}
          </Alert>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="xl">
        <Title order={1} mb="xl">
          Training Plans
        </Title>

        <Grid>
          {trainingPlans.map((plan) => (
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

        {trainingPlans.length === 0 && (
          <Center h="30vh">
            <Text size="lg" c="dimmed">
              No training plans found
            </Text>
          </Center>
        )}
      </Container>
    </AppLayout>
  );
}

export default TrainingPlansPage;
