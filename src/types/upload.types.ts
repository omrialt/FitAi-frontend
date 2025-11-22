/**
 * File upload types
 */

import type { Accept } from 'react-dropzone';
import type { useDropzone } from 'react-dropzone';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedFile {
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

export interface UploadError {
  message: string;
  code?: string;
  file?: File;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UseUploadOptions {
  endpoint: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Accept;
  multiple?: boolean;
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (error: UploadError) => void;
  showToast?: boolean;
}

export interface UseUploadReturn {
  uploadFiles: (files: File[]) => Promise<void>;
  uploadedFiles: UploadedFile[];
  progress: UploadProgress;
  status: UploadStatus;
  error: UploadError | null;
  previews: string[];
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
  isDragActive: boolean;
  reset: () => void;
}

