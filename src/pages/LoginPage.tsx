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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { usePresetMetadata } from '../hooks/useMetadata';
import './Auth.css';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const { login, isLoading } = useAuth();
  const metadata = usePresetMetadata('login', {
    preconnect: ['https://accounts.google.com'],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Navigation is handled by useAuth hook
    } catch (error) {
      // Error handling is done by useAuth hook
      console.error('Login error:', error);
    }
  };

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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  {...register('email')}
                  error={errors.email?.message}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
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
                  loading={isLoading}
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
