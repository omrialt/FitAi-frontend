import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'he' } }),
}));

let native = true;
vi.mock('../../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

vi.mock('@capacitor/app', () => ({
  App: { addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })) },
}));

let status = { notifications: true, promoted: false };
let exact = true;
vi.mock('../../services/workout-live', () => ({
  getLiveStatus: () => Promise.resolve(status),
  openNotificationSettings: vi.fn(),
}));
vi.mock('../../services/rest-alarm', () => ({
  hasExactAlarms: () => Promise.resolve(exact),
  openExactAlarmSetting: vi.fn(),
  requestNotificationPermission: vi.fn(() => Promise.resolve(true)),
}));

import { NotificationHealth } from './NotificationHealth';

describe('NotificationHealth', () => {
  beforeEach(() => {
    native = true;
    status = { notifications: true, promoted: false };
    exact = true;
  });

  // The one switch that is off is the reason the clock chip is missing.
  it('says which switch is off and offers to fix only that one', async () => {
    render(<NotificationHealth />);

    const live = await screen.findByTestId('health-promoted');
    expect(within(live).getByText('notificationHealth.liveHint')).toBeInTheDocument();
    expect(within(live).getByRole('button', { name: 'notificationHealth.fix' })).toBeInTheDocument();

    const notifications = screen.getByTestId('health-notifications');
    expect(within(notifications).getByText('notificationHealth.on')).toBeInTheDocument();
    expect(within(notifications).queryByRole('button')).toBeNull();
  });

  it('shows all three as on when everything is allowed', async () => {
    status = { notifications: true, promoted: true };
    render(<NotificationHealth />);

    await screen.findByTestId('health-exact');
    expect(screen.getAllByText('notificationHealth.on')).toHaveLength(3);
  });

  it('is not shown on the web', () => {
    native = false;
    const { container } = render(<NotificationHealth />);

    expect(container).toBeEmptyDOMElement();
  });
});
