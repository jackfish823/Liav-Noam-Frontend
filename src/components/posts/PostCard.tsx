import React from 'react';
import { Link } from 'react-router-dom';
import type { IPost, IImage } from '../../types';
import defaultProfilePicture from '../../assets/default-pfp.svg';
import './posts.css';

interface PostCardProps {
  post: IPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { _id: postId, author, commentsCount, createdAt, message } = post;

  const getAuthorImage = () => {
    if (author.profileImage) {
      return (author.profileImage as IImage).url;
    }

    return author.imgUrl || defaultProfilePicture;
  };

  return (
    <Link to={`/posts/${postId}`} className="post-card-link">
      <div className="post-card">
        <div className="post-header">
          <img 
            src={getAuthorImage()} 
            alt={author.username} 
            className="post-author-avatar"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = defaultProfilePicture;
            }}
          />
          <div className="post-author-info">
            <h3>{author.username}</h3>
            <span className="post-date">
              {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
            </span>
          </div>
        </div>

        <div className="post-content">
          <p>{message}</p>
        </div>

        <div className="post-footer">
          <span className="comment-count">
            💬 {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
