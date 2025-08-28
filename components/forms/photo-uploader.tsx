'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, X, Upload, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onChange, maxPhotos = 6 }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const uploadIndex = Date.now() + i;
      
      setUploading(prev => [...prev, uploadIndex]);
      
      try {
        // In a real app, this would upload to Cloudinary
        // For now, we'll create a local URL
        const url = URL.createObjectURL(file);
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onChange([...photos, url]);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(prev => prev.filter(id => id !== uploadIndex));
      }
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  const canAddMore = photos.length + uploading.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      {(photos.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={photo}
                alt={`Flight photo ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
          
          {/* Loading placeholders */}
          {uploading.map((id) => (
            <div key={id} className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canAddMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-teal-500 transition-colors group"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-gray-800 rounded-full group-hover:bg-teal-600 transition-colors">
                <Camera className="h-6 w-6 text-gray-400 group-hover:text-white" />
              </div>
              <div className="text-center">
                <p className="text-gray-300 group-hover:text-white transition-colors">
                  Add photos
                </p>
                <p className="text-sm text-gray-500">
                  {maxPhotos - photos.length - uploading.length} remaining
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>• Upload up to {maxPhotos} photos</p>
        <p>• Supported formats: JPG, PNG, WebP</p>
        <p>• Max file size: 10MB per photo</p>
      </div>
    </div>
  );
}
