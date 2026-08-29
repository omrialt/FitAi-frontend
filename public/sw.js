/* eslint-disable no-undef */

/**
 * FitAi service worker.
 *
 * Scope is deliberately narrow. This caches the app shell so the logger opens
 * in a basement, and nothing else — in particular it never touches `/api`
 * requests. Serving a cached workout log would show a lifter numbers that are
 * quietly out of date, which is worse than an honest error, and caching an
 * authenticated response risks handing it to the next account on the device.
 *
 * The queue in `offline-queue.ts` is what makes writes survive; this only
 * makes the app reachable to reach the queue.
 */

const VERSION = 'fitai-shell-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // A shell entry that 404s must not fail the whole install and leave the
      // worker permanently un-activated.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Same-origin only, and never the API: see the note at the top.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api')) return;

  // Navigations: network first so a deploy is picked up immediately, falling
  // back to the cached shell when there is no signal.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((cached) => cached ?? Response.error()),
        ),
    );
    return;
  }

  // Build assets are content-hashed, so a cache hit can be served immediately
  // and can never be stale for a given URL.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
