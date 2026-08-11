import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Center, Loader, Text, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import type { User, AuthTokens } from '../types/auth.types';

/** A session handed over the old way: tokens and the user inside the URL. */
interface GoogleSession {
  user: User;
  tokens: AuthTokens;
  needsProfile: boolean;
}

/**
 * Read the pre-exchange redirect format.
 *
 * Kept only so this page survives being deployed ahead of the backend that
 * issues codes. Delete it once both sides are live — leaving tokens readable
 * from a URL is the thing this change exists to stop.
 */
function readLegacyTokens(params: URLSearchParams): GoogleSession | null {
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  const userStr = params.get('user');

  if (!accessToken || !refreshToken || !userStr) return null;

  return {
    user: JSON.parse(userStr) as User,
    tokens: { accessToken, refreshToken },
    needsProfile: false,
  };
}

function GoogleCallbackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get('error');

      if (error) {
        toast.error(t('auth.googleAuthFailed'));
        navigate('/login');
        return;
      }

      try {
        // The backend now redirects with a single-use code instead of the
        // tokens themselves. The legacy parameters are still read below so
        // this page keeps working against a backend that has not been
        // deployed yet — the two repos deploy separately.
        const code = searchParams.get('code');
        const session = code
          ? await authService.exchangeGoogleCode(code)
          : readLegacyTokens(searchParams);

        if (!session) {
          toast.error(t('auth.googleAuthFailed'));
          navigate('/login');
          return;
        }

        const { user, tokens } = session;

        // Check if user needs to complete profile (missing required fields)
        const needsProfileCompletion =
          session.needsProfile || !user.gender || !user.birthDate || !user.role;

        login(user, tokens);

        if (needsProfileCompletion) {
          toast.info(t('auth.pleaseCompleteProfile'));
          navigate('/complete-profile');
        } else {
          toast.success(t('auth.googleSignInSuccess'));
          navigate('/');
        }
      } catch {
        toast.error(t('auth.authDataError'));
        navigate('/login');
      }
    };

    void handleCallback();
    // `t` is deliberately not a dependency: the code is single-use, so
    // re-running this effect on a language switch would redeem it twice and
    // the second attempt would fail.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
