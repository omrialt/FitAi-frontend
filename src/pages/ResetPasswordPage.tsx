import { useState, Activity } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Divider,
  Group,
  Loader,
} from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { toast } from 'sonner';
import { usePresetMetadata } from '../hooks/useMetadata';
import '../styles/Auth.css';

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
  const { execute: resetPassword, loading, error, data } = useApi<void>({ showSuccessToast: true, successMessage: t('auth.resetSuccess') });

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
    const result = await resetPassword('/auth/reset-password', { method: 'POST', data: { token, newPassword } });
    if (result !== null && !error) {
      toast.success(t('auth.resetSuccess'));
      setTimeout(() => navigate('/login'), 1800);
    }
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
            <div style={{ textAlign: 'center' }}>
              <Title order={2} mb="xs">
                {t('auth.resetPassword')}
              </Title>
              <Text size="sm" c="dimmed">
                {t('auth.resetSubtitle')}
              </Text>
            </div>
            <Divider label={t('auth.resetDivider')} labelPosition="center" />
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label={t('auth.email')}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  withAsterisk
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <PasswordInput
                  label={t('auth.newPassword')}
                  placeholder={t('auth.newPasswordPlaceholder')}
                  required
                  withAsterisk
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <PasswordInput
                  label={t('auth.confirmPassword')}
                  placeholder={t('auth.reenterPasswordPlaceholder')}
                  required
                  withAsterisk
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <Activity mode={formError ? "visible" : "hidden"}>
                  <Text c="red" size="sm">{formError}</Text>
                </Activity>
                <Activity mode={error ? "visible" : "hidden"}>
                  <Text c="red" size="sm">{error && error.message}</Text>
                </Activity>
                <Activity mode={loading ? "visible" : "hidden"}>
                  <Group justify="center">
                    <Loader size="sm" />
                  </Group>
                </Activity>
                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  leftSection={<IconLogin size={18} />}
                  loading={loading}
                  gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                  variant="gradient"
                  className="auth-button"
                >
                  {t('auth.resetPassword')}
                </Button>
                <Button
                  variant="subtle"
                  color="gray"
                  fullWidth
                  onClick={() => navigate('/login')}
                  type="button"
                >
                  {t('auth.backToLogin')}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </div>
    </>
  );
}

export default ResetPasswordPage;
