import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'he' } }),
}));

let native = true;
vi.mock('../../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

let granted = true;
const askPermission = vi.fn(() => Promise.resolve(granted));
vi.mock('../../services/rest-alarm', () => ({
  requestNotificationPermission: () => askPermission(),
}));

const sync = vi.fn(() => Promise.resolve([]));
vi.mock('../../hooks/useReminderSync', () => ({ useSyncReminders: () => sync }));

import { ReminderSettings } from './ReminderSettings';
import { getReminderSettings } from '../../services/workout-reminders';

describe('ReminderSettings', () => {
  beforeEach(() => {
    native = true;
    granted = true;
    localStorage.clear();
    askPermission.mockClear();
    sync.mockClear();
  });

  it('is off at 09:00 until turned on, and asks for permission when it is', async () => {
    render(<ReminderSettings />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'true'));
    expect(askPermission).toHaveBeenCalled();
    expect(getReminderSettings()).toEqual({ enabled: true, time: '09:00' });
    expect(screen.getByLabelText('reminders.time')).toHaveValue('09:00');
  });

  it('stays off and explains when notifications are refused', async () => {
    granted = false;
    render(<ReminderSettings />);

    fireEvent.click(screen.getByRole('switch'));

    expect(await screen.findByRole('alert')).toHaveTextContent('reminders.denied');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('reschedules when the time changes', async () => {
    localStorage.setItem('fitai.reminders', JSON.stringify({ enabled: true, time: '09:00' }));
    render(<ReminderSettings />);
    await waitFor(() => expect(sync).toHaveBeenCalled());
    sync.mockClear();

    fireEvent.change(screen.getByLabelText('reminders.time'), { target: { value: '18:30' } });

    await waitFor(() => expect(sync).toHaveBeenCalled());
    expect(getReminderSettings().time).toBe('18:30');
  });

  it('is not shown on the web', () => {
    native = false;
    const { container } = render(<ReminderSettings />);

    expect(container).toBeEmptyDOMElement();
  });
});
