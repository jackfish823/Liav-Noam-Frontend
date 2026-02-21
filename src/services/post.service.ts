import apiClient from '../api/client';
import type { IPost } from '../types';

export interface PostsResponse {
    posts: IPost[];
    pagination: {
        nextCursor: string | null;
        hasMore: boolean;
        limit?: number;
    };
}

export const getAllPosts = async () => {
    const response = await apiClient.get<IPost[]>('/post');
    return response.data;
};

export const getPostsPaginated = async (cursor?: string | null, limit = 10, author?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });

    if (cursor) params.append('cursor', cursor);
    if (author) params.append('author', author);
    
    const response = await apiClient.get<PostsResponse>(`/post?${params.toString()}`);
    return response.data;
};

export const getPostsByAuthor = async (authorId: string) => {
    const response = await apiClient.get<IPost[]>(`/post?author=${authorId}`);
    return response.data;
};

export const getPostById = async (postId: string) => {
    const response = await apiClient.get<IPost>(`/post/${postId}`);
    return response.data;
};

export const createPost = async (postData: { message: string; author: string; image?: string }) => {
    const response = await apiClient.post<IPost>('/post', postData);
    return response.data;
};

export const updatePost = async (postId: string, postData: { message: string; image?: string | null }) => {
    const response = await apiClient.put<IPost>(`/post/${postId}`, postData);
    return response.data;
};

export const deletePost = async (postId: string) => {
    const response = await apiClient.delete(`/post/${postId}`);
    return response.data;
};

export const likePost = async (postId: string) => {
    const response = await apiClient.post<IPost>(`/post/${postId}/like`);
    return response.data;
};

export const unlikePost = async (postId: string) => {
    const response = await apiClient.delete<IPost>(`/post/${postId}/like`);
    return response.data;
};
