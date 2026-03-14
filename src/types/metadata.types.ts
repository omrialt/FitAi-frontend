/**
 * Metadata options for page-level meta tag management
 */

export interface MetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  preconnect?: string[];
  prefetchDNS?: string[];
  preload?: Array<{
    href: string;
    as: string;
    type?: string;
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
  }>;
}
