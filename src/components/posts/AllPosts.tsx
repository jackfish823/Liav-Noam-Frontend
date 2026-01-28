import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts';
import PostCard from './PostCard';
import './posts.css';

const AllPosts: React.FC = () => {
  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = usePosts({ limit: 5 });
  
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
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="posts-container">
        <div className="loading-spinner">Loading posts...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="posts-container">
        <div className="error-message">Failed to load posts</div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <Link to="/">
          <button className="nav-button">
            ← Back
          </button>
        </Link>
        <h1>All Posts</h1>
        <Link to="/posts/create">
          <button className="nav-button add-post-btn">+ Add Post</button>
        </Link>
      </div>

      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Be the first to create one!</p>
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
                    <span>Loading more posts...</span>
                  </div>
                )}
              </div>
            )}

            {!hasNextPage && posts.length > 0 && (
              <p className="end-of-comments">That's all the posts!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
