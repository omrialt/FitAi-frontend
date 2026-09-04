import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { bodyPhotoService } from '../../services/body-photo.service';
import type { BodyPhoto, PhotoPose } from '../../types/body-photo.types';

/**
 * The progress-photo timeline.
 *
 * Two things about the UI carry the privacy model rather than merely reflecting
 * it, and both are worth keeping if this is ever redesigned:
 *
 *   - **The upload form has no sharing control.** Not a checkbox defaulted to
 *     off — none at all. A photo is private when it is created, and sharing is
 *     a deliberate second action on a photo the user is already looking at.
 *     There is no moment where a mis-click shares one.
 *
 *   - **Sharing asks for confirmation, un-sharing does not.** The two
 *     directions are not symmetrical: the mistake worth preventing is showing
 *     someone a photo they meant to keep, and adding friction to taking it back
 *     would be protecting the wrong party.
 *
 * The URLs are signed and minted per request. Nothing here caches one — no
 * localStorage, no store — because a signed URL is a bearer capability that
 * outlives the permission it was issued under.
 */

const POSES: PhotoPose[] = ['front', 'side', 'back', 'other'];

function PhotoCard({
  photo,
  onChanged,
}: {
  photo: BodyPhoto;
  onChanged: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);

  const shared = photo.visibility === 'trainer';

  const toggleSharing = async () => {
    // Sharing is the direction that needs a moment's thought. Taking it back
    // does not, and asking would be protecting the wrong person.
    if (!shared && !window.confirm(t('photos.confirmShare'))) return;

    setBusy(true);
    try {
      await bodyPhotoService.setVisibility(
        photo.id,
        shared ? 'private' : 'trainer',
      );
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(t('photos.confirmDelete'))) return;

    setBusy(true);
    try {
      await bodyPhotoService.remove(photo.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
      <img
        src={photo.url}
        alt={t('photos.altText', {
          pose: t(`photos.pose_${photo.pose}`),
          date: new Date(photo.takenAt).toLocaleDateString(i18n.language),
        })}
        loading="lazy"
        className="aspect-[3/4] w-full object-cover"
      />

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <span className="flex-1 text-sm font-bold text-on-surface">
            {new Date(photo.takenAt).toLocaleDateString(i18n.language)}
          </span>
          {photo.weightKg !== null && (
            <span className="text-xs text-on-surface-variant">
              {t('photos.weight', { weight: photo.weightKg })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {t(`photos.pose_${photo.pose}`)}
          </span>

          {/* The state is always visible on the photo itself, never only in a
              settings screen — someone scrolling their timeline can see at a
              glance which of these their trainer can see. */}
          <span
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
              shared
                ? 'bg-warning-container text-on-warning-container'
                : 'bg-success-container text-on-success-container'
            }`}
          >
            <StitchIcon name={shared ? 'visibility' : 'lock'} size={12} />
            {t(shared ? 'photos.sharedWithTrainer' : 'photos.private')}
          </span>
        </div>

        {photo.note && (
          <p className="text-xs text-on-surface-variant">{photo.note}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void toggleSharing()}
            disabled={busy}
            className="min-h-10 flex-1 rounded-lg border border-outline-variant/40 text-xs font-bold text-on-surface-variant disabled:opacity-60"
          >
            {t(shared ? 'photos.stopSharing' : 'photos.shareWithTrainer')}
          </button>

          <button
            type="button"
            onClick={() => void remove()}
            disabled={busy}
            aria-label={t('common.delete')}
            className="min-h-10 min-w-10 rounded-lg border border-outline-variant/40 text-error disabled:opacity-60"
          >
            <StitchIcon name="delete" size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}

export function BodyPhotoTimeline() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<BodyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  /**
   * A translation *key*, not a sentence. Translating at render keeps `t` out
   * of the fetch, which means the effect below depends on nothing that changes
   * identity between renders — otherwise the timeline re-fetches on every
   * language-provider update and every signed URL is re-minted for nothing.
   */
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pose, setPose] = useState<PhotoPose>('front');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    bodyPhotoService
      .listMine()
      .then(setPhotos)
      .catch(() => setErrorKey('photos.loadFailed'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setErrorKey(null);

    try {
      await bodyPhotoService.upload(file, { pose });
      load();
    } catch {
      setErrorKey('photos.uploadFailed');
    } finally {
      setUploading(false);
      // Cleared so the same file can be picked again after a failure.
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5">
      <header className="mb-1 flex items-center gap-2">
        <StitchIcon name="monitoring" size={18} />
        <h2 className="text-base font-extrabold tracking-tight text-on-surface">
          {t('photos.title')}
        </h2>
      </header>

      {/* Stated before the upload button, not after it. The privacy rule is
          part of the offer, not a disclosure buried under it. */}
      <p className="mb-4 text-xs text-on-surface-variant">
        {t('photos.privacyNote')}
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {POSES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={pose === option}
            onClick={() => setPose(option)}
            className={`min-h-9 rounded-lg border px-3 text-xs font-bold ${
              pose === option
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline-variant/40 text-on-surface-variant'
            }`}
          >
            {t(`photos.pose_${option}`)}
          </button>
        ))}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="ms-auto min-h-10 rounded-lg bg-primary-gradient px-4 text-sm font-bold text-white disabled:opacity-60"
        >
          {uploading ? t('photos.uploading') : t('photos.addPhoto')}
        </button>
      </div>

      {errorKey && (
        <p className="mb-3 text-sm font-bold text-error" role="alert">
          {t(errorKey)}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-on-surface-variant">{t('common.loading')}</p>
      ) : photos.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{t('photos.empty')}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onChanged={load} />
          ))}
        </ul>
      )}
    </section>
  );
}
