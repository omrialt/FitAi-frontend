import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

import TrainerDashboardPage from './TrainerDashboardPage';

// Stable across renders, as the real `t` is: the page's load callback depends
// on it, and a fresh function each render would refetch forever.
const i18n = vi.hoisted(() => ({ t: (key: string) => key, i18n: { language: 'en' } }));
vi.mock('react-i18next', () => ({ useTranslation: () => i18n }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('../components/AppLayout', () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../components/trainer/AlertSettingsModal', () => ({
  AlertSettingsModal: () => null,
}));

const getOverview = vi.hoisted(() => vi.fn());
vi.mock('../services/trainer-dashboard.service', () => ({
  default: { getOverview },
}));

const renderPage = () =>
  render(
    <MantineProvider>
      <MemoryRouter>
        <TrainerDashboardPage />
      </MemoryRouter>
    </MantineProvider>,
  );

describe('TrainerDashboardPage', () => {
  beforeEach(() => getOverview.mockReset());

  // The page used to fall through to "No connected clients yet" when the
  // request failed, so a 429 told a coach with clients that they had none.
  it('shows a retryable error, not the empty roster, when loading fails', async () => {
    getOverview.mockRejectedValueOnce(new Error('429'));
    renderPage();

    expect(await screen.findByText('trainerDashboard.loadFailed')).toBeInTheDocument();
    expect(screen.queryByText('trainerDashboard.noClients')).not.toBeInTheDocument();

    getOverview.mockResolvedValueOnce([]);
    fireEvent.click(screen.getByRole('button', { name: 'trainerDashboard.retry' }));
    expect(await screen.findByText('trainerDashboard.noClients')).toBeInTheDocument();
    expect(getOverview).toHaveBeenCalledTimes(2);
  });

  it('shows the empty roster when the trainer really has no clients', async () => {
    getOverview.mockResolvedValueOnce([]);
    renderPage();
    expect(await screen.findByText('trainerDashboard.noClients')).toBeInTheDocument();
  });
});
