import { describe, it, expect, beforeEach } from 'vitest';
import { challengeFor, createVerifier, takeVerifier } from './native-google-auth';

describe('native Google sign-in (PKCE)', () => {
  beforeEach(() => localStorage.clear());

  // RFC 7636 Appendix B: the backend checks against the same vector.
  it('derives the RFC 7636 S256 challenge', async () => {
    await expect(
      challengeFor('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'),
    ).resolves.toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('creates 43-character verifiers from the RFC alphabet, never repeating', () => {
    const a = createVerifier();
    const b = createVerifier();

    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a).not.toBe(b);
  });

  it('hands out a stored verifier exactly once', () => {
    localStorage.setItem('fitai-oauth-verifier', 'v'.repeat(43));

    expect(takeVerifier()).toBe('v'.repeat(43));
    expect(takeVerifier()).toBeUndefined();
  });
});
