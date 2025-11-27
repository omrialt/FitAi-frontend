/**
 * AdminUsersBreadcrumbs - Breadcrumb navigation for admin users page
 */

import { AppBreadcrumbs } from '../common/AppBreadcrumbs';

export function AdminUsersBreadcrumbs() {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Admin' },
    { label: 'Users' },
  ];

  return <AppBreadcrumbs items={items} />;
}
