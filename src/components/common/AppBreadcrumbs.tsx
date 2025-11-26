/**
 * AppBreadcrumbs - Reusable breadcrumb navigation component
 */

import { Breadcrumbs, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
  mb?: string | number;
}

export function AppBreadcrumbs({ items, mb = 'md' }: AppBreadcrumbsProps) {
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
