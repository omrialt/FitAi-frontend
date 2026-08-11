import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest does not unmount between tests on its own; without this a component
// from one test is still in the document during the next, and queries start
// matching the wrong element.
afterEach(() => {
  cleanup();
});
