import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../config/platform', () => ({ isNativeApp: true }));

const navigate = vi.fn();
let pathname = '/';
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
  useLocation: () => ({ pathname }),
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: (select: (s: { user: { _id: string } }) => unknown) => select({ user: { _id: 'u1' } }),
}));

const toast = vi.fn();
vi.mock('sonner', () => ({ toast: (...a: unknown[]) => toast(...a) }));

type Handlers = {
  onTap: (a: { notification: { data?: unknown } }) => void;
  onForeground: (n: { title?: string; body?: string; data?: unknown }) => void;
};
let handlers: Handlers | null = null;
vi.mock('../services/push', () => ({
  registerPush: (h: Handlers) => {
    handlers = h;
    return Promise.resolve(true);
  },
}));

import { usePushRegistration } from './usePushRegistration';

const messageData = { url: 'com.fitai.app://open?to=/messages' };

describe('usePushRegistration', () => {
  beforeEach(() => {
    handlers = null;
    pathname = '/';
    navigate.mockClear();
    toast.mockClear();
  });

  it('opens the screen a tapped notification links to', async () => {
    renderHook(() => usePushRegistration());
    await waitFor(() => expect(handlers).not.toBeNull());

    handlers!.onTap({ notification: { data: messageData } });

    expect(navigate).toHaveBeenCalledWith('/messages');
  });

  it('ignores a tapped notification whose link is off the list', async () => {
    renderHook(() => usePushRegistration());
    await waitFor(() => expect(handlers).not.toBeNull());

    handlers!.onTap({ notification: { data: { url: 'com.fitai.app://open?to=/users' } } });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows a toast for one arriving while the app is open', async () => {
    renderHook(() => usePushRegistration());
    await waitFor(() => expect(handlers).not.toBeNull());

    handlers!.onForeground({ title: 'New message from Omri', body: 'hi', data: messageData });

    expect(toast).toHaveBeenCalledWith(
      'New message from Omri',
      expect.objectContaining({ description: 'hi' }),
    );
  });

  it('stays quiet when the user is already on that screen', async () => {
    pathname = '/messages';
    renderHook(() => usePushRegistration());
    await waitFor(() => expect(handlers).not.toBeNull());

    handlers!.onForeground({ title: 'New message', data: messageData });

    expect(toast).not.toHaveBeenCalled();
  });
});
