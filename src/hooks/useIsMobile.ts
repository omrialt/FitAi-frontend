import { useMediaQuery } from '@mantine/hooks';

/**
 * The "compact" layout boundary: Mantine's `md` (62em / 992px). Below it the
 * shell uses the bottom nav and list screens render cards — the 860–900px
 * tables do not fit a portrait tablet either. Multi-column content grids use
 * Tailwind's `md` (48em) independently.
 */
export const MOBILE_QUERY = '(max-width: 61.99em)';

const matchesNow = (query: string) =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false;

/**
 * True below the `md` breakpoint, correct on the very first render.
 *
 * Mantine's useMediaQuery defaults to `false` and only reads the real value in
 * an effect, so every phone painted the 860–900px desktop table for one frame
 * before swapping to cards — a visible flash plus a layout shift on the screens
 * people open most. Seeding it synchronously removes both.
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY, matchesNow(MOBILE_QUERY), {
    getInitialValueInEffect: false,
  });
}
