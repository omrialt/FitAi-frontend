/**
 * AdminUsersCard - Individual user card for mobile view.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';

import { StitchIcon } from '../common/StitchIcon';
import type { AdminUsersCardProps } from '../../types/admin.types';

const getRolePill = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-error-container text-on-error-container';
    case 'trainer':
      return 'bg-primary/10 text-primary';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
};

export function AdminUsersCard({ user, onView }: AdminUsersCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-12 h-12 object-cover"
              />
            ) : (
              user.fullName?.charAt(0)?.toUpperCase()
            )}
          </span>

          <div className="min-w-0">
            <p className="font-bold text-on-surface truncate">{user.fullName}</p>
            <p className="text-sm text-on-surface-variant truncate">{user.email}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${getRolePill(user.role)}`}
              >
                {t(`admin.role_${user.role}`, { defaultValue: user.role })}
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  user.isActive
                    ? 'bg-success-container text-on-success-container'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {user.isActive ? t('common.active') : t('common.inactive')}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onView(user)}
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-2 rounded-lg font-bold text-xs hover:bg-primary/20 transition-colors shrink-0"
        >
          <StitchIcon name="visibility" size={16} />
          {t('common.view')}
        </button>
      </div>
    </div>
  );
}
