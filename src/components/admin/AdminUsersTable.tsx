/**
 * AdminUsersTable — desktop table view for users.
 * "Performance Lab" design.
 */

"use client";

import { useTranslation } from "react-i18next";

import { AdminUsersActionsMenu } from "./AdminUsersActionsMenu";
import type { AdminUsersTableProps } from '../../types/admin.types';

const getRolePill = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-error-container text-on-error-container";
    case "trainer":
      return "bg-primary/10 text-primary";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
};

const TH =
  "text-start text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-6 py-4";

export function AdminUsersTable({ users, onView }: AdminUsersTableProps) {
  const { t, i18n } = useTranslation();

  if (users.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10">
        <p className="text-on-surface-variant">{t('admin.noUsers')}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              <th className={TH}>{t('admin.fullName')}</th>
              <th className={TH}>{t('admin.email')}</th>
              <th className={TH}>{t('admin.role')}</th>
              <th className={TH}>{t('admin.status')}</th>
              <th className={TH}>{t('admin.authProvider')}</th>
              <th className={TH}>{t('admin.trainingPlans')}</th>
              <th className={TH}>{t('admin.mealPlans')}</th>
              <th className={TH}>{t('admin.createdAt')}</th>
              <th className={TH}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                onClick={() => onView(u)}
                className="cursor-pointer hover:bg-surface-container-low/60 transition-colors"
              >
                <td className="px-6 py-5">
                  <span className="font-bold text-on-surface">{u.fullName}</span>
                </td>

                <td className="px-6 py-5">
                  <span className="text-sm text-on-surface-variant">{u.email}</span>
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${getRolePill(u.role)}`}
                  >
                    {t(`admin.role_${u.role}`, { defaultValue: u.role })}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${u.isActive ? 'bg-green-600' : 'bg-outline'}`}
                    />
                    <span
                      className={`text-sm font-medium ${u.isActive ? 'text-green-700' : 'text-on-surface-variant'}`}
                    >
                      {u.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <span className="text-sm text-on-surface capitalize">
                    {u.authProvider || t('common.none')}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-on-surface">
                    {u.trainingPlansCount ?? 0}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-on-surface">
                    {u.nutritionPlansCount ?? 0}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <span className="text-sm text-on-surface-variant">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString(i18n.language)
                      : t('common.none')}
                  </span>
                </td>

                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                  <AdminUsersActionsMenu user={u} onView={onView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
