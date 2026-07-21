/**
 * AdminUsersActionsMenu - Radix UI DropdownMenu for user actions
 */

'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ActionIcon } from '@mantine/core';
import { IconDotsVertical, IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { AdminUsersActionsMenuProps } from '../../types/admin.types';
import '../../styles/DropdownMenu.css';

export function AdminUsersActionsMenu({
  user,
  onView,
}: AdminUsersActionsMenuProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionIcon variant="subtle" color="gray">
          <IconDotsVertical size={16} />
        </ActionIcon>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="dropdown-menu-content" sideOffset={5}>
          {/* View */}
          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={() => onView(user)}
          >
            <IconEye size={16} />
            <span>{t('common.view')}</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
