import type {
  TrainerAlertSeverity,
  TrainerDashboardRow,
} from '../../types/trainer-dashboard.types';

/**
 * Splits the roster into the part that needs the trainer and the part that
 * does not.
 *
 * The split is the whole design of the screen. Ten cards that all look fine
 * are ten cards nobody reads, and the eleventh — the one that matters — reads
 * exactly like the rest. Quiet clients stay reachable, collapsed, with a count.
 *
 * The server already sorted worst-first; this preserves that order rather than
 * re-sorting, so the two never disagree about which client is worst.
 */
export function splitByAttention(rows: TrainerDashboardRow[]): {
  needsAttention: TrainerDashboardRow[];
  quiet: TrainerDashboardRow[];
} {
  return {
    needsAttention: rows.filter((row) => row.alerts.length > 0),
    quiet: rows.filter((row) => row.alerts.length === 0),
  };
}

/** Mantine colour per severity. `warn` is amber, not red: a client is not an error. */
export function alertColor(severity: TrainerAlertSeverity): string {
  return severity === 'warn' ? 'orange' : 'gray';
}

/**
 * Whole days since a date, or `null` when there is no date.
 *
 * `null` in, `null` out — deliberately not `0`, which on this screen would be
 * read as "trained today" by a trainer scanning a column of numbers.
 */
export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000));
}
