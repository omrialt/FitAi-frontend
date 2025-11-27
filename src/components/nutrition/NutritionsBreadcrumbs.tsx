/**
 * NutritionsBreadcrumbs - Breadcrumb navigation for nutrition plans page
 */

import { useAuth } from '../../hooks/useAuth';
import { AppBreadcrumbs } from '../common/AppBreadcrumbs';

export function NutritionsBreadcrumbs() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const items = [
    { label: 'Home', href: '/' },
    { label: isAdmin ? 'Nutrition Plans' : 'My Nutrition Plans' },
  ];

  return <AppBreadcrumbs items={items} />;
}
