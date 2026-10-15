import { useState } from 'react';
import { useIsMobile } from './useIsMobile';

/**
 * Caps a list at `limit` rows on phones until the user asks for the rest.
 *
 * The phone dashboard stacks every card in one column, and two of them list
 * every exercise in the plan — eight rows each pushed the cards below them a
 * full screen further down. Desktop has the width to show everything, so the
 * cap applies below the `md` breakpoint only.
 */
export function useMobileLimit<T>(items: T[], limit = 3) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  const capped = isMobile && !expanded && items.length > limit;
  return {
    visible: capped ? items.slice(0, limit) : items,
    /** Rows held back, or 0 when the list is shown in full. */
    hidden: capped ? items.length - limit : 0,
    expand: () => setExpanded(true),
  };
}
