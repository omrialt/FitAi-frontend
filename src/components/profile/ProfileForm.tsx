import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AuthField, AuthSelect } from '../auth/AuthField';
import type { ProfileFormProps } from '../../types/profile.types';

/**
 * Profile edit form — "Performance Lab" design.
 *
 * Reuses the auth form primitives so inputs look the same everywhere a user
 * types into this app.
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  errors,
  control,
  isGoogleAuth,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation();

  const genderOptions = [
    { value: 'male', label: t('profile.male') },
    { value: 'female', label: t('profile.female') },
    { value: 'other', label: t('profile.other') },
  ];

  const goalOptions = [
    { value: 'maintain', label: t('profile.maintainWeight') },
    { value: 'cut', label: t('profile.cutWeight') },
    { value: 'bulk', label: t('profile.bulkWeight') },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 lg:p-8 border border-outline-variant/10">
      <h3 className="text-lg font-extrabold tracking-tight text-on-surface mb-6">
        {t('profile.editProfile')}
      </h3>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <AuthField
                id="fullName"
                label={t('profile.fullName')}
                icon="person"
                placeholder={t('profile.fullNamePlaceholder')}
                error={errors.fullName?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <AuthField
                id="email"
                label={t('profile.email')}
                icon="mail"
                type="email"
                placeholder={t('profile.emailPlaceholder')}
                readOnly={isGoogleAuth}
                disabled={isGoogleAuth}
                error={
                  errors.email?.message ??
                  (isGoogleAuth ? t('profile.emailLockedGoogle') : undefined)
                }
                {...field}
              />
            )}
          />

          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <AuthField
                id="birthDate"
                label={t('profile.birthDate')}
                icon="event"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={(field.value as string) ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
                error={errors.birthDate?.message}
              />
            )}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <AuthSelect
                id="gender"
                label={t('profile.gender')}
                icon="person"
                placeholder={t('profile.genderPlaceholder')}
                options={genderOptions}
                error={errors.gender?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="height"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <AuthField
                id="height"
                label={t('profile.heightCm')}
                icon="monitor_weight"
                type="number"
                min={0}
                placeholder={t('profile.heightPlaceholder')}
                value={(value as number | string) ?? ''}
                onChange={(e) =>
                  onChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                error={errors.height?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="target"
            control={control}
            render={({ field }) => (
              <AuthSelect
                id="target"
                label={t('profile.fitnessGoal')}
                icon="track_changes"
                placeholder={t('profile.goalPlaceholder')}
                options={goalOptions}
                error={errors.target?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </div>

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <AuthField
              id="password"
              label={t('profile.newPassword')}
              icon="lock"
              type="password"
              placeholder={t('profile.newPasswordPlaceholder')}
              autoComplete="new-password"
              disabled={isGoogleAuth}
              error={
                errors.password?.message ??
                (isGoogleAuth
                  ? t('profile.passwordLockedGoogle')
                  : t('profile.passwordLeaveBlank'))
              }
              {...field}
            />
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg font-bold text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-lg font-bold text-sm bg-primary-gradient text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
          >
            {t('common.saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
};
