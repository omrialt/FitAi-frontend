import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

import { TrainerNotePanel, AUTOSAVE_DELAY_MS } from './TrainerNotePanel';
import trainerNoteService from '../../services/trainer-note.service';

/**
 * N-36: a note typed in the demo was gone after a refresh, and the only sign
 * of a save was a toast nobody could check afterwards.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../services/trainer-note.service', () => ({
  default: { get: vi.fn(), save: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const notes = trainerNoteService as unknown as {
  get: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
};

const NOTE = {
  _id: 'n1',
  trainerId: 't1',
  clientId: 'c1',
  body: 'knee rehab',
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
};

async function renderPanel() {
  const view = render(
    <MantineProvider>
      <TrainerNotePanel clientId="c1" />
    </MantineProvider>,
  );
  // Let the initial load resolve.
  await act(async () => {});
  return view;
}

const box = () => screen.getByRole('textbox');

describe('TrainerNotePanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    notes.get.mockResolvedValue(NOTE);
    notes.save.mockImplementation((_c: string, body: string) =>
      Promise.resolve({ ...NOTE, body, updatedAt: '2026-10-10T14:32:00.000Z' }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('shows when the loaded note was last saved, and keeps showing it', async () => {
    await renderPanel();
    expect(box()).toHaveValue('knee rehab');
    expect(screen.getByRole('status')).toHaveTextContent('trainerNote.status.savedAt');
  });

  it('says there are unsaved changes while typing, then saves on its own', async () => {
    await renderPanel();

    fireEvent.change(box(), { target: { value: 'knee rehab, week 2' } });
    expect(screen.getByRole('status')).toHaveTextContent('trainerNote.status.unsaved');
    expect(notes.save).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    expect(notes.save).toHaveBeenCalledWith('c1', 'knee rehab, week 2');
    expect(screen.getByRole('status')).toHaveTextContent('trainerNote.status.savedAt');
  });

  it('saves once for a burst of typing, not per keystroke', async () => {
    await renderPanel();

    for (const text of ['k', 'kn', 'kne', 'knee']) {
      fireEvent.change(box(), { target: { value: text } });
      await act(async () => {
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS / 3);
      });
    }
    await act(async () => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    expect(notes.save).toHaveBeenCalledTimes(1);
    expect(notes.save).toHaveBeenCalledWith('c1', 'knee');
  });

  it('saves when the panel goes away before the pause is over', async () => {
    const view = await renderPanel();

    fireEvent.change(box(), { target: { value: 'typed, then navigated away' } });
    view.unmount();
    await act(async () => {});

    expect(notes.save).toHaveBeenCalledWith('c1', 'typed, then navigated away');
  });

  it('saves when the tab is hidden', async () => {
    await renderPanel();
    fireEvent.change(box(), { target: { value: 'switching apps' } });

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });

    expect(notes.save).toHaveBeenCalledWith('c1', 'switching apps');
  });

  it('does not save when nothing changed', async () => {
    await renderPanel();
    fireEvent.blur(box());
    await act(async () => {});
    expect(notes.save).not.toHaveBeenCalled();
  });

  it('keeps the text and offers a retry when saving fails', async () => {
    notes.save.mockRejectedValueOnce(new Error('offline'));
    await renderPanel();

    fireEvent.change(box(), { target: { value: 'do not lose this' } });
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));
    await act(async () => {});

    expect(box()).toHaveValue('do not lose this');
    expect(screen.getByRole('status')).toHaveTextContent('trainerNote.status.failed');

    fireEvent.click(screen.getByRole('button', { name: 'trainerNote.retry' }));
    await act(async () => {});
    expect(notes.save).toHaveBeenLastCalledWith('c1', 'do not lose this');
    expect(screen.getByRole('status')).toHaveTextContent('trainerNote.status.savedAt');
  });
});
