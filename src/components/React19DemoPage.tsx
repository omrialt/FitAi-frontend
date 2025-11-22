/**
 * React 19 Comprehensive Demo Page
 * Shows all React 19 features working together
 */

import { Suspense, Activity } from 'react';
import { Container, Title, Stack, Tabs, Loader, Center } from '@mantine/core';
import { AppLayout } from './AppLayout';
import { WorkoutFormExample } from './WorkoutFormExample';
import { LikeButtonExample } from './LikeButtonExample';
import { useResourcePreload } from '../hooks/useResourcePreload';
import { useMetadata } from '../hooks/useMetadata';

/**
 * React 19 Demo Page Component
 */
export function React19DemoPage() {
  // React 19: Resource preloading
  useResourcePreload();

  // React 19: Clean metadata management
  const metadata = useMetadata({
    title: 'React 19 Features Demo',
    description: 'Demonstration of React 19 features including useActionState, useOptimistic, and more',
    keywords: ['React 19', 'demo', 'features'],
    preconnect: ['https://api.fitai.com'],
    robots: 'noindex, nofollow',
  });

  return (
    <AppLayout>
      {metadata}

      <Container size="lg">
        <Title order={1} mb="xl">
          React 19 Features Demo
        </Title>

        <Tabs defaultValue="forms">
          <Tabs.List>
            <Tabs.Tab value="forms">Forms (useActionState)</Tabs.Tab>
            <Tabs.Tab value="optimistic">Optimistic UI</Tabs.Tab>
            <Tabs.Tab value="suspense">Suspense (use)</Tabs.Tab>
          </Tabs.List>

          {/* React 19: Activity keeps tab content mounted */}
          <Tabs.Panel value="forms" pt="xl">
            <Activity mode="visible">
              <Stack gap="lg">
                <Title order={2} size="h3">
                  useActionState + useFormStatus
                </Title>
                <WorkoutFormExample />
              </Stack>
            </Activity>
          </Tabs.Panel>

          <Tabs.Panel value="optimistic" pt="xl">
            <Activity mode="visible">
              <Stack gap="lg">
                <Title order={2} size="h3">
                  useOptimistic Updates
                </Title>
                <LikeButtonExample
                  workoutId="demo-1"
                  initialLikes={42}
                  initialIsLiked={false}
                />
                <LikeButtonExample
                  workoutId="demo-2"
                  initialLikes={128}
                  initialIsLiked={true}
                />
              </Stack>
            </Activity>
          </Tabs.Panel>

          <Tabs.Panel value="suspense" pt="xl">
            <Activity mode="visible">
              <Stack gap="lg">
                <Title order={2} size="h3">
                  Suspense + use() Hook
                </Title>
                
                {/* React 19: Suspense for async data */}
                <Suspense
                  fallback={
                    <Center h={200}>
                      <Loader size="lg" />
                    </Center>
                  }
                >
                  {/* Data component would use use() hook here */}
                  <div>Data loaded with use() hook</div>
                </Suspense>
              </Stack>
            </Activity>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </AppLayout>
  );
}
