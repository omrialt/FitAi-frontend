import { Container, Title, Text, Button, Stack, Group, Box, Grid, Card, ThemeIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconBarbell, IconApple, IconChartLine, IconBrain, IconTarget, IconTrendingUp } from '@tabler/icons-react';

export function LandingHero() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <IconBarbell size={28} stroke={1.5} />,
      title: 'Training Plans',
      description: 'Structured workout programs tailored to your fitness level and goals.',
      color: 'indigo',
    },
    {
      icon: <IconApple size={28} stroke={1.5} />,
      title: 'Nutrition Programs',
      description: 'Personalized meal plans that fuel your performance and support recovery.',
      color: 'green',
    },
    {
      icon: <IconChartLine size={28} stroke={1.5} />,
      title: 'Progress Tracking',
      description: 'Monitor your improvements with detailed stats and visual insights.',
      color: 'blue',
    },
    {
      icon: <IconBrain size={28} stroke={1.5} />,
      title: 'AI Recommendations',
      description: 'Smart suggestions that adapt to your progress and preferences.',
      color: 'violet',
    },
    {
      icon: <IconTarget size={28} stroke={1.5} />,
      title: 'Goal Setting',
      description: 'Define clear objectives and track your journey toward achieving them.',
      color: 'orange',
    },
    {
      icon: <IconTrendingUp size={28} stroke={1.5} />,
      title: 'Performance Analytics',
      description: 'Deep dive into your exercise performance and identify areas for growth.',
      color: 'cyan',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          paddingTop: '80px',
          paddingBottom: '80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box style={{ position: 'absolute', top: '-80px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box style={{ position: 'absolute', bottom: '-100px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
          <Stack gap="xl" align="center" style={{ textAlign: 'center' }}>
            <Title
              order={1}
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                maxWidth: '820px',
                color: 'white',
              }}
            >
              Build Your Strongest,{' '}
              <span style={{ opacity: 0.92 }}>Healthiest Version</span>
            </Title>
            
            <Text
              size="lg"
              style={{
                maxWidth: '680px',
                opacity: 0.93,
                lineHeight: 1.7,
                letterSpacing: '-0.01em',
                color: 'white',
              }}
            >
              FitAi is a high-performance fitness and nutrition platform built to help you reach your goals with clarity and consistency.
            </Text>

            <Text
              size="md"
              style={{
                maxWidth: '620px',
                opacity: 0.85,
                lineHeight: 1.7,
                color: 'white',
              }}
            >
              Track your workouts, follow structured training plans, manage personalized meal programs, and monitor your progress — all in one intuitive dashboard.
            </Text>

            <Group gap="md" mt="sm">
              <Button
                size="lg"
                variant="white"
                color="violet"
                onClick={() => navigate('/register')}
                style={{ minWidth: '160px', fontWeight: 600, borderRadius: '8px' }}
              >
                Create Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                style={{
                  minWidth: '150px',
                  borderColor: 'rgba(255,255,255,0.7)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 600,
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
      <Container size="xl" py={90}>
        <Stack gap="xl">
          <Stack gap="sm" align="center" style={{ textAlign: 'center' }}>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              Everything You Need in One Place
            </Title>
            <Text size="lg" c="dimmed" maw={680} style={{ letterSpacing: '-0.01em', lineHeight: 1.7 }}>
              Powered by smart automation and thoughtful design, FitAi adapts to your lifestyle, your preferences, and your long-term fitness journey.
            </Text>
          </Stack>

          <Grid gutter="lg" mt="lg">
            {features.map((feature, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card
                  shadow="xs"
                  padding="xl"
                  radius="md"
                  withBorder
                  h="100%"
                  style={{
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    cursor: 'default',
                  }}
                  className="landing-feature-card"
                >
                  <Stack gap="md">
                    <ThemeIcon
                      size={56}
                      radius="md"
                      variant="light"
                      color={feature.color}
                    >
                      {feature.icon}
                    </ThemeIcon>
                    <Title order={3} style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                      {feature.title}
                    </Title>
                    <Text c="dimmed" size="sm" style={{ lineHeight: 1.65 }}>
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
          background: 'linear-gradient(135deg, #6366f1 0%, #764ba2 100%)',
          color: 'white',
          paddingTop: '64px',
          paddingBottom: '64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box style={{ position: 'absolute', top: '-60px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
          <Stack gap="lg" align="center" style={{ textAlign: 'center' }}>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'white',
              }}
            >
              Ready to Start Your Journey?
            </Title>
            <Text size="md" style={{ opacity: 0.9, maxWidth: '560px', lineHeight: 1.7, color: 'white' }}>
              Whether you're just getting started or pushing to the next level, everything you need is right here.
              Join today and start building your strongest, healthiest version.
            </Text>
            <Group gap="md">
              <Button
                size="lg"
                variant="white"
                color="violet"
                onClick={() => navigate('/register')}
                style={{ minWidth: '160px', fontWeight: 600, borderRadius: '8px' }}
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
