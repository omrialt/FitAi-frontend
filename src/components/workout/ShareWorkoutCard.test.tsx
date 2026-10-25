import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'he' } }),
}));

let native = false;
vi.mock('../../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

const getSummary = vi.fn();
vi.mock('../../services/workout-session.service', () => ({
  workoutSessionService: { getSummary: (...a: unknown[]) => getSummary(...a) },
}));

const shareFile = vi.fn<(...args: unknown[]) => Promise<void>>(() => Promise.resolve());
vi.mock('../../services/share-file', () => ({
  shareFile: (...a: unknown[]) => shareFile(...a),
  stripDataUri: (s: string) => s.slice(s.indexOf(',') + 1),
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: (select: (s: { user: { fullName: string } }) => unknown) =>
    select({ user: { fullName: 'Dana' } }),
}));

// jsdom has no canvas; the drawing itself is checked by eye in Chrome.
const PNG = 'data:image/png;base64,QUJD';
vi.mock('../../utils/workoutCard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/workoutCard')>()),
  renderCard: vi.fn(() => Promise.resolve(PNG)),
}));

import { ShareWorkoutCard } from './ShareWorkoutCard';

const render = (ui: ReactElement) => rtlRender(<MantineProvider>{ui}</MantineProvider>);

const summary = {
  performedAt: '2026-10-25T09:00:00Z',
  dayName: 'Legs',
  totalSets: 3,
  totalReps: 20,
  volumeKg: 900,
  topSet: null,
  records: [],
};

describe('ShareWorkoutCard', () => {
  beforeEach(() => {
    native = false;
    getSummary.mockReset().mockResolvedValue(summary);
    shareFile.mockClear();
  });

  it('shares the PNG through the share sheet in the app', async () => {
    native = true;
    render(<ShareWorkoutCard sessionId="s1" onClose={() => {}} />);

    await screen.findByAltText('shareCard.previewAlt');
    fireEvent.click(screen.getByRole('button', { name: 'shareCard.share' }));

    await waitFor(() => expect(shareFile).toHaveBeenCalled());
    expect(shareFile).toHaveBeenCalledWith(expect.stringMatching(/\.png$/), 'QUJD', 'shareCard.title');
  });

  it("uses the browser's share on the web when it can take files", async () => {
    const share = vi.fn(() => Promise.resolve());
    Object.assign(navigator, { canShare: () => true, share });
    globalThis.fetch = vi.fn(() => Promise.resolve({ blob: () => Promise.resolve(new Blob(['x'])) })) as never;

    render(<ShareWorkoutCard sessionId="s1" onClose={() => {}} />);
    await screen.findByAltText('shareCard.previewAlt');
    fireEvent.click(screen.getByRole('button', { name: 'shareCard.share' }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(shareFile).not.toHaveBeenCalled();
  });

  it('says so when the workout cannot be loaded', async () => {
    getSummary.mockRejectedValue(new Error('404'));
    render(<ShareWorkoutCard sessionId="s1" onClose={() => {}} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('shareCard.loadFailed');
    expect(screen.getByRole('button', { name: 'shareCard.share' })).toBeDisabled();
  });

  it('stays closed without a session', () => {
    render(<ShareWorkoutCard sessionId={null} onClose={() => {}} />);

    expect(screen.queryByText('shareCard.title')).toBeNull();
    expect(getSummary).not.toHaveBeenCalled();
  });
});
