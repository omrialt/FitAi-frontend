/**
 * One way to write a date across the app.
 *
 * The screens had grown four: `12.9.2026`, `12/09/2026`, `06/12/2025` and
 * "יום רביעי, 11 בנובמבר", sometimes two of them on one card. These are the
 * two that remain:
 *
 * - `short`: "11 בנוב׳" / "11 Nov", with the year only when it is not this
 *   year ("6 בדצמ׳ 2025"). For list rows, chips and "since" captions.
 * - `long`: "יום רביעי, 11 בנובמבר" with the same year rule. For headings.
 *
 * Plain ISO days ("2026-11-11") are read as local noon, so a day never slips
 * to the previous one in a timezone west of UTC.
 */
export type DateStyle = 'short' | 'long';

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  return new Date(value.length === 10 ? `${value}T12:00:00` : value);
}

export function formatDate(
  value: string | Date,
  locale: string,
  style: DateStyle = 'short',
  now: Date = new Date(),
): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';

  const withYear = date.getFullYear() !== now.getFullYear();
  const options: Intl.DateTimeFormatOptions =
    style === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long' }
      : { day: 'numeric', month: 'short' };
  if (withYear) options.year = 'numeric';

  return new Intl.DateTimeFormat(locale, options).format(date);
}
