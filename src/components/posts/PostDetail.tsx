import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [post, setPost] = useState<IPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
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
    updateComment,
    isUpdatingComment,
  } = useCommentsByPost({ postId: postId || '', limit: 10 });

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
      <div className="posts-container">
        <div className="loading-spinner">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="posts-container">
        <div className="error-message">{error || 'Post not found'}</div>
      </div>
    );
  }

  const author = post.author as IPost['author'];

  return (
    <div className="posts-container">
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
              {post.createdAt && post.updatedAt &&
                new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
                  <span className="post-edited-mark"> · edited</span>
              )}
            </span>
          </div>
          {user?._id === author._id && (
            <button
              className="post-detail-edit-btn"
              onClick={() => navigate(`/posts/${postId}/edit`)}
              title="Edit post"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          <button
            className={`post-detail-like-btn${liked ? ' liked' : ''}`}
            onClick={() => {
              setLiked(v => !v);
              setLikeCount(c => liked ? c - 1 : c + 1);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {post.image?.url ? (
          <div className="post-detail-image">
            <img src={post.image.url} alt="Post" />
          </div>
        ) : (
          <div className="post-card-image-placeholder">
            <span>No image yet</span>
          </div>
        )}

        <div className="post-detail-content">
          <p>{post.message}</p>
        </div>

        {likeCount > 0 && (
          <div className="post-detail-likes">
            ❤️ Liked by <strong>{likeCount}</strong> {likeCount === 1 ? 'person' : 'people'}
          </div>
        )}

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
                  <Comment
                    key={comment._id}
                    comment={comment}
                    currentUserId={user?._id}
                    onUpdate={(commentId, body) => updateComment({ commentId, body })}
                    isUpdating={isUpdatingComment}
                  />
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
