import {useState, useEffect, useCallback} from 'react';
import {getAllPosts, getPostsByAuthor, createPost as apiCreatePost} from '../services/post.service';
import type {IPost} from '../types';

export const usePosts = (authorId?: string) => {
    const [posts, setPosts] = useState<IPost[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = authorId ? await getPostsByAuthor(authorId) : await getAllPosts();
            setPosts(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch posts');
        } finally {
            setIsLoading(false);
        }
    }, [authorId]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const addPost = async (postData: { message: string; author: string; imgUrl?: string }) => {
        const newPost = await apiCreatePost(postData);
        setPosts((prev) => [...prev, newPost]);
        return newPost;
    };

    return {posts, isLoading, error, refresh: fetchPosts, addPost};
};
