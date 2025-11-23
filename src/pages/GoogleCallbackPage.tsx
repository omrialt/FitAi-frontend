import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Center, Loader, Text, Stack } from '@mantine/core';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get('error');
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const userStr = searchParams.get('user');

      if (error) {
        toast.error('Google authentication failed');
        navigate('/login');
        return;
      }

      if (!accessToken || !refreshToken || !userStr) {
        toast.error('Failed to authenticate with Google');
        navigate('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        const tokens = { accessToken, refreshToken };
        
        // Check if user needs to complete profile (missing required fields)
        const needsProfileCompletion = !user.gender || !user.birthDate || !user.role;
        
        login(user, tokens);
        
        if (needsProfileCompletion) {
          toast.info('Please complete your profile');
          navigate('/complete-profile');
        } else {
          toast.success('Successfully signed in with Google!');
          navigate('/');
        }
      } catch (err) {
        toast.error('Failed to process authentication data');
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
