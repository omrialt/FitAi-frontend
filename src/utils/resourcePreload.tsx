/**
 * React 19 Resource Preloading Utilities
 * Helper functions for preload, prefetch, and preconnect
 */

import ReactDOM from 'react-dom';

/**
 * React 19: Preload critical resources
 * Call this early in app initialization
 */
export function preloadCriticalResources() {
  // React 19: Preload important fonts
  ReactDOM.preload('/fonts/Inter-Regular.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });

  ReactDOM.preload('/fonts/Inter-Bold.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });

  // React 19: Preload critical images
  ReactDOM.preload('/images/logo.svg', { as: 'image' });

  // React 19: Preconnect to API endpoints
  ReactDOM.preconnect('https://api.fitai.com', { crossOrigin: 'anonymous' });
  ReactDOM.preconnect('https://cdn.fitai.com');
}

/**
 * React 19: Prefetch resources for next navigation
 */
export function prefetchTrainingPlanResources() {
  // React 19: Prefetch data for next page
  ReactDOM.prefetchDNS('https://api.fitai.com');
  
  // React 19: Prefetch scripts for code splitting
  ReactDOM.preload('/assets/training-plans.js', {
    as: 'script',
    fetchPriority: 'low',
  });
}

