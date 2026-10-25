import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../config/platform', () => ({ isNativeApp: true }));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

vi.mock('@capacitor/browser', () => ({ Browser: { close: vi.fn(() => Promise.resolve()) } }));
vi.mock('@capacitor/app', () => ({
  App: {
    getLaunchUrl: vi.fn(() => Promise.resolve(undefined)),
    addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })),
  },
}));

type Tap = { notification: { extra?: unknown } };
let tap: (event: Tap) => void = () => {};
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    addListener: vi.fn((_event: string, listener: (event: Tap) => void) => {
      tap = listener;
      return Promise.resolve({ remove: vi.fn() });
    }),
  },
}));

import { useNativeDeepLinks } from './useNativeDeepLinks';

describe('useNativeDeepLinks — tapped notifications', () => {
  beforeEach(() => navigate.mockClear());

  it('opens the plan day a workout reminder links to', async () => {
    renderHook(() => useNativeDeepLinks());
    const to = `/workout/${'c'.repeat(24)}/1`;

    tap({ notification: { extra: { url: `com.fitai.app://open?to=${to}` } } });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(to));
  });

  // The rest alarm carries no link; a forged one must not steer the app.
  it('ignores notifications without a link, or with one off the list', () => {
    renderHook(() => useNativeDeepLinks());

    tap({ notification: {} });
    tap({ notification: { extra: { url: 'com.fitai.app://open?to=/users' } } });

    expect(navigate).not.toHaveBeenCalled();
  });
});
