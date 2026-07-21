import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAuthStore } from '../store/authStore';
import { useFormHandler } from '../hooks/useFormHandler';
import { useApiMutation } from '../hooks/useApi';
import { completeProfileSchema, type CompleteProfileFormData } from '../schemas/auth.schemas';
import type { AuthTokens, User } from '../types/auth.types';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField, AuthSelect, AuthSubmit } from '../components/auth/AuthField';

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

  const genderOptions = [
    { value: 'male', label: t('auth.male') },
    { value: 'female', label: t('auth.female') },
    { value: 'other', label: t('auth.other') },
  ];

  const roleOptions = [
    { value: 'user', label: t('auth.roleUser') },
    { value: 'trainer', label: t('auth.roleTrainer') },
  ];

  const goalOptions = [
    { value: 'maintain', label: t('profile.maintainWeight') },
    { value: 'cut', label: t('profile.cutWeight') },
    { value: 'bulk', label: t('profile.bulkWeight') },
  ];

  return (
    <AuthLayout
      title={t('auth.completeProfileTitle')}
      subtitle={t('auth.completeProfileSubtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <AuthField
            id="firstName"
            label={t('auth.firstName')}
            icon="person"
            placeholder={t('auth.firstNamePlaceholder')}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <AuthField
            id="lastName"
            label={t('auth.lastName')}
            icon="person"
            placeholder={t('auth.lastNamePlaceholder')}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <AuthSelect
                id="gender"
                label={t('auth.gender')}
                icon="person"
                placeholder={t('auth.genderPlaceholder')}
                options={genderOptions}
                error={errors.gender?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <AuthSelect
                id="role"
                label={t('auth.iAmA')}
                icon="verified_user"
                placeholder={t('auth.rolePlaceholder')}
                options={roleOptions}
                error={errors.role?.message}
                {...field}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => {
              const value =
                field.value instanceof Date
                  ? field.value.toISOString().split('T')[0]
                  : (field.value ?? '');
              return (
                <AuthField
                  id="birthDate"
                  label={t('auth.birthDate')}
                  icon="event"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={value as string}
                  onChange={(e) =>
                    field.onChange(e.target.value ? new Date(e.target.value) : null)
                  }
                  error={errors.birthDate?.message}
                />
              );
            }}
          />
          <AuthField
            id="height"
            label={t('auth.heightCm')}
            icon="monitor_weight"
            type="number"
            min={50}
            max={300}
            placeholder={t('profile.heightPlaceholder')}
            error={errors.height?.message}
            {...register('height', { valueAsNumber: true })}
          />
        </div>

        <Controller
          name="target"
          control={control}
          render={({ field }) => (
            <AuthSelect
              id="target"
              label={t('trainings.form.fitnessGoal')}
              icon="track_changes"
              placeholder={t('auth.goalPlaceholder')}
              options={goalOptions}
              error={errors.target?.message}
              {...field}
            />
          )}
        />

        <AuthSubmit loading={isSubmitting}>
          {t('auth.completeProfileButton')}
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}

export default CompleteProfilePage;
