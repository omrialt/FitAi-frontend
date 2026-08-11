import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import api from '../services/api';
import type { User, AuthTokens } from '../types/auth.types';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
    defaults: { headers: { common: {} as Record<string, string> } },
  },
}));

const user = { _id: 'u1', email: 'a@b.co', fullName: 'A B' } as User;
const tokens: AuthTokens = { accessToken: 'access', refreshToken: 'refresh' };

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, tokens: null, isAuthenticated: false });
    api.defaults.headers.common['Authorization'] = 'Bearer stale';
  });

  it('marks the session authenticated on login', () => {
    useAuthStore.getState().login(user, tokens);

    expect(useAuthStore.getState()).toMatchObject({
      user,
      tokens,
      isAuthenticated: true,
    });
  });

  it('clears user, tokens and the auth header on logout', async () => {
    useAuthStore.getState().login(user, tokens);

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });
    expect(api.defaults.headers.common['Authorization']).toBeUndefined();
  });

  // The regression this guards: logout posts to the backend to blacklist the
  // token. If that request fails — offline, server down — the local session
  // must still be cleared, or "log out" leaves the user signed in on a shared
  // machine.
  it('still clears local state when the backend logout call fails', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('network down'));
    useAuthStore.getState().login(user, tokens);

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().tokens).toBeNull();
  });

  it('derives isAuthenticated from whether a user was set', () => {
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('merges a partial update into the existing user', () => {
    useAuthStore.getState().login(user, tokens);

    useAuthStore.getState().updateUser({ fullName: 'New Name' });

    expect(useAuthStore.getState().user).toMatchObject({
      _id: 'u1',
      email: 'a@b.co',
      fullName: 'New Name',
    });
  });

  it('does not invent a user when updating while signed out', () => {
    useAuthStore.getState().updateUser({ fullName: 'Nobody' });

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('replaces tokens without touching the user', () => {
    useAuthStore.getState().login(user, tokens);

    const rotated: AuthTokens = {
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    };
    useAuthStore.getState().setTokens(rotated);

    expect(useAuthStore.getState().tokens).toEqual(rotated);
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
