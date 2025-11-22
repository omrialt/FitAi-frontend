/**
 * Role guard and permission types
 */

import type { UserRole } from './auth.types';

export interface UseRoleGuardOptions {
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
  showError?: boolean;
  resourceType?: 'trainingPlan' | 'nutritionPlan' | 'user';
  resourceId?: string;
  resourceOwnerId?: string;
}

export type BasicUser = {
  _id: string;
  role: UserRole;
};

export interface UseRoleGuardReturn {
  // Role checks
  isAdmin: boolean;
  isTrainer: boolean;
  isUser: boolean;
  
  // Permission checks
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  
  // Resource checks
  isOwner: boolean;
  hasAccess: boolean;
  
  // State
  loading: boolean;
  user: BasicUser | null;
}
