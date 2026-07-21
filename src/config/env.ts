/**
 * Resolved frontend environment.
 *
 * Vite inlines `import.meta.env.*` at BUILD time, so VITE_API_URL must be set
 * in the deployment environment before the build runs — setting it afterwards
 * has no effect and requires a redeploy.
 *
 * This previously differed per call site: services/api.ts read the variable
 * with no fallback (an unset value made axios resolve requests against the
 * app's own origin, producing confusing 404s) while auth.service.ts fell back
 * to localhost. Both now read from here.
 */

const DEV_FALLBACK = 'http://localhost:3000';

const configured = import.meta.env.VITE_API_URL?.trim();

if (!configured && import.meta.env.PROD) {
  // Loud, because the app cannot reach its backend in this state
  console.error(
    '[config] VITE_API_URL is not set. It must be defined at build time; ' +
      'set it in the hosting environment and redeploy.',
  );
}

/** Base URL of the API, without a trailing slash. */
export const API_URL = (configured || DEV_FALLBACK).replace(/\/+$/, '');
