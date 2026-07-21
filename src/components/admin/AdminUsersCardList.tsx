/**
 * AdminUsersCardList - Mobile card list view for users
 */

import { useTranslation } from 'react-i18next';
import { AdminUsersCard } from './AdminUsersCard';

import type { AdminUsersCardListProps } from '../../types/admin.types';

export function AdminUsersCardList({
  users,
  onView,
}: AdminUsersCardListProps) {
  const { t } = useTranslation();

  if (users.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10">
        <p className="text-on-surface-variant">{t('admin.noUsers')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {users.map((user) => (
        <AdminUsersCard
          key={user._id}
          user={user}
          onView={onView}
        />
      ))}
    </div>
  );
}
