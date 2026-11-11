import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import api from './api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/auth.types';

const PUSH_TOKEN_KEY = 'fitai.push.token';
const user = { _id: 'u1', email: 'a@b.co', fullName: 'A B' } as User;

/**
 * A server on which this session is dead: every request is refused with 401.
 *
 * Answers on a timer so a runaway loop yields to the test runner, and stops
 * answering 401 after `limit` calls so the broken behaviour fails an assertion
 * instead of hanging the suite.
 */
function deadSessionAdapter(limit = 25) {
  const calls: string[] = [];
  const adapter = (config: InternalAxiosRequestConfig) =>
    new Promise<never>((_, reject) => {
      calls.push(`${config.method?.toUpperCase()} ${config.url}`);
      setTimeout(() => {
        if (calls.length > limit) {
          reject(new Error('runaway request loop'));
          return;
        }
        reject(
          new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
            status: 401,
            statusText: 'Unauthorized',
            data: {},
            headers: {},
            config,
          }),
        );
      }, 0);
    });
  return { adapter, calls };
}

describe('api — session expired', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user,
      tokens: { accessToken: 'dead-access', refreshToken: 'dead-refresh' },
      isAuthenticated: true,
    });
    // The refresh goes through bare axios, and the server refuses it too.
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('Invalid refresh token'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // The regression: logout removes this phone's push token from the server
  // first. On a dead session that request is refused as well, and the
  // interceptor answered the refusal by calling logout again — which sent the
  // request again. No call ever returned, so the tokens were never cleared and
  // the app sat on its loading skeleton, hammering the server.
  it('logs out once when the push token removal is refused too', async () => {
    localStorage.setItem(PUSH_TOKEN_KEY, 'device-token');
    const { adapter, calls } = deadSessionAdapter();
    api.defaults.adapter = adapter;

    await expect(api.get('/users/me')).rejects.toBeDefined();

    expect(calls.filter((c) => c.startsWith('DELETE /push/devices/'))).toHaveLength(1);
    expect(useAuthStore.getState().tokens).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem(PUSH_TOKEN_KEY)).toBeNull();
  });

  it('logs out once when several requests are refused together', async () => {
    localStorage.setItem(PUSH_TOKEN_KEY, 'device-token');
    const { adapter, calls } = deadSessionAdapter();
    api.defaults.adapter = adapter;

    const results = await Promise.allSettled([
      api.get('/users/me'),
      api.get('/training-plans'),
      api.get('/nutrition-plans'),
    ]);

    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(calls.filter((c) => c.startsWith('DELETE /push/devices/'))).toHaveLength(1);
    expect(calls.filter((c) => c === 'POST /auth/logout')).toHaveLength(1);
    expect(useAuthStore.getState().tokens).toBeNull();
  });
});
