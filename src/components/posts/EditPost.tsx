import React, { useState, useRef, useEffect , type FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostById } from '../../hooks/usePostById';
import { useImageUpload } from '../../hooks/useImageUpload';
import './posts.css';

const EditPost: FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const { post, isLoading, isError, updatePost, isUpdating, updateError } = usePostById(postId!);
  const { previewUrl, uploadedImage, isUploading, uploadError, uploadImageFile, clearUploadedImage } = useImageUpload();

  const [message, setMessage] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      setMessage(post.message);
      setCurrentImageUrl(post.image?.url ?? null);
    }
  }, [post]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageRemoved(false);
    await uploadImageFile(file);
  };

  const handleRemoveImage = () => {
    if (uploadedImage) {
      clearUploadedImage();
    } else {
      setCurrentImageUrl(null);
      setImageRemoved(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    let imageField: string | null | undefined;
    if (uploadedImage) {
      imageField = uploadedImage.id;
    } else if (imageRemoved) {
      imageField = null;
    } else if (post?.image) {
      imageField = post.image.id;
    }

    updatePost(
      { message: message.trim(), image: imageField },
      { onSuccess: () => navigate(`/posts/${postId}`, {replace: true}) }
    );
  };

  const displayImageUrl = previewUrl || currentImageUrl;
  const isSubmitting = isUpdating || isUploading;
  const error = updateError?.message || uploadError;

  if (isLoading) {
    return <div className="posts-container"><div className="loading-spinner">Loading...</div></div>;
  }

  if (isError || !post) {
    return <div className="posts-container"><div className="error-message">Post not found</div></div>;
  }

  return (
    <div className="posts-container">
      <div className="create-post-form-container">
        <h2 className="create-post-title">Edit Post</h2>

        <form onSubmit={handleSubmit} className="create-post-form">
          {error && <div className="form-error">{error}</div>}

          <div
            className="create-post-image-area"
            onClick={() => !displayImageUrl && fileInputRef.current?.click()}
          >
            {displayImageUrl ? (
              <>
                <img src={displayImageUrl} alt="Preview" className="create-post-image-preview" />
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

          <div className="form-group">
            <textarea
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
              onClick={() => {
                if (postId) {
                  navigate(`/posts/${postId}`, { replace: true });
                } else {
                  navigate(-1);
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-post-btn"
              disabled={isSubmitting || !message.trim()}
            >
              {isUploading ? 'Uploading...' : isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
