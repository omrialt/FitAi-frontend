import { Container, Title, Text, Button, Stack, Group, Box, Grid, ThemeIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconBarbell, IconApple, IconChartLine, IconBrain, IconTarget, IconTrendingUp, IconBolt, IconShieldCheck } from '@tabler/icons-react';

export function LandingHero() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <IconBarbell size={26} stroke={1.5} />,
      title: 'Training Plans',
      description: 'Adaptive strength and conditioning programs designed for elite performance.',
      color: 'indigo',
    },
    {
      icon: <IconApple size={26} stroke={1.5} />,
      title: 'Nutrition Programs',
      description: 'Precision macro tracking and meal architecture for your goals.',
      color: 'green',
    },
    {
      icon: <IconChartLine size={26} stroke={1.5} />,
      title: 'Progress Tracking',
      description: 'Visual evolution via biometric data syncing and analytics.',
      color: 'blue',
    },
    {
      icon: <IconBrain size={26} stroke={1.5} />,
      title: 'AI Recommendations',
      description: 'Neural-mapped adjustments for your daily training load.',
      color: 'violet',
    },
    {
      icon: <IconTarget size={26} stroke={1.5} />,
      title: 'Goal Setting',
      description: 'Milestone mapping for long-term athletic dominance.',
      color: 'orange',
    },
    {
      icon: <IconTrendingUp size={26} stroke={1.5} />,
      title: 'Performance Analytics',
      description: 'Advanced metrics and metabolic insights in real time.',
      color: 'cyan',
    },
  ];

  return (
    <Box>
      {/* Hero Section — dark athletic */}
      <Box
        style={{
          background: 'linear-gradient(160deg, #0a0f1e 0%, #111827 60%, #1a1040 100%)',
          color: 'white',
          paddingTop: '88px',
          paddingBottom: '96px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <Box style={{ position: 'absolute', top: '-80px', right: '-60px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box style={{ position: 'absolute', bottom: '-120px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Grid gutter={60} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '100px',
                    padding: '6px 16px',
                    width: 'fit-content',
                  }}
                >
                  <IconBolt size={14} color="#818cf8" />
                  <Text size="xs" fw={600} style={{ color: '#818cf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Elite Performance Ready
                  </Text>
                </Box>

                <Title
                  order={1}
                  style={{
                    fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    letterSpacing: '-0.04em',
                    color: 'white',
                  }}
                >
                  Build Your Strongest,{' '}
                  <span style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Healthiest Version
                  </span>
                </Title>

                <Text
                  size="lg"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.75,
                    maxWidth: '520px',
                  }}
                >
                  The lab-grade athletic intelligence platform designed for those who demand precision. Track, analyze, and evolve with AI-driven insights.
                </Text>

                <Group gap="md">
                  <Button
                    size="lg"
                    variant="filled"
                    color="indigo"
                    onClick={() => navigate('/register')}
                    style={{ minWidth: '160px', fontWeight: 700, borderRadius: '10px' }}
                  >
                    Create Account
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    style={{
                      minWidth: '130px',
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '10px',
                      fontWeight: 600,
                    }}
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </Group>

                <Group gap="xl" mt="xs">
                  <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: 'white' }}>50K+</Text>
                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Athletes</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: 'white' }}>98%</Text>
                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Satisfaction</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: 'white' }}>+14.2%</Text>
                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Avg. Performance Gain</Text>
                  </Stack>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              {/* Dashboard preview mock */}
              <Box
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '28px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <Box style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                    <Box style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                    <Box style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
                  </Group>
                  <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Performance Lab Dashboard</Text>
                </Group>

                <Stack gap="sm">
                  {[
                    { label: 'Training Plans', value: '4 active', color: '#818cf8' },
                    { label: 'Workouts this week', value: '5 sessions', color: '#34d399' },
                    { label: 'Calories tracked', value: '3,200 kcal', color: '#fb923c' },
                    { label: 'AI Insights', value: '3 new', color: '#a78bfa' },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text size="sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.label}</Text>
                      <Text size="sm" fw={700} style={{ color: item.color }}>{item.value}</Text>
                    </Box>
                  ))}
                </Stack>

                <Box
                  style={{
                    marginTop: 16,
                    background: 'linear-gradient(90deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
                    border: '1px solid rgba(99,102,241,0.4)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <IconBolt size={16} color="#818cf8" />
                  <Text size="sm" fw={600} style={{ color: 'white' }}>Performance Gain</Text>
                  <Text size="sm" fw={800} style={{ color: '#a3e635', marginLeft: 'auto' }}>+14.2%</Text>
                </Box>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box style={{ background: '#f8fafc', paddingTop: 80, paddingBottom: 80 }}>
        <Container size="xl">
          <Stack gap="xl">
            <Stack gap="sm" align="center" style={{ textAlign: 'center' }}>
              <Text
                size="xs"
                fw={700}
                style={{
                  color: '#6366f1',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Engineered for Results
              </Text>
              <Title
                order={2}
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}
              >
                Our modular ecosystem bridges the gap between effort and elite performance.
              </Title>
              <Text size="lg" c="dimmed" maw={640} style={{ lineHeight: 1.7 }}>
                Every tool is purpose-built for athletes who demand more from their training technology.
              </Text>
            </Stack>

            <Grid gutter="lg" mt="sm">
              {features.map((feature, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                  <Box
                    className="landing-feature-card"
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '28px',
                      height: '100%',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                      cursor: 'default',
                    }}
                  >
                    <Stack gap="md">
                      <ThemeIcon
                        size={52}
                        radius="md"
                        variant="light"
                        color={feature.color}
                      >
                        {feature.icon}
                      </ThemeIcon>
                      <Title order={3} style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        {feature.title}
                      </Title>
                      <Text c="dimmed" size="sm" style={{ lineHeight: 1.65 }}>
                        {feature.description}
                      </Text>
                    </Stack>
                  </Box>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Science Section */}
      <Box style={{ background: '#0f172a', paddingTop: 72, paddingBottom: 72 }}>
        <Container size="lg">
          <Grid gutter={60} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="lg">
                <Title
                  order={2}
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'white',
                  }}
                >
                  Elite Training is a Science, Not a Guess.
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
                  Access the same protocols used by world-class athletes. Real-time data synchronization with all major wearables and an AI engine that learns your patterns.
                </Text>
                <Group gap="xl">
                  <Stack gap={2}>
                    <Group gap={6}>
                      <IconBolt size={16} color="#a3e635" />
                      <Text fw={700} size="sm" style={{ color: 'white' }}>Daily Load</Text>
                    </Group>
                    <Text size="xs" style={{ color: '#a3e635' }}>94% Optimized</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Group gap={6}>
                      <IconShieldCheck size={16} color="#34d399" />
                      <Text fw={700} size="sm" style={{ color: 'white' }}>Recovery</Text>
                    </Group>
                    <Text size="xs" style={{ color: '#34d399' }}>8.2h Peak State</Text>
                  </Stack>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '16px',
                  padding: '28px',
                }}
              >
                <Stack gap="sm">
                  {[
                    { label: 'Lab-Tested Metrics', desc: 'Real-time sync with all major wearables', icon: <IconChartLine size={18} />, color: '#818cf8' },
                    { label: 'AI Coaching Engine', desc: 'Adapts daily based on your biometric data', icon: <IconBrain size={18} />, color: '#a78bfa' },
                    { label: 'Progressive Overload', desc: 'Auto-adjusting intensity protocols', icon: <IconBarbell size={18} />, color: '#60a5fa' },
                  ].map((item) => (
                    <Group key={item.label} gap="md" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
                      <ThemeIcon variant="light" color="indigo" size="md" radius="md">
                        {item.icon}
                      </ThemeIcon>
                      <Stack gap={2}>
                        <Text size="sm" fw={600} style={{ color: 'white' }}>{item.label}</Text>
                        <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</Text>
                      </Stack>
                    </Group>
                  ))}
                </Stack>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          paddingTop: '72px',
          paddingBottom: '72px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box style={{ position: 'absolute', top: '-60px', right: '-40px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
          <Stack gap="lg" align="center" style={{ textAlign: 'center' }}>
            <Title
              order={2}
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'white',
              }}
            >
              Ready to Outperform Your Former Self?
            </Title>
            <Text size="lg" style={{ opacity: 0.88, maxWidth: '520px', lineHeight: 1.7, color: 'white' }}>
              Join 50,000+ athletes using FitAi to push boundaries and achieve lasting results.
            </Text>
            <Group gap="md">
              <Button
                size="lg"
                variant="white"
                color="violet"
                onClick={() => navigate('/register')}
                style={{ minWidth: '180px', fontWeight: 700, borderRadius: '10px' }}
              >
                Get Started Now
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box style={{ background: '#0a0f1e', paddingTop: 48, paddingBottom: 48 }}>
        <Container size="xl">
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="sm">
                <Text fw={800} size="lg" style={{ color: 'white', letterSpacing: '-0.02em' }}>FitAi</Text>
                <Text size="sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: 280 }}>
                  Building the future of athletic performance through intelligence and data.
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Stack gap="sm">
                <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Product</Text>
                {['Workouts', 'Nutrition', 'AI Engine'].map((l) => (
                  <Text key={l} size="sm" style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{l}</Text>
                ))}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Stack gap="sm">
                <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company</Text>
                {['About', 'Science', 'Careers'].map((l) => (
                  <Text key={l} size="sm" style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{l}</Text>
                ))}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Stack gap="sm">
                <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Support</Text>
                {['Privacy', 'Terms', 'Contact'].map((l) => (
                  <Text key={l} size="sm" style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{l}</Text>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>
          <Box style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 40, paddingTop: 24 }}>
            <Text size="xs" style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              © 2026 Performance Lab. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
