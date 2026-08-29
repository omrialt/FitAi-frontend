import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { StitchIcon } from '../common/StitchIcon';
import { aiReviewService } from '../../services/ai-review.service';

/**
 * Asks for a weekly training review.
 *
 * Hidden entirely unless the server reports the feature configured, rather
 * than shown and failing on tap: this is the one feature in the app that costs
 * money per use, and an unconfigured deployment should look like it simply
 * does not have it.
 *
 * "Not enough data" comes back as a 422 and is surfaced as information, not as
 * an error — it is the expected answer for a new account and says nothing went
 * wrong.
 */
export function WeeklyReviewButton({ onCreated }: { onCreated?: () => void }) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    aiReviewService
      .getStatus()
      .then((status) => {
        if (!cancelled) setEnabled(status.enabled);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  if (!enabled) return null;

  const run = async () => {
    setWorking(true);
    try {
      await aiReviewService.generateForMe();
      toast.success(t('aiReview.created'));
      onCreated?.();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 422) {
        toast.info(t('aiReview.notEnoughData'));
      } else {
        toast.error(t('aiReview.failed'));
      }
    } finally {
      setWorking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={working}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-outline-variant/40 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
    >
      <StitchIcon name="lightbulb" size={14} />
      {working ? t('aiReview.working') : t('aiReview.generate')}
    </button>
  );
}
