import api from './api';
import type { UploadResponse, MultipleUploadResponse } from '../types/upload.types';

class CloudinaryService {
  /**
   * Upload a single image to Cloudinary
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrl;
  }

  /**
   * Upload multiple images to Cloudinary
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<MultipleUploadResponse>(
      '/upload/multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.imageUrls;
  }
}

export default new CloudinaryService();
