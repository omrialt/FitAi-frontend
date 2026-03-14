/**
 * NutritionsActionsMenu - Radix UI DropdownMenu for nutrition plan actions
 */

'use client';

import { Activity } from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ActionIcon } from '@mantine/core';
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconFileTypePdf,
  IconFileTypeXls,
  IconTrash,
  IconCircleCheck,
} from '@tabler/icons-react';
import type { NutritionPlan } from '../../types/nutrition.types';
import '../../styles/DropdownMenu.css';
import type { NutritionsActionsMenuProps } from '../../types/nutrition-components.types';

export function NutritionsActionsMenu({
  nutritionPlan,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
  onActivate,
}: NutritionsActionsMenuProps) {
  // Check if current user is the owner of the nutrition plan
  const nutritionUserId = typeof nutritionPlan.userId === 'string' 
    ? nutritionPlan.userId 
    : nutritionPlan.userId?._id;
  const isOwner = currentUserId === nutritionUserId || isAdmin;

  // Check if this plan is active for current user
  const isActive = nutritionPlan.activeByUsers?.some((userId) => {
    const id = typeof userId === 'string' ? userId : userId._id;
    return id === currentUserId;
  });

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
            onSelect={() => onView(nutritionPlan._id)}
          >
            <IconEye size={16} />
            <span>View</span>
          </DropdownMenu.Item>

          {/* Make Active */}
          <Activity mode={onActivate && !isActive ? "visible" : "hidden"}>
            <DropdownMenu.Item
              className="dropdown-menu-item"
              onSelect={() => onActivate && onActivate(nutritionPlan._id)}
            >
              <IconCircleCheck size={16} />
              <span>Make Active</span>
            </DropdownMenu.Item>
          </Activity>

          {/* Edit - only for owner */}
          <Activity mode={isOwner ? "visible" : "hidden"}>
            <DropdownMenu.Item
              className="dropdown-menu-item"
              onSelect={() => onEdit(nutritionPlan._id)}
            >
              <IconEdit size={16} />
              <span>Edit</span>
            </DropdownMenu.Item>
          </Activity>

          <DropdownMenu.Separator className="dropdown-menu-separator" />

          {/* Export submenu */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="dropdown-menu-item">
              <IconFileTypePdf size={16} />
              <span>Export</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                className="dropdown-menu-content"
                sideOffset={2}
                alignOffset={-5}
              >
                <DropdownMenu.Item
                  className="dropdown-menu-item"
                  onSelect={() => onExportPDF(nutritionPlan)}
                >
                  <IconFileTypePdf size={16} />
                  <span>Export as PDF</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="dropdown-menu-item"
                  onSelect={() => onExportExcel(nutritionPlan)}
                >
                  <IconFileTypeXls size={16} />
                  <span>Export as Excel</span>
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          {/* Delete - only for owner */}
          <Activity mode={onDelete && isOwner ? "visible" : "hidden"}>
            <DropdownMenu.Separator className="dropdown-menu-separator" />
            <DropdownMenu.Item
              className="dropdown-menu-item dropdown-menu-item-danger"
              onSelect={() => onDelete && onDelete(nutritionPlan._id)}
            >
              <IconTrash size={16} />
              <span>Delete</span>
            </DropdownMenu.Item>
          </Activity>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
