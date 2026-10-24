import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { useWakeLock } from './useWakeLock';

function stubWakeLock() {
  const release = vi.fn(() => Promise.resolve());
  const request = vi.fn(() => Promise.resolve({ release }));
  Object.defineProperty(navigator, 'wakeLock', {
    value: { request },
    configurable: true,
  });
  return { request, release };
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useWakeLock', () => {
  afterEach(() => {
    delete (navigator as { wakeLock?: unknown }).wakeLock;
    setVisibility('visible');
  });

  it('keeps the screen on while mounted and lets go on unmount', async () => {
    const { request, release } = stubWakeLock();

    const { unmount } = renderHook(() => useWakeLock());
    await waitFor(() => expect(request).toHaveBeenCalledWith('screen'));

    unmount();
    expect(release).toHaveBeenCalled();
  });

  // The browser drops the lock whenever the page is hidden.
  it('takes the lock again when the page comes back', async () => {
    const { request } = stubWakeLock();
    renderHook(() => useWakeLock());
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    setVisibility('hidden');
    expect(request).toHaveBeenCalledTimes(1);

    setVisibility('visible');
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it('is silent where the API is missing or refuses', async () => {
    expect(() => renderHook(() => useWakeLock())).not.toThrow();

    Object.defineProperty(navigator, 'wakeLock', {
      value: { request: vi.fn(() => Promise.reject(new Error('NotAllowed'))) },
      configurable: true,
    });
    expect(() => renderHook(() => useWakeLock())).not.toThrow();
  });
});
