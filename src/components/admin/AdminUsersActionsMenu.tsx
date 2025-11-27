/**
 * AdminUsersActionsMenu - Radix UI DropdownMenu for user actions
 */

'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ActionIcon } from '@mantine/core';
import {
  IconDotsVertical,
  IconEye,
} from '@tabler/icons-react';
import type { User } from '../../types/auth.types';
import '../../styles/DropdownMenu.css';

interface AdminUsersActionsMenuProps {
  user: User;
  onView: (user: User) => void;
}

export function AdminUsersActionsMenu({
  user,
  onView,
}: AdminUsersActionsMenuProps) {
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
            <span>View</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
