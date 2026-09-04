import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { BodyPhotoTimeline } from './BodyPhotoTimeline';
import { bodyPhotoService } from '../../services/body-photo.service';
import type { BodyPhoto } from '../../types/body-photo.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

vi.mock('../../services/body-photo.service', () => ({
  bodyPhotoService: {
    listMine: vi.fn(),
    upload: vi.fn(),
    setVisibility: vi.fn(),
    remove: vi.fn(),
  },
}));

const photo = (over: Partial<BodyPhoto> = {}): BodyPhoto => ({
  id: 'photo-1',
  url: 'https://res.cloudinary.com/x/authenticated/s--sig--/photo.jpg',
  pose: 'front',
  visibility: 'private',
  weightKg: 82,
  note: null,
  takenAt: '2026-09-01T09:00:00.000Z',
  width: 800,
  height: 1200,
  ...over,
});

describe('BodyPhotoTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bodyPhotoService.listMine).mockResolvedValue([photo()]);
    vi.mocked(bodyPhotoService.setVisibility).mockResolvedValue(
      photo({ visibility: 'trainer' }),
    );
    vi.mocked(bodyPhotoService.remove).mockResolvedValue(undefined);
    vi.mocked(bodyPhotoService.upload).mockResolvedValue(photo());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * The privacy rule is part of the offer, not a disclosure under it. If this
   * ever fails because the copy moved below the upload button, that is the
   * regression, not the test.
   */
  it('states the privacy rule before offering an upload', async () => {
    render(<BodyPhotoTimeline />);

    await waitFor(() => {
      expect(screen.getByText('photos.privacyNote')).toBeInTheDocument();
    });

    const note = screen.getByText('photos.privacyNote');
    const button = screen.getByText('photos.addPhoto');
    // Node.DOCUMENT_POSITION_FOLLOWING === 4
    expect(note.compareDocumentPosition(button) & 4).toBeTruthy();
  });

  /**
   * Not a checkbox defaulted to off — none at all. There is no moment in the
   * upload flow where a mis-click can share a photo.
   */
  it('offers no sharing control while uploading', async () => {
    render(<BodyPhotoTimeline />);

    await waitFor(() => {
      expect(screen.getByText('photos.addPhoto')).toBeInTheDocument();
    });

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    // Only the per-photo action exists, and it lives on a photo.
    expect(screen.getAllByText('photos.shareWithTrainer')).toHaveLength(1);
  });

  it('shows each photo’s state on the photo itself', async () => {
    vi.mocked(bodyPhotoService.listMine).mockResolvedValue([
      photo(),
      photo({ id: 'photo-2', visibility: 'trainer' }),
    ]);

    render(<BodyPhotoTimeline />);

    await waitFor(() => {
      expect(screen.getByText('photos.private')).toBeInTheDocument();
    });
    expect(screen.getByText('photos.sharedWithTrainer')).toBeInTheDocument();
  });

  /**
   * The asymmetry that matters. Sharing is the direction worth a confirmation;
   * un-sharing is not, and asking there would protect the wrong party.
   */
  it('confirms before sharing', async () => {
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirm);

    render(<BodyPhotoTimeline />);
    await waitFor(() =>
      expect(screen.getByText('photos.shareWithTrainer')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('photos.shareWithTrainer'));

    expect(confirm).toHaveBeenCalled();
    // Declined, so nothing was shared.
    expect(bodyPhotoService.setVisibility).not.toHaveBeenCalled();
  });

  it('does not confirm before un-sharing', async () => {
    vi.mocked(bodyPhotoService.listMine).mockResolvedValue([
      photo({ visibility: 'trainer' }),
    ]);
    const confirm = vi.fn().mockReturnValue(true);
    vi.stubGlobal('confirm', confirm);

    render(<BodyPhotoTimeline />);
    await waitFor(() =>
      expect(screen.getByText('photos.stopSharing')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('photos.stopSharing'));

    expect(confirm).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(bodyPhotoService.setVisibility).toHaveBeenCalledWith(
        'photo-1',
        'private',
      );
    });
  });

  it('shares the photo when the confirmation is accepted', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    render(<BodyPhotoTimeline />);
    await waitFor(() =>
      expect(screen.getByText('photos.shareWithTrainer')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('photos.shareWithTrainer'));

    await waitFor(() => {
      expect(bodyPhotoService.setVisibility).toHaveBeenCalledWith(
        'photo-1',
        'trainer',
      );
    });
    // Re-read rather than patched in place: the URL is minted per request and
    // must not be reused across a permission change.
    expect(bodyPhotoService.listMine).toHaveBeenCalledTimes(2);
  });
});
