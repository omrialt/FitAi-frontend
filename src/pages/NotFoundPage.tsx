import { Container, Title, Text, Button, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container size="md" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <Stack gap="lg" align="center">
        <Title order={1} size="4rem" c="dimmed">
          404
        </Title>
        <Title order={2}>Page Not Found</Title>
        <Text c="dimmed" size="lg">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Button size="md" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Stack>
    </Container>
  );
}
