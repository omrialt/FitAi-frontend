import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';

/**
 * Split-panel shell shared by the auth screens (login, register, reset,
 * complete-profile), per the Stitch auth designs.
 *
 * The brand panel collapses below `lg`, where the form takes the full width and
 * grows its own compact header — matching the mobile exports.
 *
 * The designs include a "Join 5,000+ athletes" social-proof card on the brand
 * panel. That is a factual claim about the business, so it is deliberately not
 * reproduced; add it once there is a real number to show.
 */

interface AuthLayoutProps {
  /** Heading above the form (desktop panel). */
  title: string;
  /** Supporting line under the heading. */
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-surface flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden ambient-glow bg-surface-container-lowest">
        {/* Brand panel — desktop only */}
        <aside className="hidden lg:flex flex-col justify-between bg-surface-container-high p-12">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-11 h-11 auth-gradient rounded-xl flex items-center justify-center">
                <StitchIcon name="bolt" size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-on-surface">
                FitAi
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-on-surface leading-[1.1] mb-6">
              {t('auth.brandHeadline')}{' '}
              <span className="text-primary italic">
                {t('auth.brandHeadlineAccent')}
              </span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
              {t('auth.brandSubcopy')}
            </p>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center p-8 lg:p-12 bg-surface-container-lowest">
          <div className="w-full max-w-[400px] mx-auto space-y-8">
            {/* Compact header on mobile, where the brand panel is hidden */}
            <div className="space-y-2 lg:hidden flex flex-col items-center text-center">
              <div className="w-12 h-12 auth-gradient rounded-xl flex items-center justify-center mb-4">
                <StitchIcon name="bolt" size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-on-surface">
                {title}
              </h2>
              <p className="text-on-surface-variant">{subtitle}</p>
            </div>

            <div className="hidden lg:block space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-on-surface">
                {title}
              </h2>
              <p className="text-on-surface-variant">{subtitle}</p>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
