import { describe, it, expect } from 'vitest';
import { routeForOAuthReturn } from './useNativeDeepLinks';

const code = 'a'.repeat(64);

describe('routeForOAuthReturn', () => {
  it('continues a sign-in on the page the backend named', () => {
    expect(
      routeForOAuthReturn(
        `com.fitai.app://oauth?code=${code}&next=%2Fauth%2Fgoogle%2Fcallback`,
      ),
    ).toBe(`/auth/google/callback?code=${code}`);

    expect(
      routeForOAuthReturn(`com.fitai.app://oauth?code=${code}&next=/complete-profile`),
    ).toBe(`/complete-profile?code=${code}`);
  });

  it('sends a failed sign-in back to login with its error', () => {
    expect(
      routeForOAuthReturn('com.fitai.app://oauth?error=access_denied&next=%2Flogin'),
    ).toBe('/login?error=access_denied');
  });

  // Any app or page can open a com.fitai.app:// link.
  it.each([
    ['another scheme', `https://evil.example/oauth?code=${code}&next=/login`],
    ['another host', `com.fitai.app://elsewhere?code=${code}&next=/login`],
    ['a page outside the list', `com.fitai.app://oauth?code=${code}&next=/profile`],
    ['an absolute next', `com.fitai.app://oauth?code=${code}&next=https://evil.example`],
    ['no next', `com.fitai.app://oauth?code=${code}`],
  ])('ignores %s', (_label, url) => {
    expect(routeForOAuthReturn(url)).toBeNull();
  });

  it('passes on only the code and the error', () => {
    expect(
      routeForOAuthReturn(
        `com.fitai.app://oauth?code=${code}&next=/auth/google/callback&redirect=/admin`,
      ),
    ).toBe(`/auth/google/callback?code=${code}`);
  });
});
