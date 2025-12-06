/**
 * Helper function to calculate improvement percentage between measurements
 */

export function calcImprovement(current: number | undefined, previous: number | undefined): string {
  // Return em dash if this is the first record or values are missing
  if (!previous || !current) {
    return '—';
  }

  // Protect against division by zero
  if (previous === 0) {
    return '—';
  }

  // Calculate percentage change: (previous - current) / previous * 100
  const improvement = ((previous - current) / previous) * 100;

  // Format with sign and 2 decimal places
  const formatted = improvement.toFixed(2);
  
  if (improvement > 0) {
    return `+${formatted}%`;
  } else if (improvement < 0) {
    return `${formatted}%`;
  }
  
  return '0.00%';
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date for chart display (short)
 */
export function formatChartDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
