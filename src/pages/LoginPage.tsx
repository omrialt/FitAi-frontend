import { Link } from 'react-router-dom';
import {
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Divider,
  Group,
  Anchor,
} from '@mantine/core';
import { IconBrandGoogle, IconLogin } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useFormHandler } from '../hooks/useFormHandler';
import { authService } from '../services/auth.service';
import { usePresetMetadata } from '../hooks/useMetadata';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import '../styles/Auth.css';

function LoginPage() {
  const { login } = useAuth();
  const metadata = usePresetMetadata('login', {
    preconnect: ['https://accounts.google.com'],
  });

  const {
    register,
    handleSubmit,
    isSubmitting,
    formState: { errors },
  } = useFormHandler<LoginFormData>({
    schema: loginSchema,
    onSubmit: async (data) => {
      await login(data);
    },
    showErrorToast: false, // useAuth handles toast notifications
    mode: 'onTouched', // Validate on blur and submit
  });

  const handleGoogleLogin = () => {
    // Initiate Google OAuth flow
    authService.loginWithGoogle();
  };

  return (
    <>
      {metadata}
      <div 
        className="auth-container"
        style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          shadow="xl"
          p="xl"
          radius="md"
          withBorder
          className="auth-card"
          style={{
            width: '100%',
            maxWidth: '420px',
            margin: '0 auto',
          }}
        >
          <Stack gap="md">
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <Title order={2} mb="xs">
                Welcome Back
              </Title>
              <Text size="sm" c="dimmed">
                Sign in to your FitAI account
              </Text>
            </div>

            {/* Google Login Button */}
            <Button
              variant="default"
              size="md"
              leftSection={<IconBrandGoogle size={18} />}
              onClick={handleGoogleLogin}
              fullWidth
            >
              Continue with Google
            </Button>

            <Divider label="Or continue with email" labelPosition="center" />

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  withAsterisk
                  {...register('email')}
                  error={errors.email?.message}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  withAsterisk
                  {...register('password')}
                  error={errors.password?.message}
                />

                <Group justify="space-between">
                  <Anchor component={Link} to="/forgot-password" size="sm">
                    Forgot password?
                  </Anchor>
                </Group>

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  leftSection={<IconLogin size={18} />}
                  loading={isSubmitting}
                  gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                  variant="gradient"
                  className="auth-button"
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            {/* Register Link */}
            <Text size="sm" ta="center">
              Don't have an account?{' '}
              <Anchor component={Link} to="/register" fw={600}>
                Sign up
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </div>
    </>
  );
}

export default LoginPage;
