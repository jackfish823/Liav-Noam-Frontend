import React from 'react';
import { Link } from 'react-router-dom';
import type { IPost, IImage } from '../../types';
import defaultProfilePicture from '../../assets/default-pfp.svg';
import './posts.css';

interface PostCardProps {
  post: IPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { _id: postId, author, commentsCount, createdAt, message, imgUrl } = post;

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
          </span>
        </div>
      </div>

      {imgUrl && (
        <div className="post-card-image">
          <img src={imgUrl} alt="Post" />
        </div>
      )}

      {!imgUrl && (
        <div className="post-card-image-placeholder">
          <span>No image yet</span>
        </div>
      )}

      <div className="post-card-body">
        <p className="post-card-message">{message}</p>
      </div>

      <div className="post-card-actions">
        <button
          className="post-card-like-btn"
          onClick={(e) => e.preventDefault()}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>Like</span>
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
