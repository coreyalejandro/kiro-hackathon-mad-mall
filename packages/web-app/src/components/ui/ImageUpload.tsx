'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string, key: string) => void;
  onUploadError?: (error: string) => void;
  category: 'profile' | 'story' | 'product' | 'general';
  userId: string;
  maxFiles?: number;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
}

interface UploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  imageUrl?: string;
  key?: string;
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  category,
  userId,
  maxFiles = 1,
  className,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSize = 10
}: ImageUploadProps) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, WebP, and GIF images are allowed';
    }
    
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
  };

  const uploadFile = async (file: File): Promise<void> => {
    const uploadId = Date.now().toString();
    
    setUploads(prev => [...prev, {
      file,
      progress: 0,
      status: 'pending'
    }]);

    try {
      // Step 1: Get upload URL
      setUploads(prev => prev.map(upload => 
        upload.file === file ? { ...upload, status: 'uploading', progress: 10 } : upload
      ));

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category,
          userId
        })
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key } = await uploadResponse.json();

      // Step 2: Upload to S3
      setUploads(prev => prev.map(upload => 
        upload.file === file ? { ...upload, progress: 30 } : upload
      ));

      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!s3Response.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Confirm upload
      setUploads(prev => prev.map(upload => 
        upload.file === file ? { ...upload, progress: 60, status: 'processing' } : upload
      ));

      const confirmResponse = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, userId })
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm upload');
      }

      const { imageUrl } = await confirmResponse.json();

      // Step 4: Complete
      setUploads(prev => prev.map(upload => 
        upload.file === file ? { 
          ...upload, 
          progress: 100, 
          status: 'complete',
          imageUrl,
          key
        } : upload
      ));

      onUploadComplete(imageUrl, key);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploads(prev => prev.map(upload => 
        upload.file === file ? { 
          ...upload, 
          status: 'error',
          error: errorMessage
        } : upload
      ));

      onUploadError?.(errorMessage);
    }
  };

  const handleFileSelect = useCallback((files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles);
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        onUploadError?.(error);
        continue;
      }
      
      uploadFile(file);
    }
  }, [maxFiles, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300',
          'hover:border-primary hover:bg-primary/5'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            Drop images here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports JPEG, PNG, WebP, GIF up to {maxSize}MB
          </p>
          <input
            type="file"
            accept={accept}
            multiple={maxFiles > 1}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose Files
            </label>
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((upload, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {upload.status === 'complete' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium truncate max-w-xs">
                    {upload.file.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUpload(upload.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {upload.status !== 'error' && (
                <div className="space-y-2">
                  <Progress value={upload.progress} className="h-2" />
                  <p className="text-sm text-gray-500">
                    {upload.status === 'pending' && 'Preparing upload...'}
                    {upload.status === 'uploading' && 'Uploading...'}
                    {upload.status === 'processing' && 'Processing...'}
                    {upload.status === 'complete' && 'Upload complete!'}
                  </p>
                </div>
              )}

              {upload.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{upload.error}</AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}