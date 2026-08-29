import { useTranslation } from 'react-i18next';

import { StitchIcon, type StitchIconName } from '../common/StitchIcon';
import type { RecentRecommendationsProps } from '../../types/dashboard-components.types';

/**
 * AI insights — "Performance Lab" design.
 *
 * The oversized watermark glyph bleeding off the bottom-right is decorative
 * (aria-hidden) and sits under the content at 5% opacity.
 */

interface CategoryStyle {
  icon: StitchIconName;
  /** Colour for the leading glyph. */
  iconClass: string;
  /** Pill background/text for the category tag. */
  pill: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  training: {
    icon: 'lightbulb',
    iconClass: 'text-success',
    pill: 'bg-success-container text-on-success-container',
  },
  nutrition: {
    icon: 'warning',
    iconClass: 'text-warning',
    pill: 'bg-warning-container text-on-warning-container',
  },
  general: {
    icon: 'bedtime',
    iconClass: 'text-info',
    pill: 'bg-info-container text-on-info-container',
  },
};

export function RecentRecommendations({
  recommendations,
  action,
}: RecentRecommendationsProps) {
  const { t, i18n } = useTranslation();
  const recent = recommendations.slice(0, 4);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm relative overflow-hidden">
      {/* Decorative watermark */}
      <div
        aria-hidden="true"
        className="absolute -end-10 -bottom-10 opacity-5 pointer-events-none"
      >
        <StitchIcon name="psychology" size={160} />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <StitchIcon name="brain" size={18} />
        </div>
        <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
          {t('dashboard.aiRecommendations')}
        </h3>
        {recommendations.length > 0 && (
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
            {recommendations.length}
          </span>
        )}
        {/* Rendered by the parent so this card stays a presentational list and
            does not have to know the review feature exists. */}
        {action && <span className="ms-auto">{action}</span>}
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-on-surface-variant relative z-10">
          {t('dashboard.noRecommendations')}
        </p>
      ) : (
        <div className="space-y-4 relative z-10">
          {recent.map((rec) => {
            const style = CATEGORY_STYLES[rec.category] ?? CATEGORY_STYLES.general;
            return (
              <div
                key={rec._id}
                className="flex gap-4 p-4 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors"
              >
                <span className={`shrink-0 ${style.iconClass}`}>
                  <StitchIcon name={style.icon} size={20} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${style.pill}`}
                    >
                      {t(`dashboard.category.${rec.category}`, {
                        defaultValue: rec.category,
                      })}
                    </span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {rec.generatedBy === 'ai'
                        ? t('dashboard.byAi')
                        : t('dashboard.byTrainer')}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/70">
                      {new Date(rec.createdAt).toLocaleDateString(i18n.language, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {rec.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
