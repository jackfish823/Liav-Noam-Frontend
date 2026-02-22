import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import PostCard from './PostCard';
import './posts.css';

const MyPosts: React.FC = () => {
  const { user } = useAuth();
  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePosts({ limit: 5, author: user!._id });

  const observerTarget = useRef<HTMLDivElement>(null);

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
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="posts-container">
        <div className="loading-spinner">Loading your posts...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="posts-container">
        <div className="error-message">Failed to load your posts</div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="myposts-header">
        <div className="myposts-title-row">
          <span className="myposts-title">Posts created by you</span>
          <span className="myposts-count">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>You haven't posted anything yet.</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {hasNextPage && (
              <div ref={observerTarget} className="scroll-trigger">
                {isFetchingNextPage && (
                  <div className="loading-more">
                    <div className="spinner-small"></div>
                    <span>Loading more...</span>
                  </div>
                )}
              </div>
            )}

            {!hasNextPage && posts.length > 0 && (
              <p className="end-of-comments">That's all your posts!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
