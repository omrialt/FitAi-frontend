import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useApi } from '../hooks/useApi';
import { usePresetMetadata } from '../hooks/useMetadata';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField, AuthSubmit } from '../components/auth/AuthField';

/** Reset password — "Performance Lab" design. */
function ResetPasswordPage() {
  const { t } = useTranslation();
  const metadata = usePresetMetadata('reset-password');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const {
    execute: resetPassword,
    loading,
    error,
  } = useApi<void>({
    showSuccessToast: true,
    successMessage: t('auth.resetSuccess'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !newPassword || !confirmPassword) {
      setFormError(t('auth.allFieldsRequired'));
      return;
    }
    if (newPassword.length < 6) {
      setFormError(t('auth.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError(t('auth.passwordsDoNotMatch'));
      return;
    }
    if (!token) {
      setFormError(t('auth.invalidResetToken'));
      return;
    }

    const result = await resetPassword('/auth/reset-password', {
      method: 'POST',
      data: { token, newPassword },
    });

    if (result !== null && !error) {
      toast.success(t('auth.resetSuccess'));
      setTimeout(() => navigate('/login'), 1800);
    }
  };

  return (
    <>
      {metadata}
      <AuthLayout
        title={t('auth.resetPassword')}
        subtitle={t('auth.resetSubtitle')}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthField
            id="email"
            label={t('auth.workEmail')}
            icon="mail"
            type="email"
            placeholder={t('auth.workEmailPlaceholder')}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthField
            id="newPassword"
            label={t('auth.newPassword')}
            icon="lock"
            type="password"
            placeholder={t('auth.newPasswordPlaceholder')}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <AuthField
            id="confirmPassword"
            label={t('auth.confirmPassword')}
            icon="lock"
            type="password"
            placeholder={t('auth.reenterPasswordPlaceholder')}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {(formError || error?.message) && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-error-container text-on-error-container">
              <p className="text-xs font-medium">
                {formError || error?.message}
              </p>
            </div>
          )}

          <AuthSubmit loading={loading}>{t('auth.resetPassword')}</AuthSubmit>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {t('auth.backToLogin')}
          </button>
        </form>
      </AuthLayout>
    </>
  );
}

export default ResetPasswordPage;
