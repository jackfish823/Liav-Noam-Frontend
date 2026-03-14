import React, { type FC, useState } from 'react';
import type { IComment, IImage, CommentVoteDirection } from '../../types';
import { useCommentVote } from '../../hooks/useCommentVote';
import defaultProfilePicture from '../../assets/default-pfp.svg';
import './posts.css';

interface CommentProps {
  comment: IComment;
  postId: string;
  currentUserId?: string;
  onUpdate?: (commentId: string, body: string) => void;
  onDelete?: (commentId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const Comment: FC<CommentProps> = ({ comment, postId, currentUserId, onUpdate, onDelete, isUpdating, isDeleting }) => {
  const { author, createdAt, updatedAt, body, upCount = 0, downCount = 0, userVote: currentVote } = comment;
  const score = upCount - downCount;
  const { vote, isPending } = useCommentVote(comment._id, postId);

  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(body);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = currentUserId && author._id === currentUserId;

  const isEdited = Boolean(
    createdAt && updatedAt && new Date(updatedAt).getTime() !== new Date(createdAt).getTime()
  );

  const getAuthorImage = () => {
    if (author.profileImage) {
      return (author.profileImage as IImage).url;
    }
    return author.imgUrl || defaultProfilePicture;
  };

  const handleSave = () => {
    if (!editBody.trim() || editBody.trim() === body) {
      setIsEditing(false);
      setEditBody(body);

      return;
    }
    onUpdate?.(comment._id, editBody.trim());

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditBody(body);
    setIsEditing(false);
  };

  const handleUp = () => {
    if (isPending) return;

    vote((currentVote === 1 ? 0 : 1) as CommentVoteDirection);
  };

  const handleDown = () => {
    if (isPending) return;

    vote((currentVote === -1 ? 0 : -1) as CommentVoteDirection);
  };

  return (
    <div className="comment">
      <div className="comment-vote">
        <button
          type="button"
          className={`comment-vote-btn comment-vote-up${currentVote === 1 ? ' active' : ''}`}
          onClick={handleUp}
          disabled={isPending}
          title="Upvote"
          aria-label="Upvote"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14l5-5 5 5H7z" />
          </svg>
        </button>
        <span className="comment-score">{score}</span>
        <button
          type="button"
          className={`comment-vote-btn comment-vote-down${currentVote === -1 ? ' active' : ''}`}
          onClick={handleDown}
          disabled={isPending}
          title="Downvote"
          aria-label="Downvote"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </button>
      </div>
      <img
        src={getAuthorImage()}
        alt={author.username}
        className="comment-author-avatar"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = defaultProfilePicture;
        }}
      />
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{author.username}</span>
          <span className="comment-date">
            {createdAt ? new Date(createdAt).toLocaleString() : ''}
            {isEdited && <span className="post-edited-mark"> · edited</span>}
          </span>
          {isOwner && !isEditing && (
            <div className="comment-actions-inline">
              <button
                className="comment-edit-btn"
                onClick={() => setIsEditing(true)}
                title="Edit comment"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                className="comment-edit-btn comment-delete-btn"
                onClick={() => setShowDeleteModal(true)}
                title="Delete comment"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          )}
        </div>

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Delete Comment?</h3>
              <p>Are you sure you want to delete this comment?</p>
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
                  onClick={() => {
                    onDelete?.(comment._id);
                    // Modal will be closed by component unmounting or manually if it fails
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="comment-edit-area">
            <textarea
              className="comment-edit-textarea"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={2}
              disabled={isUpdating}
              autoFocus
            />
            <div className="comment-edit-actions">
              <button
                className="comment-save-btn"
                onClick={handleSave}
                disabled={isUpdating || !editBody.trim()}
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                className="comment-cancel-btn"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-body">{body}</p>
        )}
      </div>
    </div>
  );
};

export default Comment;
