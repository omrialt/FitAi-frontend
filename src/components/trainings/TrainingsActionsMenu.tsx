/**
 * TrainingsActionsMenu - Radix UI DropdownMenu for training actions
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
} from '@tabler/icons-react';
import type { TrainingPlan } from '../../types/training.types';
import '../../styles/DropdownMenu.css';

interface TrainingsActionsMenuProps {
  training: TrainingPlan;
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (training: TrainingPlan) => void;
  onExportExcel: (training: TrainingPlan) => void;
  onDelete?: (id: string) => void;
}

export function TrainingsActionsMenu({
  training,
  isAdmin = false,
  currentUserId,
  onView,
  onEdit,
  onExportPDF,
  onExportExcel,
  onDelete,
}: TrainingsActionsMenuProps) {
  // Check if current user is the owner of the training
  const trainingUserId = typeof training.userId === 'string' ? training.userId : training.userId?._id;
  const isOwner = currentUserId === trainingUserId;
  const canDelete = isAdmin || isOwner;
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
            onSelect={() => onView(training._id)}
          >
            <IconEye size={16} />
            <span>View</span>
          </DropdownMenu.Item>

          {/* Edit */}
          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={() => onEdit(training._id)}
          >
            <IconEdit size={16} />
            <span>Edit</span>
          </DropdownMenu.Item>

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
                  onSelect={() => onExportPDF(training)}
                >
                  <IconFileTypePdf size={16} />
                  <span>Export as PDF</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="dropdown-menu-item"
                  onSelect={() => onExportExcel(training)}
                >
                  <IconFileTypeXls size={16} />
                  <span>Export as Excel</span>
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          {/* Delete - only for admin or owner */}
          <Activity mode={onDelete && canDelete ? "visible" : "hidden"}>
            <DropdownMenu.Separator className="dropdown-menu-separator" />
            <DropdownMenu.Item
              className="dropdown-menu-item dropdown-menu-item-danger"
              onSelect={() => onDelete && onDelete(training._id)}
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
