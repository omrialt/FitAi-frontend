import { Browser } from '@capacitor/browser';
import { API_URL } from '../config/env';

/**
 * Google sign-in from the Android app.
 *
 * Google refuses sign-in inside a WebView, so the flow runs in the system
 * browser (a Custom Tab) and comes back through the com.fitai.app:// scheme —
 * see useNativeDeepLinks. Any app can claim that scheme, so the code it
 * carries is bound to a PKCE verifier (RFC 7636) that never leaves this app:
 * only its S256 challenge goes out, and the backend redeems the code only
 * together with the verifier.
 *
 * The verifier lives in localStorage rather than memory: Android may kill the
 * app while the browser is in front, and the return leg then starts a fresh
 * page that still needs it.
 */

const VERIFIER_KEY = 'fitai-oauth-verifier';

function base64url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** 32 random bytes as base64url: 43 characters from the RFC 7636 alphabet. */
export function createVerifier(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

/** S256: base64url(sha256(verifier)). */
export async function challengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  );
  return base64url(new Uint8Array(digest));
}

export async function startNativeGoogleSignIn(): Promise<void> {
  const verifier = createVerifier();
  const challenge = await challengeFor(verifier);

  try {
    localStorage.setItem(VERIFIER_KEY, verifier);
  } catch {
    // Without storage the exchange will be refused; nothing better to do here.
  }

  const params = new URLSearchParams({ platform: 'android', challenge });
  await Browser.open({ url: `${API_URL}/auth/google?${params.toString()}` });
}

/** Read the pending verifier once. A code is single-use, so is its verifier. */
export function takeVerifier(): string | undefined {
  try {
    const verifier = localStorage.getItem(VERIFIER_KEY) ?? undefined;
    localStorage.removeItem(VERIFIER_KEY);
    return verifier;
  } catch {
    return undefined;
  }
}
