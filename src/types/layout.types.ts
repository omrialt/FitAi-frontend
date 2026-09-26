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
  /**
   * Shown as its own tab in the mobile bottom nav. The design gives that bar
   * four destinations plus More, so everything without this flag is reachable
   * through the More sheet rather than being dropped off the end of the bar —
   * which is what used to happen to Schedule.
   */
  primary?: boolean;
  /**
   * Bottom-bar label. A tab is ~75px wide, so "המתאמנים שלי" / "Nutrition
   * Plans" were truncated to "המתאמנים ..."; the sidebar and More sheet keep
   * the full `label`.
   */
  shortLabel?: string;
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
