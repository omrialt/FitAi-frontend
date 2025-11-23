import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Center, Loader, Text, Stack } from '@mantine/core';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';

function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google authentication failed');
        navigate('/login');
        return;
      }

      if (!code) {
        toast.error('No authorization code received');
        navigate('/login');
        return;
      }

      try {
        const response = await authService.handleGoogleCallback(code);
        login(response.user, response.tokens);
        toast.success('Successfully signed in with Google!');
        navigate('/');
      } catch {
        toast.error('Failed to authenticate with Google');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <Container size="xs" style={{ minHeight: '100vh' }}>
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="lg" fw={500}>
            Authenticating with Google...
          </Text>
          <Text size="sm" c="dimmed">
            Please wait while we complete your sign in
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}

export default GoogleCallbackPage;
