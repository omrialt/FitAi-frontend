import { registerPlugin } from '@capacitor/core';
import {
  PushNotifications,
  type ActionPerformed,
  type PushNotificationSchema,
} from '@capacitor/push-notifications';
import api from './api';
import { isNativeApp } from '../config/platform';
import { requestNotificationPermission } from './rest-alarm';

/**
 * Push notifications (FCM) for the signed-in user, in the app only.
 *
 * Off in a build without Firebase (no google-services.json): registering there
 * would crash the app, so PushSupport is asked first. The device token is
 * kept on the phone so logout can remove it from the server while the session
 * is still valid.
 */

export type PushKind = 'messages' | 'plans' | 'connections';
export type PushPrefs = Record<PushKind, boolean>;

const TOKEN_KEY = 'fitai.push.token';
const PushSupport = registerPlugin<{ isConfigured(): Promise<{ configured: boolean }> }>(
  'PushSupport',
);

export async function isPushConfigured(): Promise<boolean> {
  if (!isNativeApp) return false;
  try {
    return (await PushSupport.isConfigured()).configured;
  } catch {
    return false;
  }
}

function storedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function sendToken(token: string): Promise<void> {
  try {
    await api.post('/push/devices', { token, platform: 'android' });
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Retried on the next app start.
  }
}

let listening = false;

/**
 * Register this phone for the signed-in user. Safe to call on every start:
 * FCM hands back the same token, and the server upserts it.
 */
export async function registerPush(handlers: {
  onTap: (action: ActionPerformed) => void;
  onForeground: (notification: PushNotificationSchema) => void;
}): Promise<boolean> {
  if (!(await isPushConfigured())) return false;
  if (!(await requestNotificationPermission())) return false;

  try {
    if (!listening) {
      listening = true;
      await PushNotifications.addListener('registration', ({ value }) => void sendToken(value));
      await PushNotifications.addListener('pushNotificationActionPerformed', handlers.onTap);
      await PushNotifications.addListener('pushNotificationReceived', handlers.onForeground);
      // The channel the server addresses (android.notification.channelId).
      await PushNotifications.createChannel({
        id: 'fitai-push',
        name: 'Trainer and plans',
        description: 'Messages from your trainer, new plans and connection requests',
        importance: 4,
      });
    }
    await PushNotifications.register();
    return true;
  } catch {
    return false;
  }
}

/** Remove this phone from the account. Called before logout, while still signed in. */
export async function unregisterPush(): Promise<void> {
  const token = storedToken();
  if (!token) return;
  try {
    await api.delete(`/push/devices/${encodeURIComponent(token)}`);
  } catch {
    // The server forgets dead tokens on its own.
  } finally {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nothing stored.
    }
  }
}

export async function getPushPrefs(): Promise<PushPrefs> {
  const response = await api.get('/push/preferences');
  return response.data.data ?? response.data;
}

export async function setPushPrefs(prefs: Partial<PushPrefs>): Promise<PushPrefs> {
  const response = await api.patch('/push/preferences', prefs);
  return response.data.data ?? response.data;
}
