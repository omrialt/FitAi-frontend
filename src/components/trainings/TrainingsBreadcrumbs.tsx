/**
 * TrainingsBreadcrumbs - Breadcrumb navigation for trainings page
 */

import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { AppBreadcrumbs } from '../common/AppBreadcrumbs';

export function TrainingsBreadcrumbs() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  const items = [
    { label: t('nav.home'), href: '/' },
    { label: isAdmin ? t('nav.trainingPlans') : t('nav.myTrainings') },
  ];

  return <AppBreadcrumbs items={items} />;
}
