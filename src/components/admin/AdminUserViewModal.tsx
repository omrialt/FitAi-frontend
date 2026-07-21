import { Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { StitchIcon } from "../common/StitchIcon";
import type { AdminUserViewModalProps } from '../../types/admin.types';

/** Admin user detail — "Performance Lab" design. */

const getRolePill = (role: string) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "bg-error-container text-on-error-container";
    case "trainer":
      return "bg-primary/10 text-primary";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
};

/** One label/value pair in the details grid. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="text-sm text-on-surface">{children}</p>
    </div>
  );
}

export function AdminUserViewModal({ opened, onClose, user }: AdminUserViewModalProps) {
  const { t, i18n } = useTranslation();

  if (!user) return null;

  const handleViewProfile = () => {
    // TODO: Navigate to the user's profile page once that route exists
  };

  const dash = t('common.none');
  const fmt = (d?: string | Date) =>
    d ? new Date(d).toLocaleDateString(i18n.language) : dash;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="700"
      centered
      title={
        <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
          {t('admin.userDetails')}
        </h3>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <span className="w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-black flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-20 h-20 object-cover"
              />
            ) : (
              user.fullName?.charAt(0)?.toUpperCase()
            )}
          </span>

          <div className="min-w-0">
            <p className="text-xl font-black text-on-surface truncate">
              {user.fullName}
            </p>
            <p className="text-sm text-on-surface-variant truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${getRolePill(user.role)}`}
              >
                {t(`admin.role_${user.role}`, { defaultValue: user.role })}
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  user.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {user.isActive ? t('common.active') : t('common.inactive')}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-5 pt-6 border-t border-outline-variant/10">
          <Field label={t('admin.role')}>
            <span className="capitalize">
              {t(`admin.role_${user.role}`, { defaultValue: user.role })}
            </span>
          </Field>
          <Field label={t('admin.status')}>
            {user.isActive ? t('common.active') : t('common.inactive')}
          </Field>
          <Field label={t('admin.authProvider')}>
            <span className="capitalize">{user.authProvider || dash}</span>
          </Field>
          <Field label={t('admin.birthdate')}>{fmt(user.birthDate)}</Field>
          <Field label={t('admin.joinDate')}>{fmt(user.createdAt)}</Field>
          <Field label={t('admin.lastUpdated')}>{fmt(user.updatedAt)}</Field>
        </div>

        {/* Activity */}
        <div className="pt-6 border-t border-outline-variant/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
            {t('admin.activityStats')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: t('admin.trainingPrograms'),
                value: user.trainingPlansCount ?? 0,
              },
              { label: t('admin.mealPlans'), value: user.nutritionPlansCount ?? 0 },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-surface-container-low rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-black text-on-surface">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleViewProfile}
          className="w-full flex items-center justify-center gap-2 bg-surface-container-high text-on-surface py-3 rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-colors"
        >
          <StitchIcon name="person" size={18} />
          {t('admin.viewFullProfile')}
        </button>
      </div>
    </Modal>
  );
}
