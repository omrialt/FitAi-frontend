import { Link } from "react-router-dom";
import { useState, Activity } from "react";
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
} from "@mantine/core";
import { IconBrandGoogle, IconLogin } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { useFormHandler } from "../hooks/useFormHandler";
import { authService } from "../services/auth.service";
import { usePresetMetadata } from "../hooks/useMetadata";
import { loginSchema, type LoginFormData } from "../schemas/auth.schemas";
import "../styles/Auth.css";

function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const metadata = usePresetMetadata("login", {
    preconnect: ["https://accounts.google.com"],
  });

  const {
    register,
    handleSubmit,
    isSubmitting,
    formState: { errors },
  } = useFormHandler<LoginFormData>({
    schema: loginSchema,
    onSubmit: async (data) => {
      await login(data);
    },
    showErrorToast: false, // useAuth handles toast notifications
    mode: "onTouched", // Validate on blur and submit
  });

  // State for showing reset password form
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const {
    execute: resetPassword,
    loading: resetLoading,
    error: resetError,
    data: resetData,
  } = useApi<void>({
    showSuccessToast: true,
    successMessage: t('auth.resetLinkSent'),
  });

  const handleGoogleLogin = () => {
    // Initiate Google OAuth flow
    authService.loginWithGoogle();
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    await resetPassword("/auth/forgot-password", {
      method: "POST",
      data: { email: resetEmail },
    });
  };

  return (
    <>
      {metadata}
      <div
        className="auth-container"
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          shadow="xl"
          p="xl"
          radius="md"
          withBorder
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: "420px",
            margin: "0 auto",
          }}
        >
          <Stack gap="md">
            {/* Header */}
            <div style={{ textAlign: "center" }}>
              <Title order={2} mb="xs">
                {t('auth.loginTitle')}
              </Title>
              <Text size="sm" c="dimmed">
                {t('auth.loginSubtitle')}
              </Text>
            </div>
            <Activity mode={!showReset ? "visible" : "hidden"}>
              <Button
                variant="default"
                size="md"
                leftSection={<IconBrandGoogle size={18} />}
                onClick={handleGoogleLogin}
                fullWidth
              >
                {t('auth.continueWithGoogle')}
              </Button>

              <Divider label={t('auth.orContinueWithEmail')} labelPosition="center" />
              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput
                    label={t('auth.email')}
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    withAsterisk
                    {...register("email")}
                    error={errors.email?.message}
                  />

                  <PasswordInput
                    label={t('auth.password')}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    withAsterisk
                    {...register("password")}
                    error={errors.password?.message}
                  />

                  <Group justify="space-between">
                    <Anchor
                      component="button"
                      type="button"
                      size="sm"
                      onClick={() => setShowReset(true)}
                    >
                      {t('auth.forgotPassword')}
                    </Anchor>
                  </Group>

                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    leftSection={<IconLogin size={18} />}
                    loading={isSubmitting}
                    gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                    variant="gradient"
                    className="auth-button"
                  >
                    {t('auth.signIn')}
                  </Button>
                </Stack>
              </form>
            </Activity>

            <Activity mode={showReset ? "visible" : "hidden"}>
              <form onSubmit={handleResetSubmit}>
                <Stack gap="md">
                  <TextInput
                    label={t('auth.email')}
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    withAsterisk
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    error={resetError?.message}
                  />
                  <Activity mode={resetLoading ? "visible" : "hidden"}>
                    <Group justify="center">
                      <Loader size="sm" />
                    </Group>
                  </Activity>
                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    disabled={resetLoading}
                    variant="gradient"
                    gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                  >
                    {t('auth.resetPassword')}
                  </Button>
                  <Button
                    variant="subtle"
                    color="gray"
                    fullWidth
                    onClick={() => setShowReset(false)}
                    type="button"
                  >
                    {t('auth.backToLogin')}
                  </Button>
                </Stack>
              </form>
            </Activity>

            {/* Register Link */}
            <Text size="sm" ta="center">
              {t('auth.noAccount')}{" "}
              <Anchor component={Link} to="/register" fw={600}>
                {t('auth.signUp')}
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </div>
    </>
  );
}

export default LoginPage;
