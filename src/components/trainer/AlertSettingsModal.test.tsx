import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

import { AlertSettingsModal } from './AlertSettingsModal';
import trainerDashboardService from '../../services/trainer-dashboard.service';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../services/trainer-dashboard.service', () => ({
  default: { getSettings: vi.fn(), saveSettings: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const service = trainerDashboardService as unknown as {
  getSettings: ReturnType<typeof vi.fn>;
  saveSettings: ReturnType<typeof vi.fn>;
};

const STORED = { idleInfoDays: 3, idleWarnDays: 5, stallMinSpanDays: 14, stallMaxChangeKg: 1 };

function renderModal(onSaved = vi.fn(), onClose = vi.fn()) {
  render(
    <MantineProvider>
      <AlertSettingsModal opened onClose={onClose} onSaved={onSaved} />
    </MantineProvider>,
  );
  return { onSaved, onClose };
}

const field = (label: string) => screen.getByLabelText(new RegExp(label)) as HTMLInputElement;

describe('AlertSettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getSettings.mockResolvedValue(STORED);
    service.saveSettings.mockImplementation((s: unknown) => Promise.resolve(s));
  });

  it("opens on the trainer's stored thresholds", async () => {
    renderModal();
    expect(await screen.findByDisplayValue('3')).toBeInTheDocument();
    expect(field('settings.idleWarnDays').value).toBe('5');
  });

  it('saves the whole set and re-judges the roster', async () => {
    const { onSaved, onClose } = renderModal();
    await screen.findByDisplayValue('3');

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());

    expect(service.saveSettings).toHaveBeenCalledWith(STORED);
    expect(onClose).toHaveBeenCalled();
  });

  it('restores the defaults without saving until asked', async () => {
    renderModal();
    await screen.findByDisplayValue('3');

    fireEvent.click(screen.getByRole('button', { name: 'trainerDashboard.settings.reset' }));

    expect(field('settings.idleInfoDays').value).toBe('7');
    expect(field('settings.idleWarnDays').value).toBe('10');
    expect(service.saveSettings).not.toHaveBeenCalled();
  });

  it('refuses a "flag" threshold that does not come after the "mention" one', async () => {
    service.getSettings.mockResolvedValue({ ...STORED, idleInfoDays: 5, idleWarnDays: 5 });
    renderModal();
    await screen.findAllByDisplayValue('5');

    expect(screen.getByText('trainerDashboard.settings.warnAfterInfo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.save' })).toBeDisabled();
  });
});
