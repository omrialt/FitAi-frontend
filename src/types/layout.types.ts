/**
 * Layout component prop types: AppLayout, ProtectedRoute, PublicRoute
 */

import type { ReactNode } from 'react';
import type { UserRole } from './auth.types';

export interface NavItem {
  icon: ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

export interface AppLayoutProps {
  children: ReactNode;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  /** When set, only these roles may access the route; others go to "/" */
  roles?: UserRole[];
}

export interface PublicRouteProps {
  children: ReactNode;
}
