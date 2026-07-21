import { Link } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../hooks/useAuth';
import { useFormHandler } from '../hooks/useFormHandler';
import { authService } from '../services/auth.service';
import { usePresetMetadata } from '../hooks/useMetadata';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';
import { AuthLayout } from '../components/auth/AuthLayout';
import {
  AuthField,
  AuthSelect,
  AuthSubmit,
  GoogleButton,
  AuthDivider,
} from '../components/auth/AuthField';

/** Register — "Performance Lab" design. */
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
    mode: 'onTouched',
  });

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
    <>
      {metadata}
      <AuthLayout
        title={t('auth.registerTitle')}
        subtitle={t('auth.registerSubtitle')}
      >
        <div className="space-y-4">
          <GoogleButton
            label={t('auth.signUpWithGoogle')}
            onClick={() => authService.loginWithGoogle()}
          />

          <AuthDivider label={t('auth.orSignUpWithEmail')} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthField
              id="fullName"
              label={t('auth.fullName')}
              icon="person"
              placeholder={t('auth.fullNamePlaceholder')}
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <AuthField
              id="email"
              label={t('auth.workEmail')}
              icon="mail"
              type="email"
              placeholder={t('auth.workEmailPlaceholder')}
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

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
                  // A native date input keeps one visual language across the
                  // form and avoids shipping a picker just for this field.
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
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : null,
                        )
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

            <AuthField
              id="password"
              label={t('auth.password')}
              icon="lock"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <AuthField
              id="confirmPassword"
              label={t('auth.confirmPassword')}
              icon="lock"
              type="password"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <AuthSubmit loading={isSubmitting}>
              {t('auth.registerButton')}
            </AuthSubmit>
          </form>

          <p className="text-sm text-center text-on-surface-variant pt-2">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </AuthLayout>
    </>
  );
}

export default RegisterPage;
