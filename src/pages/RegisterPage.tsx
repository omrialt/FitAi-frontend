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
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useFormHandler } from '../hooks/useFormHandler';
import { authService } from '../services/auth.service';
import { usePresetMetadata } from '../hooks/useMetadata';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';
import '../styles/Auth.css';

function RegisterPage() {
  const { t } = useTranslation();
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
                {t('auth.registerTitle')}
              </Title>
              <Text size="sm" c="dimmed">
                {t('auth.registerSubtitle')}
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
              {t('auth.signUpWithGoogle')}
            </Button>

            <Divider label={t('auth.orSignUpWithEmail')} labelPosition="center" />

            {/* Register Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label={t('auth.fullName')}
                  placeholder={t('auth.fullNamePlaceholder')}
                  required
                  withAsterisk
                  {...register('fullName')}
                  error={errors.fullName?.message}
                />

                <TextInput
                  label={t('auth.email')}
                  placeholder={t('auth.emailPlaceholder')}
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
                      label={t('auth.gender')}
                      placeholder={t('auth.genderPlaceholder')}
                      required
                      withAsterisk
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
                      withAsterisk
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
                      withAsterisk
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
                      withAsterisk
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

                <PasswordInput
                  label={t('auth.password')}
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  withAsterisk
                  {...register('password')}
                  error={errors.password?.message}
                />

                <PasswordInput
                  label={t('auth.confirmPassword')}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
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
                  {t('auth.registerTitle')}
                </Button>
              </Stack>
            </form>

            {/* Login Link */}
            <Text size="sm" ta="center">
              {t('auth.haveAccount')}{' '}
              <Anchor component={Link} to="/login" fw={600}>
                {t('auth.signIn')}
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </div>
    </>
  );
}

export default RegisterPage;
