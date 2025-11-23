import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Select,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Controller } from 'react-hook-form';
import { IconUserCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useFormHandler } from '../hooks/useFormHandler';
import { useApiMutation } from '../hooks/useApi';
import { completeProfileSchema, type CompleteProfileFormData } from '../schemas/auth.schemas';
import type { AuthTokens, User } from '../types/auth.types';
import './Auth.css';

function CompleteProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login } = useAuthStore();

  const { mutate, loading: isSubmitting } = useApiMutation<{ data: { user: User; tokens: AuthTokens } }>({
    showSuccessToast: false,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useFormHandler<CompleteProfileFormData>({
    schema: completeProfileSchema,
    mode: 'onTouched',
    onSubmit: async (data) => {
      if (!user?._id) {
        toast.error('User not authenticated');
        navigate('/login');
        return;
      }

      const fullName = `${data.firstName} ${data.lastName}`;
      
      const response = await mutate('/auth/complete-profile', {
        method: 'PATCH',
        data: {
          fullName,
          gender: data.gender,
          birthDate: data.birthDate.toISOString(),
          role: data.role,
          height: data.height,
        },
      });

      if (response?.data?.user && response?.data?.tokens) {
        login(response.data.user, response.data.tokens);
        toast.success('Profile completed successfully! Redirecting to dashboard...');
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 200);
      }
    },
  });

  // Handle OAuth callback - store tokens and user from URL params
  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userParam = searchParams.get('user');

    if (accessToken && refreshToken && userParam) {
      try {
        const userData = JSON.parse(userParam);
        login(userData, { accessToken, refreshToken });
        toast.success('Welcome! Please complete your profile to continue.');
      } catch {
        toast.error('Failed to process authentication data');
        navigate('/login');
      }
    }
  }, [searchParams, login, navigate]);

  // Pre-fill first name and last name from user's full name if available
  useEffect(() => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        setValue('firstName', names[0]);
        setValue('lastName', names.slice(1).join(' '));
      } else {
        setValue('firstName', names[0] || '');
      }
    }
  }, [user, setValue]);

  return (
    <>
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
                Complete Your Profile
              </Title>
              <Text size="sm" c="dimmed">
                Just a few more details to get started
              </Text>
            </div>

            {/* Complete Profile Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="First Name"
                  placeholder="John"
                  required
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />

                <TextInput
                  label="Last Name"
                  placeholder="Doe"
                  required
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Gender"
                      placeholder="Select your gender"
                      required
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

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  leftSection={<IconUserCheck size={18} />}
                  loading={isSubmitting}
                  gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                  variant="gradient"
                >
                  Complete Profile
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </div>
    </>
  );
}

export default CompleteProfilePage;
