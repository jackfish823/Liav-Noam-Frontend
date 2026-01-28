import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostById } from '../../services/post.service';
import { useAuth } from '../../hooks/useAuth';
import { useCommentsByPost } from '../../hooks/useCommentsByPost';
import Comment from './Comment';
import type { IPost, IImage } from '../../types';
import defaultProfilePicture from '../../assets/default-pfp.svg';
import './posts.css';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<IPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
    isError: isCommentsError,
    createComment: postComment,
    isCreatingComment,
  } = useCommentsByPost({ postId: postId || '', limit: 5 });

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      setIsLoadingPost(true);
      setError(null);
      try {
        const data = await getPostById(postId);
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch post');
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentBody.trim()) {
      setCommentError('Please enter a comment');
      return;
    }

    if (!postId) {
      setCommentError('Unable to post comment');
      return;
    }

    postComment(
      {
        body: commentBody.trim(),
        postId,
        author: user!._id,
      },
      {
        onSuccess: () => {
          setCommentBody('');
          setCommentError(null);
        },
        onError: (err: any) => {
          setCommentError(err.response?.data?.message || 'Failed to post comment');
        },
      }
    );
  };

  const getAuthorImage = () => {
    if (!post?.author) return defaultProfilePicture;
    
    const author = post.author as { username: string; profileImage?: IImage };

    if (author.profileImage?.url) {
      return author.profileImage.url;
    }

    return defaultProfilePicture;
  };

  if (isLoadingPost) {
    return (
      <div className="app-container">
        <div className="loading-spinner">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="app-container">
        <div className="error-message">{error || 'Post not found'}</div>
        <Link to="/posts">
          <button>Back to Posts</button>
        </Link>
      </div>
    );
  }

  const author = post.author as { username: string; profileImage?: IImage };

  return (
    <div className="app-container">
      <div className="post-detail-nav">
        <Link to="/posts">
          <button className="back-button">
            ← Back
          </button>
        </Link>
      </div>

      <div className="post-detail">
        <div className="post-detail-header">
          <img 
            src={getAuthorImage()} 
            alt={author.username} 
            className="post-author-avatar-large"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = defaultProfilePicture;
            }}
          />
          <div className="post-author-info">
            <h2>{author.username}</h2>
            <span className="post-date">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
            </span>
          </div>
        </div>

        <div className="post-detail-content">
          <p>{post.message}</p>
        </div>

        <div className="comments-section">
          <h3>Comments ({post.commentsCount})</h3>
          
          <form onSubmit={handleCommentSubmit} className="comment-form">
            {commentError && (
              <div className="error-message">{commentError}</div>
            )}
            <div className="form-group">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="comment-textarea"
                disabled={isCreatingComment}
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isCreatingComment || !commentBody.trim()}
              >
                {isCreatingComment ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </form>

          {isLoadingComments ? (
            <p className="loading-comments">Loading comments...</p>
          ) : isCommentsError ? (
            <p className="error-message">Failed to load comments</p>
          ) : comments.length > 0 ? (
            <>
              <div className="comments-list">
                {comments.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))}
              </div>
              
              {hasNextPage && (
                <div 
                  ref={observerTarget} 
                  className="scroll-trigger"
                >
                  {isFetchingNextPage && (
                    <div className="loading-more">
                      <div className="spinner-small"></div>
                      <span>Loading more comments...</span>
                    </div>
                  )}
                </div>
              )}

              {!hasNextPage && comments.length > 5 && (
                <p className="end-of-comments">That's all the comments!</p>
              )}
            </>
          ) : (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
