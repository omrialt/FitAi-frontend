/**
 * NutritionsBreadcrumbs - Breadcrumb navigation for nutrition plans page
 */

import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { AppBreadcrumbs } from '../common/AppBreadcrumbs';

export function NutritionsBreadcrumbs() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  const items = [
    { label: t('nav.home'), href: '/' },
    { label: isAdmin ? t('nutrition.titleAdmin') : t('nutrition.title') },
  ];

  return <AppBreadcrumbs items={items} />;
}
