/**
 * AppBreadcrumbs - Reusable breadcrumb navigation component
 */

import { Breadcrumbs, Anchor, Button, Group } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import type { BreadcrumbItem, AppBreadcrumbsProps } from '../../types/common.types';

export function AppBreadcrumbs({ items, mb = 'md' }: AppBreadcrumbsProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // On mobile, show only the previous item with a back button
  if (isMobile && items.length > 1) {
    const previousItem = items[items.length - 2];
    
    return (
      <Group mb={mb}>
        <Button
          component={Link}
          to={previousItem.href || '/'}
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          size="compact-sm"
        >
          {previousItem.label}
        </Button>
      </Group>
    );
  }

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
