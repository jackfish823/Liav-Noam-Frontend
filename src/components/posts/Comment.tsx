import React from 'react';
import type { IComment, IUser, IImage } from '../../types';
import defaultProfilePicture from '../../assets/default-pfp.svg';
import './posts.css';

interface CommentProps {
  comment: IComment;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const { author, createdAt, body } = comment;

  const getAuthorImage = () => {
    if (author.profileImage) {
      return (author.profileImage as IImage).url;
    }

    return author.imgUrl || defaultProfilePicture;
  };

  return (
    <div className="comment">
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
          </span>
        </div>
        <p className="comment-body">{body}</p>
      </div>
    </div>
  );
};

export default Comment;
