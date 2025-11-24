/**
 * TrainingsActionsMenu - Radix UI DropdownMenu for training actions
 */

'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ActionIcon } from '@mantine/core';
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconCopy,
  IconFileTypePdf,
  IconFileTypeXls,
  IconTrash,
  IconShare,
  IconWorld,
} from '@tabler/icons-react';
import type { Training } from '../../types/training.types';
import '../../styles/DropdownMenu.css';

interface TrainingsActionsMenuProps {
  training: Training;
  isCoach?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExportPDF: (training: Training) => void;
  onExportExcel: (training: Training) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  onMakePublic?: (id: string) => void;
}

export function TrainingsActionsMenu({
  training,
  isCoach = false,
  onView,
  onEdit,
  onDuplicate,
  onExportPDF,
  onExportExcel,
  onDelete,
  onShare,
  onMakePublic,
}: TrainingsActionsMenuProps) {
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
            onSelect={() => onView(training.id)}
          >
            <IconEye size={16} />
            <span>View</span>
          </DropdownMenu.Item>

          {/* Edit */}
          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={() => onEdit(training.id)}
          >
            <IconEdit size={16} />
            <span>Edit</span>
          </DropdownMenu.Item>

          {/* Duplicate */}
          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={() => onDuplicate(training.id)}
          >
            <IconCopy size={16} />
            <span>Duplicate</span>
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

          {/* Coach-only actions */}
          {isCoach && (
            <>
              <DropdownMenu.Separator className="dropdown-menu-separator" />

              {/* Share */}
              {onShare && (
                <DropdownMenu.Item
                  className="dropdown-menu-item"
                  onSelect={() => onShare(training.id)}
                >
                  <IconShare size={16} />
                  <span>Share</span>
                </DropdownMenu.Item>
              )}

              {/* Make Public */}
              {onMakePublic && (
                <DropdownMenu.Item
                  className="dropdown-menu-item"
                  onSelect={() => onMakePublic(training.id)}
                >
                  <IconWorld size={16} />
                  <span>Make Public</span>
                </DropdownMenu.Item>
              )}

              {/* Delete */}
              {onDelete && (
                <>
                  <DropdownMenu.Separator className="dropdown-menu-separator" />
                  <DropdownMenu.Item
                    className="dropdown-menu-item dropdown-menu-item-danger"
                    onSelect={() => onDelete(training.id)}
                  >
                    <IconTrash size={16} />
                    <span>Delete</span>
                  </DropdownMenu.Item>
                </>
              )}
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
