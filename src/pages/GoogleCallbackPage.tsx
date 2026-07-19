import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Center, Loader, Text, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

function GoogleCallbackPage() {
  const { t } = useTranslation();
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
        toast.error(t('auth.googleAuthFailed'));
        navigate('/login');
        return;
      }

      if (!accessToken || !refreshToken || !userStr) {
        toast.error(t('auth.googleAuthFailed'));
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
          toast.info(t('auth.pleaseCompleteProfile'));
          navigate('/complete-profile');
        } else {
          toast.success(t('auth.googleSignInSuccess'));
          navigate('/');
        }
      } catch (err) {
        toast.error(t('auth.authDataError'));
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
            {t('auth.authenticatingGoogle')}
          </Text>
          <Text size="sm" c="dimmed">
            {t('auth.pleaseWaitSignIn')}
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}

export default GoogleCallbackPage;
