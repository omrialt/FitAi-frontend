/**
 * useRoleGuard Hook
 * 
 * Return boolean flags for user permissions (canView, canEdit, isAdmin) and redirect if unauthorized.
 * Integrates with authentication store and provides role-based access control.
 * 
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { isAdmin, canEdit, canView, loading } = useRoleGuard({
 *     requiredRole: 'admin',
 *     redirectTo: '/dashboard',
 *   });
 * 
 *   if (loading) return <Loader />;
 *   if (!isAdmin) return null; // Already redirected
 * 
 *   return <div>Admin Only Content</div>;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function TrainingPlanEditor({ planId }: { planId: string }) {
 *   const { canEdit, isOwner, isTrainer } = useRoleGuard({
 *     resourceType: 'trainingPlan',
 *     resourceId: planId,
 *   });
 * 
 *   return (
 *     <div>
 *       <TrainingPlanView planId={planId} />
 *       {canEdit && <EditButton />}
 *       {isOwner && <DeleteButton />}
 *       {isTrainer && <ShareButton />}
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import type {
  UseRoleGuardOptions,
  UseRoleGuardReturn,
} from '../types/role.types';

export function useRoleGuard(options: UseRoleGuardOptions = {}): UseRoleGuardReturn {
  const {
    requiredRole,
    redirectTo = '/login',
    showError = true,
    resourceType,
    resourceId,
    resourceOwnerId,
  } = options;

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Role checks
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isTrainer = useMemo(() => user?.role === 'trainer' || isAdmin, [user, isAdmin]);
  const isUser = useMemo(() => user?.role === 'user', [user]);

  // Owner check
  const isOwner = useMemo(() => {
    if (!user || !resourceOwnerId) return false;
    return user._id === resourceOwnerId;
  }, [user, resourceOwnerId]);

  // Access level checks
  const canView = useMemo(() => {
    if (!user) return false;
    if (isAdmin) return true;
    if (isOwner) return true;
    if (isTrainer && resourceType) return true;
    return false;
  }, [user, isAdmin, isOwner, isTrainer, resourceType]);

  const canEdit = useMemo(() => {
    if (!user) return false;
    if (isAdmin) return true;
    if (isOwner) return true;
    if (isTrainer && resourceType) return true;
    return false;
  }, [user, isAdmin, isOwner, isTrainer, resourceType]);

  const canDelete = useMemo(() => {
    if (!user) return false;
    if (isAdmin) return true;
    if (isOwner) return true;
    return false;
  }, [user, isAdmin, isOwner]);

  // Check if user has required role
  const hasRequiredRole = useMemo(() => {
    if (!requiredRole || !user) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
  }, [requiredRole, user]);

  const hasAccess = useMemo(() => {
    if (!user) return false;
    if (requiredRole && !hasRequiredRole) return false;
    if (resourceId && !canView) return false;
    return true;
  }, [user, requiredRole, hasRequiredRole, resourceId, canView]);

  // Handle authentication and authorization
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        if (showError) {
          toast.error('Please log in to continue');
        }
        navigate(redirectTo);
        setLoading(false);
        return;
      }

      // Check if user has required role
      if (requiredRole && !hasRequiredRole) {
        if (showError) {
          toast.error('You do not have permission to access this page');
        }
        navigate(redirectTo);
        setLoading(false);
        return;
      }

      // Check resource-level permissions
      if (resourceId && !canView) {
        if (showError) {
          toast.error('You do not have permission to view this resource');
        }
        navigate(redirectTo);
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [
    isAuthenticated,
    user,
    requiredRole,
    hasRequiredRole,
    resourceId,
    canView,
    navigate,
    redirectTo,
    showError,
  ]);

  return {
    // Role checks
    isAdmin,
    isTrainer,
    isUser,
    
    // Permission checks
    canView,
    canEdit,
    canDelete,
    
    // Resource checks
    isOwner,
    hasAccess,
    
    // State
    loading,
    user,
  };
}

/**
 * usePermission Hook
 * 
 * Simpler permission check without redirect logic.
 * 
 * @example
 * ```tsx
 * function TrainingPlanCard({ plan }) {
 *   const { can } = usePermission();
 * 
 *   return (
 *     <div>
 *       <h3>{plan.title}</h3>
 *       {can('edit', 'trainingPlan', plan.userId) && (
 *         <button>Edit</button>
 *       )}
 *       {can('delete', 'trainingPlan', plan.userId) && (
 *         <button>Delete</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

type PermissionAction = 'view' | 'edit' | 'delete' | 'create' | 'share';
type ResourceType = 'trainingPlan' | 'nutritionPlan' | 'user' | 'aiRecommendation';

interface UsePermissionReturn {
  can: (action: PermissionAction, resourceType?: ResourceType, ownerId?: string) => boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  isUser: boolean;
}

export function usePermission(): UsePermissionReturn {
  const { user } = useAuthStore();

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isTrainer = useMemo(() => user?.role === 'trainer' || isAdmin, [user, isAdmin]);
  const isUser = useMemo(() => user?.role === 'user', [user]);

  const can = (
    action: PermissionAction,
    resourceType?: ResourceType,
    ownerId?: string
  ): boolean => {
    if (!user) return false;

    // Admins can do everything
    if (isAdmin) return true;

    // Check ownership
    const isOwner = ownerId ? user._id === ownerId : false;

    // Permission matrix
    switch (action) {
      case 'view':
        return true; // Everyone can view (implement resource-level checks separately)
      
      case 'create':
        if (resourceType === 'user') return isAdmin;
        return true; // Users can create their own resources
      
      case 'edit':
        if (isOwner) return true;
        if (isTrainer && resourceType && resourceType !== 'user') return true;
        return false;
      
      case 'delete':
        if (isOwner) return true;
        if (isAdmin) return true;
        return false;
      
      case 'share':
        if (isOwner) return true;
        if (isTrainer && resourceType && resourceType !== 'user') return true;
        return false;
      
      default:
        return false;
    }
  };

  return {
    can,
    isAdmin,
    isTrainer,
    isUser,
  };
}

/**
 * useFeatureFlag Hook
 * 
 * Check if a feature is enabled for the current user (useful for gradual rollouts).
 * 
 * @example
 * ```tsx
 * function NewFeature() {
 *   const { isEnabled } = useFeatureFlag('ai-recommendations-v2');
 * 
 *   if (!isEnabled) return null;
 * 
 *   return <div>New AI Recommendations Feature</div>;
 * }
 * ```
 */

interface UseFeatureFlagReturn {
  isEnabled: boolean;
  loading: boolean;
}

export function useFeatureFlag(featureName: string): UseFeatureFlagReturn {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // In a real app, you'd fetch feature flags from an API or config service
  // For now, we'll use a simple local check
  const isEnabled = useMemo(() => {
    if (!user) return false;

    // Example: Enable beta features for admins and trainers
    const betaFeatures = ['ai-recommendations-v2', 'advanced-analytics'];
    if (betaFeatures.includes(featureName)) {
      return user.role === 'admin' || user.role === 'trainer';
    }

    // All other features are enabled by default
    return true;
  }, [user, featureName]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    isEnabled,
    loading,
  };
}
