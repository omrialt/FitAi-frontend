/**
 * useUpload Hook
 * 
 * File/image upload using react-dropzone with progress, success/error, previews,
 * and integration with Cloudinary or API endpoint.
 * 
 * @example
 * ```tsx
 * function avatarUrlUpload() {
 *   const {
 *     uploadFiles,
 *     uploadedFiles,
 *     progress,
 *     status,
 *     error,
 *     previews,
 *     getRootProps,
 *     getInputProps,
 *     isDragActive,
 *     reset,
 *   } = useUpload({
 *     endpoint: '/upload',
 *     maxFiles: 1,
 *     maxSize: 5 * 1024 * 1024, // 5MB
 *     accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
 *     onSuccess: (files) => {
 *       updateProfile({ avatarUrl: files[0].url });
 *     },
 *   });
 * 
 *   return (
 *     <div>
 *       <div {...getRootProps()} className={isDragActive ? 'drag-active' : ''}>
 *         <input {...getInputProps()} />
 *         {isDragActive ? (
 *           <p>Drop the image here...</p>
 *         ) : (
 *           <p>Drag & drop an image, or click to select</p>
 *         )}
 *       </div>
 * 
 *       {status === 'uploading' && (
 *         <div className="upload-progress">
 *           <progress value={progress.percentage} max={100} />
 *           <span>{progress.percentage}%</span>
 *         </div>
 *       )}
 * 
 *       {previews.length > 0 && (
 *         <div className="preview-container">
 *           {previews.map((preview, idx) => (
 *             <img key={idx} src={preview} alt="Preview" />
 *           ))}
 *         </div>
 *       )}
 * 
 *       {uploadedFiles.length > 0 && (
 *         <div>Upload successful! {uploadedFiles[0].url}</div>
 *       )}
 * 
 *       {error && <div className="error">{error.message}</div>}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import { toast } from 'sonner';
import api from '../services/api';
import type {
  UploadedFile,
  UploadProgress,
  UploadError,
  UploadStatus,
  UseUploadOptions,
  UseUploadReturn,
} from '../types/upload.types';

export function useUpload(options: UseUploadOptions): UseUploadReturn {
  const {
    endpoint,
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB default
    accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    multiple = false,
    onSuccess,
    onError,
    showToast = true,
  } = options;

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<UploadError | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Upload files to API
  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setStatus('uploading');
      setError(null);
      setProgress({ loaded: 0, total: 0, percentage: 0 });

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      try {
        const response = await api.post<{ files: UploadedFile[] }>(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || 0;
            const loaded = progressEvent.loaded || 0;
            const percentage = total > 0 ? Math.round((loaded * 100) / total) : 0;

            setProgress({ loaded, total, percentage });
          },
        });

        setUploadedFiles(response.data.files);
        setStatus('success');

        if (showToast) {
          toast.success(`${files.length} file(s) uploaded successfully!`);
        }

        if (onSuccess) {
          onSuccess(response.data.files);
        }
      } catch (err: unknown) {
        const uploadError: UploadError = {
          message: err instanceof Error ? err.message : 'Upload failed',
          code: 'UPLOAD_ERROR',
        };

        setError(uploadError);
        setStatus('error');

        if (showToast) {
          toast.error(uploadError.message);
        }

        if (onError) {
          onError(uploadError);
        }
      }
    },
    [endpoint, onSuccess, onError, showToast]
  );

  // Handle file drop or selection
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const firstRejection = rejectedFiles[0];
        const errorCode = firstRejection.errors[0]?.code;
        
        let errorMessage = 'File rejected';
        if (errorCode === 'file-too-large') {
          errorMessage = `File is too large. Max size is ${maxSize / 1024 / 1024}MB`;
        } else if (errorCode === 'file-invalid-type') {
          errorMessage = 'Invalid file type';
        } else if (errorCode === 'too-many-files') {
          errorMessage = `Too many files. Max is ${maxFiles}`;
        }

        const uploadError: UploadError = {
          message: errorMessage,
          code: errorCode,
          file: firstRejection.file,
        };

        setError(uploadError);

        if (showToast) {
          toast.error(errorMessage);
        }

        return;
      }

      // Create previews for images
      const newPreviews: string[] = [];
      acceptedFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === acceptedFiles.length) {
              setPreviews(newPreviews);
            }
          };
          reader.readAsDataURL(file);
        }
      });

      // Upload files
      uploadFiles(acceptedFiles);
    },
    [uploadFiles, maxFiles, maxSize, showToast]
  );

  // Setup react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    multiple,
  });

  // Reset state
  const reset = useCallback(() => {
    setUploadedFiles([]);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setStatus('idle');
    setError(null);
    setPreviews([]);
  }, []);

  return {
    uploadFiles,
    uploadedFiles,
    progress,
    status,
    error,
    previews,
    getRootProps,
    getInputProps,
    isDragActive,
    reset,
  };
}

/**
 * useMultipleUpload Hook
 * 
 * Handle multiple independent upload zones with separate state for each.
 * 
 * @example
 * ```tsx
 * function MealPhotosUpload() {
 *   const uploads = useMultipleUpload({
 *     breakfast: { endpoint: '/upload/meals', maxFiles: 3 },
 *     lunch: { endpoint: '/upload/meals', maxFiles: 3 },
 *     dinner: { endpoint: '/upload/meals', maxFiles: 3 },
 *   });
 * 
 *   return (
 *     <div>
 *       {['breakfast', 'lunch', 'dinner'].map((meal) => (
 *         <div key={meal}>
 *           <h3>{meal}</h3>
 *           <div {...uploads[meal].getRootProps()}>
 *             <input {...uploads[meal].getInputProps()} />
 *             Drop {meal} photos here
 *           </div>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

type MultipleUploadConfig = Record<string, UseUploadOptions>;
type MultipleUploadReturn<T extends MultipleUploadConfig> = {
  [K in keyof T]: UseUploadReturn;
};

export function useMultipleUpload<T extends MultipleUploadConfig>(
  config: T
): MultipleUploadReturn<T> {
  const uploads = {} as MultipleUploadReturn<T>;

  for (const key in config) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    uploads[key] = useUpload(config[key]) as UseUploadReturn;
  }

  return uploads;
}
