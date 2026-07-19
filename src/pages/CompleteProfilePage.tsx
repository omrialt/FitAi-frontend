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
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useFormHandler } from '../hooks/useFormHandler';
import { useApiMutation } from '../hooks/useApi';
import { completeProfileSchema, type CompleteProfileFormData } from '../schemas/auth.schemas';
import type { AuthTokens, User } from '../types/auth.types';
import '../styles/Auth.css';

function CompleteProfilePage() {
  const { t } = useTranslation();
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
        toast.error(t('auth.notAuthenticated'));
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
          target: data.target,
        },
      });

      if (response?.data?.user && response?.data?.tokens) {
        login(response.data.user, response.data.tokens);
        toast.success(t('auth.profileCompleted'));
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
        toast.success(t('auth.welcomeCompleteProfile'));
      } catch {
        toast.error(t('auth.authDataError'));
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
                {t('auth.completeProfileTitle')}
              </Title>
              <Text size="sm" c="dimmed">
                {t('auth.completeProfileSubtitle')}
              </Text>
            </div>

            {/* Complete Profile Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label={t('auth.firstName')}
                  placeholder={t('auth.firstNamePlaceholder')}
                  required
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />

                <TextInput
                  label={t('auth.lastName')}
                  placeholder={t('auth.lastNamePlaceholder')}
                  required
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('auth.gender')}
                      placeholder={t('auth.genderPlaceholder')}
                      required
                      data={[
                        { value: 'male', label: t('auth.male') },
                        { value: 'female', label: t('auth.female') },
                        { value: 'other', label: t('auth.other') },
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
                      label={t('auth.iAmA')}
                      placeholder={t('auth.rolePlaceholder')}
                      required
                      data={[
                        { value: 'user', label: t('auth.roleUser') },
                        { value: 'trainer', label: t('auth.roleTrainer') },
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
                      label={t('auth.birthDate')}
                      placeholder={t('common.pickDate')}
                      required
                      maxDate={new Date()}
                      {...field}
                      error={errors.birthDate?.message}
                    />
                  )}
                />

                <TextInput
                  label={t('auth.heightCm')}
                  placeholder="170"
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  error={errors.height?.message}
                />

                <Controller
                  name="target"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('trainings.form.fitnessGoal')}
                      placeholder={t('auth.goalPlaceholder')}
                      required
                      data={[
                        { value: 'maintain', label: t('trainings.form.maintainWeight') },
                        { value: 'cut', label: t('trainings.form.cutWeight') },
                        { value: 'bulk', label: t('trainings.form.bulkWeight') },
                      ]}
                      {...field}
                      error={errors.target?.message}
                    />
                  )}
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
                  {t('auth.completeProfileButton')}
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
