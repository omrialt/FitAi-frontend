import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader, Modal, SegmentedControl, Switch } from '@mantine/core';
import { toast } from 'sonner';
import { isNativeApp } from '../../config/platform';
import { workoutSessionService } from '../../services/workout-session.service';
import { shareFile, stripDataUri } from '../../services/share-file';
import { useAuthStore } from '../../store/authStore';
import {
  buildCardModel,
  renderCard,
  type CardFormat,
  type CardLabels,
} from '../../utils/workoutCard';
import type { WorkoutSessionSummary } from '../../types/workout-session.types';

interface ShareWorkoutCardProps {
  sessionId: string | null;
  onClose: () => void;
}

/**
 * Preview and share a branded image of one workout. In the app it goes to the
 * share sheet; on the web to the browser's share (phones) or a download.
 * The name is off by default: nothing about a person leaves the app unasked.
 */
export function ShareWorkoutCard({ sessionId, onClose }: ShareWorkoutCardProps) {
  const { t, i18n } = useTranslation();
  const fullName = useAuthStore((state) => state.user?.fullName);
  const [summary, setSummary] = useState<WorkoutSessionSummary | null>(null);
  const [failed, setFailed] = useState(false);
  const [format, setFormat] = useState<CardFormat>('feed');
  const [showName, setShowName] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    setSummary(null);
    setImage(null);
    setFailed(false);
    workoutSessionService
      .getSummary(sessionId)
      .then((s) => !cancelled && setSummary(s))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const labels: CardLabels = useMemo(
    () => ({
      duration: t('shareCard.duration'),
      volume: t('shareCard.volume'),
      sets: t('shareCard.sets'),
      minutes: t('shareCard.minutes'),
      kg: t('shareCard.kg'),
      topSet: t('shareCard.topSet'),
      records: t('shareCard.records'),
      record: t('shareCard.record'),
      freeSession: t('workout.freeSession'),
    }),
    [t],
  );

  useEffect(() => {
    if (!summary) return;
    let cancelled = false;
    const model = buildCardModel(summary, {
      format,
      showName,
      name: fullName,
      locale: i18n.language,
      labels,
    });
    renderCard(model)
      .then((url) => !cancelled && setImage(url))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [summary, format, showName, fullName, i18n.language, labels]);

  const share = async () => {
    if (!image) return;
    const filename = `fitai-workout-${new Date().toISOString().slice(0, 10)}.png`;
    setSharing(true);
    try {
      if (isNativeApp) {
        await shareFile(filename, stripDataUri(image), t('shareCard.title'));
        return;
      }
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t('shareCard.title') });
        return;
      }
      const link = document.createElement('a');
      link.href = image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      // Closing the browser's share sheet is a choice, not a failure.
      if ((error as { name?: string })?.name !== 'AbortError') toast.error(t('shareCard.failed'));
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal opened={!!sessionId} onClose={onClose} title={t('shareCard.title')} centered size="md">
      <div className="flex flex-col gap-4">
        <SegmentedControl
          fullWidth
          value={format}
          onChange={(value) => setFormat(value as CardFormat)}
          data={[
            { value: 'feed', label: t('shareCard.feed') },
            { value: 'story', label: t('shareCard.story') },
          ]}
        />
        <Switch
          checked={showName}
          onChange={(e) => setShowName(e.currentTarget.checked)}
          label={t('shareCard.showName')}
        />

        <div className="flex min-h-64 items-center justify-center rounded-xl bg-surface-container-low p-2">
          {failed ? (
            <p className="text-sm text-error" role="alert">
              {t('shareCard.loadFailed')}
            </p>
          ) : image ? (
            <img
              src={image}
              alt={t('shareCard.previewAlt')}
              className="max-h-[60vh] w-auto rounded-lg"
            />
          ) : (
            <Loader color="indigo" />
          )}
        </div>

        <button
          type="button"
          onClick={() => void share()}
          disabled={!image || sharing}
          className="rounded-lg bg-primary px-4 py-3 font-bold text-white transition disabled:opacity-60"
        >
          {t('shareCard.share')}
        </button>
      </div>
    </Modal>
  );
}
