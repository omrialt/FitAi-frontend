import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { WelcomeSectionProps } from '../../types/dashboard-components.types';

/**
 * Welcome banner — "Performance Lab" design.
 *
 * The blurred indigo orb bleeding off the top-right corner is the design's
 * "Tonal Depth" treatment; it is decorative and sits behind the content via
 * z-index rather than affecting layout.
 */

function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.goodMorning';
  if (hour < 18) return 'dashboard.goodAfternoon';
  return 'dashboard.goodEvening';
}

/** Phase pill styling, keyed off the user's current training target. */
const phaseConfig = {
  bulk: {
    labelKey: 'dashboard.phaseBulking',
    pill: 'bg-warning-container text-on-warning-container border-warning/50',
  },
  cut: {
    labelKey: 'dashboard.phaseCutting',
    pill: 'bg-danger-container text-on-danger-container border-danger/50',
  },
  maintain: {
    labelKey: 'dashboard.phaseMaintaining',
    pill: 'bg-secondary-container text-on-secondary-container border-secondary/50',
  },
};

export function WelcomeSection({ user, currentStatus }: WelcomeSectionProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const greeting = t(getGreetingKey());
  const phase = currentStatus?.phase || user.target || 'maintain';
  const config = phaseConfig[phase];

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const lastWorkout = currentStatus?.lastWorkoutDate
    ? new Date(currentStatus.lastWorkoutDate).toLocaleDateString(i18n.language, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <section className="bg-surface-container-low rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div
        aria-hidden="true"
        className="absolute -end-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
      />

      <div className="flex items-center gap-6 relative z-10">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full border-4 border-surface-container-low shadow-xl overflow-hidden bg-primary/10 flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                alt={user.fullName}
                className="w-full h-full object-cover"
                src={user.avatarUrl}
              />
            ) : (
              <span className="text-xl font-black text-primary">{initials}</span>
            )}
          </div>
          {/* Active indicator */}
          <div className="absolute -bottom-1 -end-1 w-6 h-6 bg-success border-4 border-surface-container-low rounded-full" />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">
              {greeting}, {user.fullName.split(' ')[0]}
            </h2>
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${config.pill}`}
            >
              {t(config.labelKey)}
            </span>
          </div>
          <p className="text-on-surface-variant font-medium text-sm flex items-center gap-2">
            <StitchIcon name="event_available" size={16} />
            {lastWorkout
              ? `${t('dashboard.lastWorkout')} ${lastWorkout}`
              : t('dashboard.noWorkoutsYet')}
          </p>
        </div>
      </div>

      <div className="flex gap-4 relative z-10">
        <button
          type="button"
          onClick={() => navigate('/my-trainings')}
          className="bg-primary-gradient text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          {t('dashboard.startTodaysSession')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/nutrition-plans')}
          className="bg-surface-container-lowest text-on-surface px-6 py-3 rounded-lg font-bold text-sm border border-outline-variant/15 hover:bg-surface-container-low transition-colors"
        >
          {t('dashboard.logMeal')}
        </button>
      </div>
    </section>
  );
}
