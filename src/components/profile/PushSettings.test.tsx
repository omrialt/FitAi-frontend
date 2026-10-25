import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

let native = true;
vi.mock('../../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

let configured = true;
const setPrefs = vi.fn();
vi.mock('../../services/push', () => ({
  isPushConfigured: () => Promise.resolve(configured),
  getPushPrefs: () => Promise.resolve({ messages: true, plans: true, connections: false }),
  setPushPrefs: (...a: unknown[]) => setPrefs(...a),
}));

import { PushSettings } from './PushSettings';

const render = (ui: ReactElement) => rtlRender(<MantineProvider>{ui}</MantineProvider>);

describe('PushSettings', () => {
  beforeEach(() => {
    native = true;
    configured = true;
    setPrefs.mockReset().mockImplementation((p: object) =>
      Promise.resolve({ messages: true, plans: true, connections: false, ...p }),
    );
  });

  it('shows one switch per kind, as stored on the account', async () => {
    render(<PushSettings />);

    expect(await screen.findByRole('switch', { name: /push\.kind\.messages/ })).toBeChecked();
    expect(screen.getByRole('switch', { name: /push\.kind\.connections/ })).not.toBeChecked();
  });

  it('saves a switch to the account', async () => {
    render(<PushSettings />);

    fireEvent.click(await screen.findByRole('switch', { name: /push\.kind\.plans/ }));

    await waitFor(() => expect(setPrefs).toHaveBeenCalledWith({ plans: false }));
    expect(screen.getByRole('switch', { name: /push\.kind\.plans/ })).not.toBeChecked();
  });

  it('says push is not switched on yet in a build without Firebase', async () => {
    configured = false;
    render(<PushSettings />);

    expect(await screen.findByText('push.notConfigured')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).toBeNull();
  });

  it('is not shown on the web', () => {
    native = false;
    const { container } = render(<PushSettings />);

    expect(container.querySelector('h2')).toBeNull();
  });
});
