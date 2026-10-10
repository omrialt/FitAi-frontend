import type { PhysicalTarget } from '../../../../types/physical-target.types';

/**
 * Active targets first, soonest deadline first; then closed ones, most
 * recently closed first. A finished goal stays on the page — it is a record of
 * something done — but it should not sit above the one still being chased.
 */
export function orderTargets(targets: PhysicalTarget[]): PhysicalTarget[] {
  const time = (value?: string) => (value ? new Date(value).getTime() : 0);
  return [...targets].sort((a, b) => {
    const aActive = a.status === 'active';
    const bActive = b.status === 'active';
    if (aActive !== bActive) return aActive ? -1 : 1;
    if (aActive) return time(a.targetDate) - time(b.targetDate);
    return time(b.closedAt ?? b.updatedAt) - time(a.closedAt ?? a.updatedAt);
  });
}
