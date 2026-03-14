/**
 * Prop types for admin user management components
 */

import type { User } from './auth.types';

export interface AdminUsersActionsMenuProps {
  user: User;
  onView: (user: User) => void;
}

export interface AdminUsersCardProps {
  user: User;
  onView: (user: User) => void;
}

export interface AdminUsersCardListProps {
  users: User[];
  onView: (user: User) => void;
}

export interface AdminUsersFiltersProps {
  roleFilter: string | null;
  setRoleFilter: (role: string | null) => void;
  nameFilter: string;
  setNameFilter: (name: string) => void;
}

export interface AdminUsersTableProps {
  users: User[];
  onView: (user: User) => void;
}

export interface AdminUserViewModalProps {
  opened: boolean;
  onClose: () => void;
  user: User | null;
}
