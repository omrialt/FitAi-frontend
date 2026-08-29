import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest does not unmount between tests on its own; without this a component
// from one test is still in the document during the next, and queries start
// matching the wrong element.
afterEach(() => {
  cleanup();
});

/**
 * jsdom implements neither of these, and Mantine reaches for both on mount —
 * `matchMedia` for the colour scheme, `ResizeObserver` for anything that has
 * to measure itself (Autocomplete's dropdown, Recharts' container). Without
 * them every component test throws before it can assert anything, which is a
 * large part of why there were no component tests.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mantine's Popover/Autocomplete positions its dropdown with this.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
