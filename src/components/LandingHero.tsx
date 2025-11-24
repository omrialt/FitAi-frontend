import { Container, Title, Text, Button, Stack, Group, Box, Grid, Card } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconBarbell, IconApple, IconChartLine, IconBrain, IconTarget, IconTrendingUp } from '@tabler/icons-react';

export function LandingHero() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <IconBarbell size={32} stroke={1.5} />,
      title: 'Training Plans',
      description: 'Structured workout programs tailored to your fitness level and goals.',
    },
    {
      icon: <IconApple size={32} stroke={1.5} />,
      title: 'Nutrition Programs',
      description: 'Personalized meal plans that fuel your performance and support recovery.',
    },
    {
      icon: <IconChartLine size={32} stroke={1.5} />,
      title: 'Progress Tracking',
      description: 'Monitor your improvements with detailed stats and visual insights.',
    },
    {
      icon: <IconBrain size={32} stroke={1.5} />,
      title: 'AI Recommendations',
      description: 'Smart suggestions that adapt to your progress and preferences.',
    },
    {
      icon: <IconTarget size={32} stroke={1.5} />,
      title: 'Goal Setting',
      description: 'Define clear objectives and track your journey toward achieving them.',
    },
    {
      icon: <IconTrendingUp size={32} stroke={1.5} />,
      title: 'Performance Analytics',
      description: 'Deep dive into your exercise performance and identify areas for growth.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          paddingTop: '60px',
          paddingBottom: '60px',
        }}
      >
        <Container size="lg">
          <Stack gap="xl" align="center" style={{ textAlign: 'center' }}>
            <Title
              order={1}
              size="3rem"
              fw={700}
              style={{
                lineHeight: 1.2,
                maxWidth: '800px',
              }}
            >
              Build Your Strongest, Healthiest Version
            </Title>
            
            <Text
              size="lg"
              style={{
                maxWidth: '700px',
                opacity: 0.95,
                lineHeight: 1.6,
              }}
            >
              FitAi is a clean, modern fitness and nutrition platform built to help you reach your goals with clarity and consistency.
            </Text>

            <Text
              size="md"
              style={{
                maxWidth: '650px',
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              Track your workouts, follow structured training plans, manage personalized meal programs, and monitor your progress — all in one intuitive dashboard.
            </Text>

            <Group gap="md" mt="md">
              <Button
                size="lg"
                variant="white"
                color="violet"
                onClick={() => navigate('/register')}
                style={{ minWidth: '150px' }}
              >
                Create Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                style={{
                  minWidth: '150px',
                  borderColor: 'white',
                  color: 'white',
                }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container size="xl" py={80}>
        <Stack gap="xl">
          <Stack gap="md" align="center" style={{ textAlign: 'center' }}>
            <Title order={2} size="2.5rem">
              Everything You Need in One Place
            </Title>
            <Text size="lg" c="dimmed" maw={700}>
              Powered by smart automation and thoughtful design, FitAi adapts to your lifestyle, your preferences, and your long-term fitness journey.
            </Text>
          </Stack>

          <Grid gutter="lg" mt="xl">
            {features.map((feature, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card shadow="sm" padding="xl" radius="md" withBorder h="100%">
                  <Stack gap="md">
                    <Box
                      style={{
                        color: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: 'rgba(102, 126, 234, 0.1)',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Title order={3} size="h4">
                      {feature.title}
                    </Title>
                    <Text c="dimmed" size="sm">
                      {feature.description}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          paddingTop: '50px',
          paddingBottom: '50px',
        }}
      >
        <Container size="md">
          <Stack gap="xl" align="center" style={{ textAlign: 'center' }}>
            <Title order={2} size="1.75rem">
              Ready to Start Your Journey?
            </Title>
            <Text size="md" style={{ opacity: 0.95, maxWidth: '600px' }}>
              Whether you're just getting started or pushing to the next level, everything you need is right here.
              Join us today and start building your strongest, healthiest version.
            </Text>
            <Group gap="md">
              <Button
                size="lg"
                variant="white"
                color="violet"
                onClick={() => navigate('/register')}
                style={{ minWidth: '150px' }}
              >
                Get Started Free
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
