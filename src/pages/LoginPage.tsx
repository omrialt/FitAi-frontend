import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth, errorCode, EMAIL_NOT_VERIFIED } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useFormHandler } from '../hooks/useFormHandler';
import { authService } from '../services/auth.service';
import { usePresetMetadata } from '../hooks/useMetadata';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import { AuthLayout } from '../components/auth/AuthLayout';
import {
  AuthField,
  AuthSubmit,
  GoogleButton,
  AuthDivider,
} from '../components/auth/AuthField';

/**
 * Login — "Performance Lab" design.
 *
 * The design also shows a "Remember this device for 30 days" checkbox. There is
 * no backend support for persistent device trust, so it is omitted rather than
 * rendered as a control that does nothing.
 */
function LoginPage() {
  const { t } = useTranslation();
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
      try {
        setUnverifiedEmail(null);
        await login(data);
      } catch (error) {
        // The password was right; the address just is not verified. Show the
        // resend panel instead of an error, since there is nothing for the
        // user to correct in the form.
        if (errorCode(error) === EMAIL_NOT_VERIFIED) {
          setUnverifiedEmail(data.email);
          return;
        }
        throw error;
      }
    },
    showErrorToast: false, // useAuth handles toast notifications
    mode: 'onTouched',
  });

  // Set when a sign-in is refused for want of email verification.
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const { execute: resendVerification, loading: resendLoading } = useApi<void>({
    showSuccessToast: true,
    successMessage: t('auth.verificationResent'),
  });

  // Inline "forgot password" flow, shown in place of the credential form
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const {
    execute: resetPassword,
    loading: resetLoading,
    error: resetError,
  } = useApi<void>({
    showSuccessToast: true,
    successMessage: t('auth.resetLinkSent'),
  });

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    await resetPassword('/auth/forgot-password', {
      method: 'POST',
      data: { email: resetEmail },
    });
  };

  return (
    <>
      {metadata}
      <AuthLayout
        title={t('auth.loginTitle')}
        subtitle={
          showReset ? t('auth.resetSubtitle') : t('auth.loginSubtitleDesktop')
        }
      >
        {showReset ? (
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <AuthField
              id="reset-email"
              label={t('auth.workEmail')}
              icon="mail"
              type="email"
              placeholder={t('auth.workEmailPlaceholder')}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              error={resetError?.message}
              required
            />

            <AuthSubmit loading={resetLoading}>
              {t('auth.resetPassword')}
            </AuthSubmit>

            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="w-full text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t('auth.backToLogin')}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <GoogleButton
              label={t('auth.continueWithGoogle')}
              onClick={() => authService.loginWithGoogle()}
            />

            <AuthDivider label={t('auth.orContinueWithEmail')} />

            {unverifiedEmail && (
              <div
                role="status"
                className="rounded-xl border border-ghost bg-surface-container-lowest p-4 space-y-3"
              >
                <p className="text-sm text-on-surface">
                  {t('auth.verifyBeforeSignIn', { email: unverifiedEmail })}
                </p>
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={() =>
                    void resendVerification('/auth/resend-verification', {
                      method: 'POST',
                      data: { email: unverifiedEmail },
                    })
                  }
                  className="text-sm font-bold text-primary hover:text-primary-container transition-colors disabled:opacity-60"
                >
                  {resendLoading
                    ? t('common.loading')
                    : t('auth.resendVerification')}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <AuthField
                id="password"
                label={t('auth.password')}
                icon="lock"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
                error={errors.password?.message}
                action={
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-xs font-bold text-primary hover:text-primary-container transition-colors"
                  >
                    {t('auth.forgotShort')}
                  </button>
                }
                {...register('password')}
              />

              <AuthSubmit loading={isSubmitting}>
                {t('auth.signInToLab')}
              </AuthSubmit>
            </form>

            <p className="text-sm text-center text-on-surface-variant pt-2">
              {t('auth.noAccountYet')}{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                {t('auth.startTrial')}
              </Link>
            </p>
          </div>
        )}
      </AuthLayout>
    </>
  );
}

export default LoginPage;
