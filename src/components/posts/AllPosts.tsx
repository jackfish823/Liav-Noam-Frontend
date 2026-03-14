import React, { useRef, useEffect, useState } from 'react';
import { usePosts } from '../../hooks/usePosts';
import PostCard from './PostCard';
import './posts.css';

const AllPosts: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const handleSearch = () => {
    setActiveQuery(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setActiveQuery('');
  };

  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = usePosts({ limit: 5, searchQuery: activeQuery });
  
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

  return (
    <div className="posts-container">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <svg 
            className="search-icon" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search posts (e.g. 'posts about dogs with more than 5 likes')"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchInput && (
            <button className="clear-search" onClick={handleClear}>×</button>
          )}
        </div>
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading posts...</div>
      ) : isError ? (
        <div className="error-message">Failed to load posts</div>
      ) : (
        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="no-posts">
              {activeQuery ? (
                <p>No results found for "{activeQuery}". Try a different search.</p>
              ) : (
                <p>No posts yet. Be the first to create one!</p>
              )}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}

              {hasNextPage && !activeQuery && (
                <div ref={observerTarget} className="scroll-trigger">
                  {isFetchingNextPage && (
                    <div className="loading-more">
                      <div className="spinner-small"></div>
                      <span>Loading more posts...</span>
                    </div>
                  )}
                </div>
              )}

              {(!hasNextPage || !!activeQuery) && posts.length > 0 && (
                <p className="end-of-comments">That's all the posts!</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AllPosts;
