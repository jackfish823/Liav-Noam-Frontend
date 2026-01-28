import React, { useRef } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import './ImageUpload.css';

interface ImageUploadProps {
    onImageUploaded?: (imageId: string, imageUrl: string) => void;
    onImageRemoved?: () => void;
    currentImageUrl?: string;
    label?: string;
    shape?: 'circle' | 'square';
    disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onImageUploaded,
    onImageRemoved,
    currentImageUrl,
    label = 'Upload Image',
    shape = 'circle',
    disabled = false,
}) => {
    const { isUploading, uploadError, uploadImageFile, previewUrl, clearUploadedImage } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const displayUrl = previewUrl || currentImageUrl;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const result = await uploadImageFile(file);
            if (result && onImageUploaded) {
                onImageUploaded(result.id, result.url);
            }
        }
    };

    const handleRemoveImage = () => {
        clearUploadedImage();

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (onImageRemoved) {
            onImageRemoved();
        }
    };

    return (
        <div className="image-upload-container">
            <label className="image-upload-label">{label}</label>
            
            <div className="image-upload-content">
                {!displayUrl && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        disabled={isUploading || disabled}
                        className="image-upload-input"
                    />
                )}

                {/* Loading State */}
                {isUploading && (
                    <div className="image-upload-loading">
                        <div className="spinner"></div>
                        <span>Uploading...</span>
                    </div>
                )}

                {uploadError && (
                    <div className="image-upload-error">{uploadError}</div>
                )}

                {displayUrl && !isUploading && (
                    <div className="image-preview-container">
                        <img 
                            src={displayUrl} 
                            alt="Preview" 
                            className={`image-preview-img ${shape}`}
                        />
                        <button 
                            type="button" 
                            onClick={handleRemoveImage}
                            className="image-remove-btn"
                            disabled={disabled}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {!displayUrl && !isUploading && (
                <small className="image-upload-hint">
                    Supported: JPEG, PNG (max 5MB)
                </small>
            )}
        </div>
    );
};

export default ImageUpload;
