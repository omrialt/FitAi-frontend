import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { ProtectedRouteProps, PublicRouteProps } from '../types/layout.types';

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
