import { useState } from 'react';
import { uploadImage, validateImageFile, deleteImage } from '../services/image.service';
import type { UploadImageResponse } from '../types';

interface UseImageUploadResult {
    uploadedImage: UploadImageResponse | null;
    isUploading: boolean;
    uploadError: string | null;
    uploadImageFile: (file: File) => Promise<UploadImageResponse | null>;
    clearUploadedImage: () => void;
    deleteUploadedImage: () => Promise<void>;
    previewUrl: string | null;
}

/**
 * Custom hook for handling image uploads with validation and error handling
 * @returns Upload state and methods
 */
export const useImageUpload = (): UseImageUploadResult => {
    const [uploadedImage, setUploadedImage] = useState<UploadImageResponse | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    /**
     * Upload an image file
     * @param file - The file to upload
     * @returns The uploaded image data or null if failed
     */
    const uploadImageFile = async (file: File): Promise<UploadImageResponse | null> => {
        setIsUploading(true);
        setUploadError(null);

        try {
            const validation = validateImageFile(file);

            if (!validation.valid) {
                setUploadError(validation.error || 'Invalid file');
                setIsUploading(false);

                return null;
            }

            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);

            const imageData = await uploadImage(file);
            setUploadedImage(imageData);
            
            URL.revokeObjectURL(preview);
            setPreviewUrl(imageData.url);

            return imageData;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to upload image';
            setUploadError(errorMessage);
            
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Clear the uploaded image state
     */
    const clearUploadedImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setUploadedImage(null);
        setPreviewUrl(null);
        setUploadError(null);
    };

    const deleteUploadedImage = async () => {
        if (!uploadedImage) return;

        try {
            await deleteImage(uploadedImage.id);

            clearUploadedImage();
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete image';
            
            setUploadError(errorMessage);

            throw error;
        }
    }

    return {
        uploadedImage,
        isUploading,
        uploadError,
        uploadImageFile,
        clearUploadedImage,
        deleteUploadedImage,
        previewUrl,
    };
};
