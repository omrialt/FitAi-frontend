// React 19: Using use() hook with Suspense for async data fetching
import { use, Suspense } from 'react';
import { AppLayout } from './components/AppLayout';
import { trainingPlanService } from './services/training-plan.service';
import { usePresetMetadata } from './hooks/useMetadata';
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
} from '@mantine/core';

// React 19: Promise created outside render to work with use() hook
const trainingPlansPromise = trainingPlanService.getAll();

// React 19: Separate component that uses use() to unwrap the promise
function TrainingPlansList() {
  // React 19: use() hook unwraps the promise under Suspense boundary
  const response = use(trainingPlansPromise);
  const trainingPlans = response.items;

  // Render training plans (no loading state needed - handled by Suspense)
  return (
    <>
      {metadata}
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
    </>
  );
}

// React 19: Main component with Suspense boundary for loading states
function TrainingPlansPage() {
  // React 19: Clean metadata management
  const metadata = usePresetMetadata('trainingPlans', {
    preconnect: ['https://api.fitai.com'],
    dnsPrefetch: ['https://cdn.fitai.com'],
  });

  return (
    <AppLayout>
      {metadata}
      {/* React 19: Suspense handles loading state declaratively */}
      <Suspense
        fallback={
          <Center h="50vh">
            <Loader size="xl" />
          </Center>
        }
      >
        <TrainingPlansList />
      </Suspense>
    </AppLayout>
  );
}

export default TrainingPlansPage;
