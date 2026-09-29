/** The history page's filter values, shared by the filter bar and the page. */

export const RANGE_OPTIONS = [30, 90, 180, 365, 0] as const;

export interface HistoryFilterValues {
  search: string;
  /** A `dayName`, or '' for every type. */
  type: string;
  muscle: string;
  /** Days back from today; 0 is all time. */
  days: number;
}
