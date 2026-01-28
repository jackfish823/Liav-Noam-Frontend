import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import './posts.css';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createPost, isCreatingPost } = usePosts();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setError(null);
    createPost(
      {
        message: message.trim(),
        author: user!._id,
      },
      {
        onSuccess: () => {
          navigate('/posts');
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || 'Failed to create post');
        },
      }
    );
  };

  return (
    <div className="posts-container">
      <div className="posts-header">
        <Link to="/posts">
          <button className="nav-button">← Cancel</button>
        </Link>
        <h1>Create Post</h1>
        <div style={{ width: '100px' }}></div>
      </div>

      <div className="create-post-form-container">
        <form onSubmit={handleSubmit} className="create-post-form">
          {error && (
            <div className="form-error">{error}</div>
          )}

          <div className="form-group">
            <label htmlFor="message">What's on your mind?</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              rows={8}
              disabled={isCreatingPost}
              maxLength={500}
            />
            <small className="char-count">
              {message.length}/500 characters
            </small>
          </div>

          <button 
            type="submit" 
            className="submit-post-btn"
            disabled={isCreatingPost || !message.trim()}
          >
            {isCreatingPost ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
