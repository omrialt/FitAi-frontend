import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import { templateService } from '../../services/coach.service';
import type { PeriodizationTemplateSummary } from '../../types/coach.types';

/**
 * The three shipped programmes.
 *
 * Sits next to the AI generator on purpose, and the copy is careful to say
 * which is which. A template is a known programme thousands of people run —
 * 5/3/1's percentages are the programme, not a preference — and it costs
 * nothing, works with no API key, and produces the same plan every time. The
 * generator is for the case a table cannot cover. Offering both without saying
 * so would make the free, deterministic option look like the lesser one.
 */
export function TemplatePicker({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (planId: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const hebrew = i18n.language.startsWith('he');

  const [templates, setTemplates] = useState<PeriodizationTemplateSummary[]>([]);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    templateService
      .list()
      .then((result) => {
        if (!cancelled) setTemplates(result);
      })
      .catch(() => {
        if (!cancelled) setError(t('coach.templatesFailed'));
      });

    return () => {
      cancelled = true;
    };
  }, [open, t]);

  if (!open) return null;

  const create = async (templateId: string) => {
    setCreating(templateId);
    setError(null);

    try {
      const plan = await templateService.create({
        templateId,
        language: hebrew ? 'he' : 'en',
      });
      onCreated(plan._id as string);
    } catch {
      setError(t('coach.templatesFailed'));
    } finally {
      setCreating(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('coach.templatesTitle')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface-container-lowest p-6">
        <header className="mb-1 flex items-center gap-2">
          <StitchIcon name="calendar_view_week" size={20} />
          <h2 className="flex-1 text-lg font-extrabold tracking-tight text-on-surface">
            {t('coach.templatesTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="min-h-10 min-w-10 rounded-lg text-on-surface-variant"
          >
            <StitchIcon name="close" size={18} />
          </button>
        </header>

        <p className="mb-5 text-xs text-on-surface-variant">
          {t('coach.templatesSubtitle')}
        </p>

        {error && (
          <p className="mb-3 text-sm font-bold text-error" role="alert">
            {error}
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {templates.map((template) => (
            <li
              key={template.id}
              className="rounded-lg border border-outline-variant/20 p-4"
            >
              <div className="mb-1 flex items-center gap-2">
                <h3 className="flex-1 text-base font-extrabold text-on-surface">
                  {hebrew ? template.nameHe : template.nameEn}
                </h3>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
                  {t('coach.templateDays', { count: template.daysPerWeek })}
                </span>
              </div>

              <p className="mb-3 text-sm text-on-surface-variant">
                {hebrew ? template.descriptionHe : template.descriptionEn}
              </p>

              <button
                type="button"
                onClick={() => void create(template.id)}
                disabled={creating !== null}
                className="min-h-10 w-full rounded-lg border border-primary text-sm font-bold text-primary disabled:opacity-60"
              >
                {creating === template.id
                  ? t('coach.templateCreating')
                  : t('coach.templateUse')}
              </button>
            </li>
          ))}
        </ul>

        {/* Said once, at the bottom: this is a plan you own from the moment it
            exists, not a subscription that will change under you. */}
        <p className="mt-4 text-xs text-on-surface-variant">
          {t('coach.templateOwnership')}
        </p>
      </div>
    </div>
  );
}
