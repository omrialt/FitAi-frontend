import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';

/**
 * The rest timer inside the Android app: the buttons on the live workout
 * notification ("+30", "skip rest") must move the timer on the page too.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'he' } }),
}));

vi.mock('../../config/platform', () => ({ isNativeApp: true }));

vi.mock('@capacitor/app', () => ({
  App: { addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })) },
}));
vi.mock('@capacitor/haptics', () => ({ Haptics: { vibrate: vi.fn(() => Promise.resolve()) } }));

vi.mock('../../services/rest-alarm', () => ({
  armRestAlarm: vi.fn(),
  disarmRestAlarm: vi.fn(),
  hasExactAlarms: vi.fn(() => Promise.resolve(true)),
  openExactAlarmSetting: vi.fn(),
  requestNotificationPermission: vi.fn(() => Promise.resolve(true)),
}));

type Action = { type: 'plus30' | 'skipRest'; restDeadline: number };
let emit: (action: Action) => void = () => {};
vi.mock('../../services/workout-live', () => ({
  setRest: vi.fn(),
  onLiveAction: (listener: (action: Action) => void) => {
    emit = listener;
    return () => {};
  },
}));

import { RestTimer } from './RestTimer';

describe('RestTimer in the app', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-25T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds 30 seconds when "+30" is tapped on the notification', () => {
    render(<RestTimer />);
    fireEvent.click(screen.getByRole('button', { name: '1:00' }));

    act(() => {
      emit({ type: 'plus30', restDeadline: Date.now() + 90_000 });
      vi.advanceTimersByTime(300);
    });

    // The 1:30 preset button carries the same text; the countdown is the other.
    const countdown = screen.getAllByText('1:30').filter((el) => !el.closest('button'));
    expect(countdown).toHaveLength(1);
  });

  it('stops when "skip rest" is tapped on the notification', () => {
    render(<RestTimer />);
    fireEvent.click(screen.getByRole('button', { name: '1:00' }));

    act(() => {
      emit({ type: 'skipRest', restDeadline: 0 });
    });

    expect(screen.getByText('–:––')).toBeInTheDocument();
  });
});
