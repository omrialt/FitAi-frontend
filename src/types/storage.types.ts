/**
 * Storage (localStorage/sessionStorage) types
 */

import type { Dispatch, SetStateAction } from 'react';

export type SetValue<T> = Dispatch<SetStateAction<T>>;

export interface StorageOptions {
  serializer?: (value: unknown) => string;
  deserializer?: (value: string) => unknown;
}
