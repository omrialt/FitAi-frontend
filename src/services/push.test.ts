import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/platform', () => ({ isNativeApp: true }));

let configured = true;
vi.mock('@capacitor/core', () => ({
  registerPlugin: () => ({ isConfigured: () => Promise.resolve({ configured }) }),
}));

const listeners: Record<string, (arg: unknown) => void> = {};
const register = vi.fn(() => Promise.resolve());
vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    addListener: vi.fn((event: string, fn: (arg: unknown) => void) => {
      listeners[event] = fn;
      return Promise.resolve({ remove: vi.fn() });
    }),
    createChannel: vi.fn(() => Promise.resolve()),
    register: () => register(),
  },
}));

let granted = true;
vi.mock('./rest-alarm', () => ({ requestNotificationPermission: () => Promise.resolve(granted) }));

const post = vi.fn<(...args: unknown[]) => Promise<{ data: object }>>(() => Promise.resolve({ data: {} }));
const del = vi.fn<(...args: unknown[]) => Promise<{ data: object }>>(() => Promise.resolve({ data: {} }));
vi.mock('./api', () => ({ default: { post: (...a: unknown[]) => post(...a), delete: (...a: unknown[]) => del(...a) } }));

import { registerPush, unregisterPush } from './push';

const handlers = { onTap: vi.fn(), onForeground: vi.fn() };

describe('push', () => {
  beforeEach(() => {
    configured = true;
    granted = true;
    localStorage.clear();
    register.mockClear();
    post.mockClear();
    del.mockClear();
  });

  // Registering without Firebase would crash the app.
  it('never registers in a build without Firebase', async () => {
    configured = false;

    await expect(registerPush(handlers)).resolves.toBe(false);
    expect(register).not.toHaveBeenCalled();
  });

  it('does not register without notification permission', async () => {
    granted = false;

    await expect(registerPush(handlers)).resolves.toBe(false);
    expect(register).not.toHaveBeenCalled();
  });

  it('sends the device token to the server and keeps it for logout', async () => {
    await expect(registerPush(handlers)).resolves.toBe(true);
    expect(register).toHaveBeenCalled();

    listeners.registration({ value: 'fcm-token-123' });
    await vi.waitFor(() =>
      expect(post).toHaveBeenCalledWith('/push/devices', { token: 'fcm-token-123', platform: 'android' }),
    );
    await vi.waitFor(() => expect(localStorage.getItem('fitai.push.token')).toBe('fcm-token-123'));
  });

  it('takes the stored token off the account on logout', async () => {
    localStorage.setItem('fitai.push.token', 'fcm-token-123');

    await unregisterPush();

    expect(del).toHaveBeenCalledWith('/push/devices/fcm-token-123');
    expect(localStorage.getItem('fitai.push.token')).toBeNull();
  });

  it('does nothing on logout when the phone was never registered', async () => {
    await unregisterPush();

    expect(del).not.toHaveBeenCalled();
  });
});
