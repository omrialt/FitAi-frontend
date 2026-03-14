/**
 * Layout component prop types: AppLayout, ProtectedRoute, PublicRoute
 */

import type { ReactNode } from 'react';

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
}

export interface PublicRouteProps {
  children: ReactNode;
}
