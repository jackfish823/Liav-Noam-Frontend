import React, { useState, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { useImageUpload } from '../../hooks/useImageUpload';
import './posts.css';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createPost, isCreatingPost } = usePosts();
  const { previewUrl, uploadedImage, isUploading, uploadError, uploadImageFile, clearUploadedImage } = useImageUpload();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError(null);

    await uploadImageFile(file);
  };

  const handleRemoveImage = () => {
    clearUploadedImage();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setError(null);
    createPost(
      { message: message.trim(), author: user!._id, image: uploadedImage?.id ?? undefined },
      {
        onSuccess: (newPost) => {
          clearUploadedImage();
          navigate(`/posts/${newPost._id}`, { replace: true });
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || 'Failed to create post');
        },
      }
    );
  };

  const isSubmitting = isCreatingPost || isUploading;

  return (
    <div className="posts-container">
      <div className="create-post-form-container">
        <h2 className="create-post-title">Create Post</h2>

        <form onSubmit={handleSubmit} className="create-post-form">
          {(error || uploadError) && <div className="form-error">{error || uploadError}</div>}

          {/* Image area */}
          <div className="create-post-image-area" onClick={() => !previewUrl && fileInputRef.current?.click()}>
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="create-post-image-preview" />
                {isUploading && (
                  <div className="create-post-image-uploading">
                    <div className="spinner-small"></div>
                    <span>Uploading...</span>
                  </div>
                )}
                {!isUploading && (
                  <button
                    type="button"
                    className="create-post-remove-image"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                  >
                    ✕
                  </button>
                )}
              </>
            ) : (
              <div className="create-post-image-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Add photo</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          {/* Caption */}
          <div className="form-group">
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              disabled={isSubmitting}
              maxLength={500}
            />
            <small className="char-count">{message.length}/500</small>
          </div>

          <div className="create-post-actions">
            <button
              type="button"
              className="create-post-cancel-btn"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-post-btn"
              disabled={isSubmitting || !message.trim()}
            >
              {isCreatingPost ? 'Posting...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
