/**
 * A plan title made safe to use as an Excel sheet name.
 *
 * Excel refuses `: \ / ? * [ ]`, more than 31 characters, an empty name and
 * the same name twice in one workbook. The export used the title as-is, so a
 * plan called "Push / Pull / Legs", or two plans with the same name, failed
 * the whole export with an error the user never saw explained.
 */
export function sheetName(title: string, taken: ReadonlySet<string>): string {
  const base =
    title
      .replace(/[:\\/?*[\]]/g, '-')
      .replace(/^'+|'+$/g, '')
      .trim()
      .slice(0, 31) || 'Plan';

  // Excel compares sheet names case-insensitively.
  const lowerTaken = new Set([...taken].map((name) => name.toLowerCase()));
  if (!lowerTaken.has(base.toLowerCase())) return base;

  for (let n = 2; ; n++) {
    const suffix = ` (${n})`;
    const candidate = base.slice(0, 31 - suffix.length) + suffix;
    if (!lowerTaken.has(candidate.toLowerCase())) return candidate;
  }
}
