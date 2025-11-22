/**
 * React 19 Resource Preload Hook
 * Custom hook for preloading resources
 */

import { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * React 19: Hook to preload resources on component mount
 */
export function useResourcePreload() {
  useEffect(() => {
    // Preload API endpoints
    ReactDOM.preconnect('https://api.fitai.com', { crossOrigin: 'use-credentials' });
    
    // Preload workout images
    ReactDOM.preload('/images/workout-placeholder.jpg', {
      as: 'image',
      fetchPriority: 'high',
    });

    // Prefetch route scripts
    ReactDOM.preload('/assets/dashboard.js', { as: 'script' });
  }, []);
}
