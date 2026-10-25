import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { isNativeApp } from '../config/platform';
import { registerPush } from '../services/push';
import { routeForDeepLink } from './useNativeDeepLinks';

function linkOf(data: unknown): string | null {
  const url = (data as { url?: unknown } | undefined)?.url;
  return typeof url === 'string' ? routeForDeepLink(url) : null;
}

/**
 * Registers the phone for push once someone is signed in.
 *
 * A tapped notification opens its screen through the same allow-listed router
 * as shortcuts and reminders. One arriving while the app is open is shown as a
 * toast instead — unless the user is already on that screen (reading the
 * thread the message belongs to), where it would only be noise.
 */
export function usePushRegistration() {
  const userId = useAuthStore((state) => state.user?._id);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Listeners are registered once; they read the current screen from here.
  const path = useRef(location.pathname);
  path.current = location.pathname;

  useEffect(() => {
    if (!isNativeApp || !userId) return;

    void registerPush({
      onTap: ({ notification }) => {
        const route = linkOf(notification.data);
        if (route) navigate(route);
      },
      onForeground: (notification) => {
        const route = linkOf(notification.data);
        if (route && path.current === route) return;
        toast(notification.title ?? 'FitAi', {
          description: notification.body,
          ...(route
            ? { action: { label: t('push.open'), onClick: () => navigate(route) } }
            : {}),
        });
      },
    });
  }, [userId, navigate, t]);
}
