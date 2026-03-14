import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { IPost, IImage } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePostLike } from '../../hooks/usePostLike';
import { deletePost } from '../../services/post.service';
import defaultProfilePicture from '../../assets/default-pfp.svg';
import './posts.css';

interface PostCardProps {
  post: IPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { _id: postId, author, commentsCount, likeCount = 0, isLiked = false, createdAt, updatedAt, message, image } = post;
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toggle, isPending } = usePostLike(postId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?._id === author._id;

  const handleDeleteClick = () => {
    setMenuOpen(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      await deletePost(postId);
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] });
      queryClient.removeQueries({ queryKey: ['post', postId] });
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete post', err);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  const isEdited = Boolean(
    createdAt && updatedAt && new Date(updatedAt).getTime() !== new Date(createdAt).getTime()
  );

  const getAuthorImage = () => {
    if (author.profileImage) {
      return (author.profileImage as IImage).url;
    }
    return author.imgUrl || defaultProfilePicture;
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        <img
          src={getAuthorImage()}
          alt={author.username}
          className="post-card-avatar"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = defaultProfilePicture;
          }}
        />
        <div className="post-card-author-info">
          <span className="post-card-username">{author.username}</span>
          <span className="post-card-date">
            {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
            {isEdited && <span className="post-edited-mark"> · edited</span>}
          </span>
        </div>
        {isOwner && (
          <div className="post-card-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="post-card-menu-btn"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen((v) => !v);
              }}
              title="More options"
              aria-label="More options"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <div className="post-card-menu-dropdown">
                <button
                  type="button"
                  className="post-card-menu-item"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    navigate(`/posts/${postId}/edit`);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="post-card-menu-item post-card-menu-item-danger"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteClick();
                  }}
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Post?</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-danger" 
                onClick={() => void confirmDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {image?.url ? (
        <div className="post-card-image">
          <img src={image.url} alt="Post" />
        </div>
      ) : (
        <div className="post-card-image-placeholder">
          <span>No image yet</span>
        </div>
      )}

      <div className="post-card-body">
        <p className="post-card-message">{message}</p>
      </div>

      <div className="post-card-actions">
        <button
          type="button"
          className={`post-card-like-btn${isLiked ? ' liked' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (isPending) return;
            toggle(isLiked);
          }}
          disabled={isPending}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{likeCount > 0 ? likeCount : 'Like'}</span>
        </button>

        <Link to={`/posts/${postId}`} className="post-card-comments-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{commentsCount ?? 0} {commentsCount === 1 ? 'comment' : 'comments'}</span>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
