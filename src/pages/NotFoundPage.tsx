import { Container, Title, Text, Button, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container size="md" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <Stack gap="lg" align="center">
        <Title order={1} size="4rem" c="dimmed">
          404
        </Title>
        <Title order={2}>{t('notFound.title')}</Title>
        <Text c="dimmed" size="lg">
          {t('notFound.text')}
        </Text>
        <Button size="md" onClick={() => navigate('/')}>
          {t('notFound.goHome')}
        </Button>
      </Stack>
    </Container>
  );
}
