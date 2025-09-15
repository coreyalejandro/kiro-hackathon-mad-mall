export interface UploadOptions {
  fileName: string;
  fileType: string;
  fileSize: number;
  category: 'profile' | 'story' | 'product' | 'general';
  userId: string;
}

export interface BulkUploadOptions {
  files: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
  category: 'profile' | 'story' | 'product' | 'general';
  userId: string;
}

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  key?: string;
  error?: string;
}

export interface BulkUploadResult {
  success: boolean;
  uploads?: Array<{
    fileName: string;
    key: string;
    uploadUrl: string;
  }>;
  error?: string;
}

export class UploadService {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async getUploadUrl(options: UploadOptions): Promise<{ uploadUrl: string; key: string }> {
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get upload URL');
    }

    return response.json();
  }

  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }
  }

  async confirmUpload(key: string, userId: string): Promise<{ imageUrl: string }> {
    const response = await fetch(`${this.baseUrl}/upload/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm upload');
    }

    return response.json();
  }

  async uploadSingle(file: File, options: Omit<UploadOptions, 'fileName' | 'fileType' | 'fileSize'>): Promise<UploadResult> {
    try {
      // Step 1: Get upload URL
      const { uploadUrl, key } = await this.getUploadUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        ...options,
      });

      // Step 2: Upload to S3
      await this.uploadToS3(uploadUrl, file);

      // Step 3: Confirm upload
      const { imageUrl } = await this.confirmUpload(key, options.userId);

      return {
        success: true,
        imageUrl,
        key,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async uploadBulk(files: File[], options: Omit<BulkUploadOptions, 'files'>): Promise<UploadResult[]> {
    const bulkOptions: BulkUploadOptions = {
      files: files.map(file => ({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })),
      ...options,
    };

    try {
      // Get bulk upload URLs
      const response = await fetch(`${this.baseUrl}/upload/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkOptions),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get bulk upload URLs');
      }

      const { uploads } = await response.json();

      // Upload all files in parallel
      const uploadPromises = uploads.map(async (upload: any, index: number) => {
        try {
          await this.uploadToS3(upload.uploadUrl, files[index]);
          const { imageUrl } = await this.confirmUpload(upload.key, options.userId);
          
          return {
            success: true,
            imageUrl,
            key: upload.key,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
          };
        }
      });

      return Promise.all(uploadPromises);
    } catch (error) {
      // Return error for all files
      return files.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Bulk upload failed',
      }));
    }
  }

  validateFile(file: File, maxSize = 10): string | null {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, WebP, and GIF images are allowed';
    }
    
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
  }

  async validateImage(file: File, category: string): Promise<{
    cultural: number;
    sensitivity: number;
    issues?: string[];
  }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    const response = await fetch(`${this.baseUrl}/validate-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image validation failed');
    }

    return response.json();
  }
}

// Export singleton instance
export const uploadService = new UploadService();