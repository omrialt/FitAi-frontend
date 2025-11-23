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
  Select,
  Anchor,
} from '@mantine/core';
import { IconBrandGoogle, IconUserPlus } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { Controller } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useFormHandler } from '../hooks/useFormHandler';
import { authService } from '../services/auth.service';
import { usePresetMetadata } from '../hooks/useMetadata';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';
import '../styles/Auth.css';

function RegisterPage() {
  const { register: registerUser } = useAuth();
  const metadata = usePresetMetadata('register', {
    preconnect: ['https://accounts.google.com'],
  });

  const {
    register,
    handleSubmit,
    control,
    isSubmitting,
    formState: { errors },
  } = useFormHandler<RegisterFormData>({
    schema: registerSchema,
    onSubmit: async (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      await registerUser({
        ...registerData,
        birthDate: data.birthDate.toISOString(),
      });
    },
    showErrorToast: false, // useAuth handles toast notifications
    mode: 'onTouched', // Validate on blur and submit
  });

  const handleGoogleSignup = () => {
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
                Create Account
              </Title>
              <Text size="sm" c="dimmed">
                Join FitAI and start your fitness journey
              </Text>
            </div>

            {/* Google Signup Button */}
            <Button
              variant="default"
              size="md"
              leftSection={<IconBrandGoogle size={18} />}
              onClick={handleGoogleSignup}
              fullWidth
            >
              Sign up with Google
            </Button>

            <Divider label="Or sign up with email" labelPosition="center" />

            {/* Register Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  required
                  withAsterisk
                  {...register('fullName')}
                  error={errors.fullName?.message}
                />

                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  withAsterisk
                  {...register('email')}
                  error={errors.email?.message}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Gender"
                      placeholder="Select your gender"
                      required
                      withAsterisk
                      data={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                      ]}
                      {...field}
                      error={errors.gender?.message}
                    />
                  )}
                />

                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="I am a"
                      placeholder="Select your role"
                      required
                      withAsterisk
                      data={[
                        { value: 'user', label: 'Athlete / User' },
                        { value: 'trainer', label: 'Trainer / Coach' },
                      ]}
                      {...field}
                      error={errors.role?.message}
                    />
                  )}
                />

                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      label="Birth Date"
                      placeholder="Pick date"
                      required
                      withAsterisk
                      maxDate={new Date()}
                      {...field}
                      error={errors.birthDate?.message}
                    />
                  )}
                />

                <TextInput
                  label="Height (cm)"
                  placeholder="170"
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  error={errors.height?.message}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  withAsterisk
                  {...register('password')}
                  error={errors.password?.message}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  required
                  withAsterisk
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  leftSection={<IconUserPlus size={18} />}
                  loading={isSubmitting}
                  gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                  variant="gradient"
                >
                  Create Account
                </Button>
              </Stack>
            </form>

            {/* Login Link */}
            <Text size="sm" ta="center">
              Already have an account?{' '}
              <Anchor component={Link} to="/login" fw={600}>
                Sign in
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </div>
    </>
  );
}

export default RegisterPage;
