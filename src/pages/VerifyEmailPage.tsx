import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import api from '../services/api';
import { usePresetMetadata } from '../hooks/useMetadata';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField, AuthSubmit } from '../components/auth/AuthField';
import { StitchIcon } from '../components/common/StitchIcon';

type Status = 'verifying' | 'verified' | 'failed' | 'missingToken';

/**
 * Landing page for the link in the verification email.
 *
 * The mail points here rather than at the API so the user sees the product
 * instead of a JSON body, mirroring how /reset-password already works. When
 * the token is missing or rejected the page turns into a resend form, which is
 * the only useful action left at that point.
 */
function VerifyEmailPage() {
  const { t } = useTranslation();
  const metadata = usePresetMetadata('verify-email');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<Status>(
    token ? 'verifying' : 'missingToken',
  );
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  // React 18+ mounts effects twice in StrictMode. The token is single-use, so
  // a second POST would report "invalid link" for a verification that actually
  // succeeded — this makes the call happen exactly once.
  const attempted = useRef(false);

  const verify = useCallback(async () => {
    try {
      await api.post('/auth/verify-email', { token });
      setStatus('verified');
    } catch {
      // Deliberately not surfacing the server's message: it is English-only,
      // and it would land untranslated in the middle of a Hebrew page. Every
      // failure here has the same remedy anyway — request a new link.
      setStatus('failed');
    }
  }, [token]);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    void verify();
  }, [token, verify]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      // The API answers 204 whether or not the address exists, so the UI must
      // not claim the mail was sent to a real account either.
      toast.success(t('auth.verifyResent'));
    } catch {
      toast.error(t('auth.verifyResendFailed'));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {metadata}
      <AuthLayout
        title={t('auth.verifyTitle')}
        subtitle={t('auth.verifySubtitle')}
      >
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
              <StitchIcon name="mail" size={24} />
            </div>
            <p className="text-sm text-on-surface-variant">
              {t('auth.verifyInProgress')}
            </p>
          </div>
        )}

        {status === 'verified' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <StitchIcon name="check" size={24} />
            </div>
            <p className="text-sm font-bold text-on-surface">
              {t('auth.verifySuccess')}
            </p>
            {/* Not AuthSubmit: that renders type="submit", and there is no
                form here for it to submit. */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full auth-gradient text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-transform"
            >
              {t('auth.verifyContinue')}
            </button>
          </div>
        )}

        {(status === 'failed' || status === 'missingToken') && (
          <form onSubmit={handleResend} className="space-y-5">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-error-container text-on-error-container">
              <p className="text-xs font-medium">
                {status === 'missingToken'
                  ? t('auth.verifyMissingToken')
                  : t('auth.verifyFailed')}
              </p>
            </div>

            <p className="text-sm text-on-surface-variant">
              {t('auth.verifyResendPrompt')}
            </p>

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

            <AuthSubmit loading={resending}>
              {t('auth.verifyResendButton')}
            </AuthSubmit>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t('auth.backToLogin')}
            </button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}

export default VerifyEmailPage;
