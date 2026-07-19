import { Container, Title, Text, Button, Stack, Group, Box, Grid, ThemeIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconBarbell, IconApple, IconChartLine, IconBrain, IconTarget, IconTrendingUp, IconBolt, IconShieldCheck } from '@tabler/icons-react';

export function LandingHero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: <IconBarbell size={26} stroke={1.5} />,
      title: t('landing.featTrainingTitle'),
      description: t('landing.featTrainingDesc'),
      color: 'indigo',
    },
    {
      icon: <IconApple size={26} stroke={1.5} />,
      title: t('landing.featNutritionTitle'),
      description: t('landing.featNutritionDesc'),
      color: 'green',
    },
    {
      icon: <IconChartLine size={26} stroke={1.5} />,
      title: t('landing.featProgressTitle'),
      description: t('landing.featProgressDesc'),
      color: 'blue',
    },
    {
      icon: <IconBrain size={26} stroke={1.5} />,
      title: t('landing.featAiTitle'),
      description: t('landing.featAiDesc'),
      color: 'violet',
    },
    {
      icon: <IconTarget size={26} stroke={1.5} />,
      title: t('landing.featGoalsTitle'),
      description: t('landing.featGoalsDesc'),
      color: 'orange',
    },
    {
      icon: <IconTrendingUp size={26} stroke={1.5} />,
      title: t('landing.featAnalyticsTitle'),
      description: t('landing.featAnalyticsDesc'),
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
                    {t('landing.badge')}
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
                  {t('landing.heroTitle1')}{' '}
                  <span style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {t('landing.heroTitle2')}
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
                  {t('landing.heroSubtitle')}
                </Text>

                <Group gap="md">
                  <Button
                    size="lg"
                    variant="filled"
                    color="indigo"
                    onClick={() => navigate('/register')}
                    style={{ minWidth: '160px', fontWeight: 700, borderRadius: '10px' }}
                  >
                    {t('auth.registerTitle')}
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
                    {t('auth.signIn')}
                  </Button>
                </Group>

                <Group gap="xl" mt="xs">
                  <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: 'white' }}>50K+</Text>
                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('landing.statAthletes')}</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: 'white' }}>98%</Text>
                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('landing.statSatisfaction')}</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: 'white' }}>+14.2%</Text>
                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('landing.statGain')}</Text>
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
                  <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('landing.mockTitle')}</Text>
                </Group>

                <Stack gap="sm">
                  {[
                    { label: t('landing.mockTrainingPlans'), value: t('landing.mockTrainingValue'), color: '#818cf8' },
                    { label: t('landing.mockWorkouts'), value: t('landing.mockWorkoutsValue'), color: '#34d399' },
                    { label: t('landing.mockCalories'), value: t('landing.mockCaloriesValue'), color: '#fb923c' },
                    { label: t('landing.mockInsights'), value: t('landing.mockInsightsValue'), color: '#a78bfa' },
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
                  <Text size="sm" fw={600} style={{ color: 'white' }}>{t('landing.performanceGain')}</Text>
                  <Text size="sm" fw={800} style={{ color: '#a3e635', marginInlineStart: 'auto' }}>+14.2%</Text>
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
                {t('landing.featuresKicker')}
              </Text>
              <Title
                order={2}
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}
              >
                {t('landing.featuresTitle')}
              </Title>
              <Text size="lg" c="dimmed" maw={640} style={{ lineHeight: 1.7 }}>
                {t('landing.featuresSubtitle')}
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
                  {t('landing.scienceTitle')}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
                  {t('landing.scienceText')}
                </Text>
                <Group gap="xl">
                  <Stack gap={2}>
                    <Group gap={6}>
                      <IconBolt size={16} color="#a3e635" />
                      <Text fw={700} size="sm" style={{ color: 'white' }}>{t('landing.dailyLoad')}</Text>
                    </Group>
                    <Text size="xs" style={{ color: '#a3e635' }}>{t('landing.dailyLoadValue')}</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Group gap={6}>
                      <IconShieldCheck size={16} color="#34d399" />
                      <Text fw={700} size="sm" style={{ color: 'white' }}>{t('landing.recovery')}</Text>
                    </Group>
                    <Text size="xs" style={{ color: '#34d399' }}>{t('landing.recoveryValue')}</Text>
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
                    { label: t('landing.metricLabTitle'), desc: t('landing.metricLabDesc'), icon: <IconChartLine size={18} />, color: '#818cf8' },
                    { label: t('landing.metricAiTitle'), desc: t('landing.metricAiDesc'), icon: <IconBrain size={18} />, color: '#a78bfa' },
                    { label: t('landing.metricOverloadTitle'), desc: t('landing.metricOverloadDesc'), icon: <IconBarbell size={18} />, color: '#60a5fa' },
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
              {t('landing.ctaTitle')}
            </Title>
            <Text size="lg" style={{ opacity: 0.88, maxWidth: '520px', lineHeight: 1.7, color: 'white' }}>
              {t('landing.ctaText')}
            </Text>
            <Group gap="md">
              <Button
                size="lg"
                variant="white"
                color="violet"
                onClick={() => navigate('/register')}
                style={{ minWidth: '180px', fontWeight: 700, borderRadius: '10px' }}
              >
                {t('landing.getStarted')}
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
                  {t('landing.footerTagline')}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Stack gap="sm">
                <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('landing.footerProduct')}</Text>
                {[t('landing.footerWorkouts'), t('landing.footerNutrition'), t('landing.footerAiEngine')].map((l) => (
                  <Text key={l} size="sm" style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{l}</Text>
                ))}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Stack gap="sm">
                <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('landing.footerCompany')}</Text>
                {[t('landing.footerAbout'), t('landing.footerScience'), t('landing.footerCareers')].map((l) => (
                  <Text key={l} size="sm" style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{l}</Text>
                ))}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Stack gap="sm">
                <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('landing.footerSupport')}</Text>
                {[t('landing.footerPrivacy'), t('landing.footerTerms'), t('landing.footerContact')].map((l) => (
                  <Text key={l} size="sm" style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{l}</Text>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>
          <Box style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 40, paddingTop: 24 }}>
            <Text size="xs" style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              {t('landing.footerCopyright')}
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
