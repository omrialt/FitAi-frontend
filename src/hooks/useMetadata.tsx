/**
 * React 19 useMetadata Hook
 * Simplified metadata management for pages
 */

import { useMemo } from 'react';
import type { MetadataOptions } from '../types/metadata.types';

// Preset metadata for common pages
const PRESET_METADATA: Record<string, MetadataOptions> = {
  dashboard: {
    title: 'Dashboard - FitAI',
    description: 'View your fitness progress and AI recommendations',
  },
  trainingPlans: {
    title: 'Training Plans - FitAI',
    description: 'Browse and manage your training plans',
  },
  nutrition: {
    title: 'Nutrition Plans - FitAI',
    description: 'Track your nutrition and meal plans',
  },
  profile: {
    title: 'Profile - FitAI',
    description: 'Manage your profile and settings',
  },
  'verify-email': {
    title: 'Verify your email - FitAI',
    description: 'Confirm your email address to finish setting up FitAi',
  },
};

/**
 * React 19: Custom hook for metadata management
 * Returns JSX elements for title, meta tags, and resource hints
 */
export function useMetadata(options: MetadataOptions) {
  return useMemo(() => {
    return (
      <>
        {options.title && <title>{options.title}</title>}
        {options.description && (
          <meta name="description" content={options.description} />
        )}
        {options.keywords && (
          <meta name="keywords" content={options.keywords.join(', ')} />
        )}
        {options.preconnect?.map((url) => (
          <link key={url} rel="preconnect" href={url} />
        ))}
        {options.prefetchDNS?.map((url) => (
          <link key={url} rel="dns-prefetch" href={url} />
        ))}
        {options.preload?.map((resource) => (
          <link
            key={resource.href}
            rel="preload"
            href={resource.href}
            as={resource.as}
            type={resource.type}
            crossOrigin={resource.crossOrigin}
          />
        ))}
      </>
    );
  }, [options]);
}

/**
 * Use preset metadata with optional overrides
 */
export function usePresetMetadata(
  preset: keyof typeof PRESET_METADATA,
  overrides?: Partial<MetadataOptions>
) {
  const presetData = PRESET_METADATA[preset];
  return useMetadata({ ...presetData, ...overrides });
}
