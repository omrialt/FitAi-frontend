/**
 * AdminUsersHeader - Page header with title for admin users page.
 * "Performance Lab" design.
 */

import { useTranslation } from 'react-i18next';

export function AdminUsersHeader() {
  const { t } = useTranslation();

  return (
    <header className="mb-8">
      <h1 className="font-bold text-on-surface">
        {t('admin.usersManagement')}
      </h1>
    </header>
  );
}
