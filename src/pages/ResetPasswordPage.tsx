import { useState } from 'react';
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
  Anchor,
  Loader,
} from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { useApi } from '../hooks/useApi';
import { toast } from 'sonner';
import { usePresetMetadata } from '../hooks/useMetadata';
import '../styles/Auth.css';

function ResetPasswordPage() {
  const metadata = usePresetMetadata('reset-password');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { execute: resetPassword, loading, error, data } = useApi<void>({ showSuccessToast: true, successMessage: 'Password reset successful! You can now log in.' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !newPassword || !confirmPassword) {
      setFormError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!token) {
      setFormError('Invalid or missing reset token.');
      return;
    }
    const result = await resetPassword('/auth/reset-password', { method: 'POST', data: { token, newPassword } });
    if (result !== null && !error) {
      toast.success('Password reset successful! You can now log in.');
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
                Reset Password
              </Title>
              <Text size="sm" c="dimmed">
                Enter your email and new password
              </Text>
            </div>
            <Divider label="Reset your password" labelPosition="center" />
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  withAsterisk
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  required
                  withAsterisk
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Re-enter new password"
                  required
                  withAsterisk
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                {formError && <Text c="red" size="sm">{formError}</Text>}
                {error && <Text c="red" size="sm">{error.message}</Text>}
                {loading && (
                  <Group justify="center">
                    <Loader size="sm" />
                  </Group>
                )}
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
                  Reset Password
                </Button>
                <Button
                  variant="subtle"
                  color="gray"
                  fullWidth
                  onClick={() => navigate('/login')}
                  type="button"
                >
                  Back to Login
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
