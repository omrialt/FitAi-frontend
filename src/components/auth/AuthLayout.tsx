import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';

/**
 * Shell shared by the auth screens (login, register, reset, complete-profile).
 *
 * Rebuilt to the guest surface in screens 01–03: a radial indigo bloom from the
 * top of the viewport rather than a card sitting on a flat page. The previous
 * version split the screen into a solid `surface-container-high` panel beside
 * the form — that read as a grey slab once the dark-first palette landed, and
 * the design's guest surfaces carry depth as ambient glow, never as a filled
 * block.
 *
 * The brand copy still appears from `lg`, but now shares the same wash as the
 * form instead of being fenced off in its own panel.
 *
 * The designs include a "Join 5,000+ athletes" social-proof card. That is a
 * factual claim about the business, so it is deliberately not reproduced; add
 * it once there is a real number to show.
 */

interface AuthLayoutProps {
  /** Heading above the form. */
  title: string;
  /** Supporting line under the heading. */
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="guest-wash min-h-screen w-full p-4 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Brand copy — from lg, on the same wash as the form */}
          <aside className="hidden lg:flex lg:flex-col">
            <div className="mb-14 flex items-center gap-3">
              <div className="bg-primary-gradient grid h-11 w-11 place-items-center rounded-xl shadow-lg shadow-primary/30">
                <StitchIcon name="bolt" size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-on-surface">
                FitAi
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-black leading-[1.05] tracking-[-0.04em] text-on-surface">
              {t('auth.brandHeadline')}{' '}
              <span className="text-primary">{t('auth.brandHeadlineAccent')}</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
              {t('auth.brandSubcopy')}
            </p>
          </aside>

          {/* Form */}
          <main className="w-full">
            <div className="mx-auto w-full max-w-[400px] space-y-6">
              {/* The mark leads the column below lg, where the brand copy is hidden */}
              <div className="bg-primary-gradient grid h-11 w-11 place-items-center rounded-xl shadow-lg shadow-primary/30 lg:hidden">
                <StitchIcon name="bolt" size={24} className="text-white" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-[30px] font-black leading-[1.05] tracking-[-0.04em] text-on-surface">
                  {title}
                </h2>
                <p className="text-sm text-on-surface-variant">{subtitle}</p>
              </div>

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
