/**
 * AdminUsersBreadcrumbs - Breadcrumb navigation for admin users page
 */

import { useTranslation } from 'react-i18next';
import { AppBreadcrumbs } from '../common/AppBreadcrumbs';

export function AdminUsersBreadcrumbs() {
  const { t } = useTranslation();

  const items = [
    { label: t('admin.home'), href: '/' },
    { label: t('admin.admin') },
    { label: t('admin.users') },
  ];

  return <AppBreadcrumbs items={items} />;
}
