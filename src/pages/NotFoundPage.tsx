import { Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * 404 — screen 07.
 *
 * The numeral is the artwork: 88px, weight 900, tabular, in primary, sitting on
 * the same radial indigo wash the auth screens use. The design treats a dead
 * end as a guest surface rather than a bare error, so it carries the mono
 * eyebrow and the two-CTA stack — one to the dashboard, one sideways into
 * trainings — instead of a single "go home" button.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="guest-wash min-h-[70vh]">
      <Container size="sm">
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <span className="text-[88px] font-black leading-[0.85] tracking-[-0.06em] tabular-nums text-primary">
            404
          </span>

          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
            {t('notFound.eyebrow')}
          </span>

          <h1 className="text-[22px] font-black leading-tight tracking-tight text-on-surface">
            {t('notFound.title')}
          </h1>

          <p className="max-w-[30ch] text-sm leading-relaxed text-on-surface-variant">
            {t('notFound.text')}
          </p>

          <div className="flex w-full flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-primary-gradient grid h-[50px] place-items-center rounded-lg text-sm font-extrabold text-white"
            >
              {t('notFound.goHome')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-trainings')}
              className="grid min-h-11 place-items-center text-[13px] font-semibold text-primary"
            >
              {t('notFound.goTrainings')}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
