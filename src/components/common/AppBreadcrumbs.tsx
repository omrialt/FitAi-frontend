/**
 * AppBreadcrumbs - Reusable breadcrumb navigation component
 */

import { Breadcrumbs, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { AppBreadcrumbsProps } from '../../types/common.types';

export function AppBreadcrumbs({ items, mb = 'md' }: AppBreadcrumbsProps) {
  const isMobile = useIsMobile();

  // Phones: the app bar's back button (AppLayout, detail routes) and the
  // bottom nav already say where you are and how to go up; a second back row
  // here only pushed the page title down.
  if (isMobile) return null;

  // Desktop: show full breadcrumb trail
  return (
    <Breadcrumbs mb={mb}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (isLast || !item.href) {
          return <span key={index}>{item.label}</span>;
        }
        
        return (
          <Anchor key={index} component={Link} to={item.href}>
            {item.label}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
}
