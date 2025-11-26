/**
 * TrainingsBreadcrumbs - Breadcrumb navigation for trainings page
 */

import { useAuth } from '../../hooks/useAuth';
import { AppBreadcrumbs } from '../common/AppBreadcrumbs';

export function TrainingsBreadcrumbs() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const items = [
    { label: 'Home', href: '/' },
    { label: isAdmin ? 'Training Plans' : 'My Trainings' },
  ];

  return <AppBreadcrumbs items={items} />;
}
