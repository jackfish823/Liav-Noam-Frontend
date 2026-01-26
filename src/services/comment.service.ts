import apiClient from '../api/client';
import type { IComment } from '../types';

export const getAllComments = async () => {
    const response = await apiClient.get<IComment[]>('/comment');
    return response.data;
};

export const getCommentsByPostId = async (postId: string) => {
    const response = await apiClient.get<IComment[]>(`/comment?postId=${postId}`);
    return response.data;
};

export const getCommentById = async (commentId: string) => {
    const response = await apiClient.get<IComment>(`/comment/${commentId}`);
    return response.data;
};

export const createComment = async (commentData: { body: string; postId: string; author: string }) => {
    const response = await apiClient.post<IComment>('/comment', commentData);
    return response.data;
};

export const updateComment = async (commentId: string, commentData: Partial<IComment>) => {
    const response = await apiClient.put<IComment>(`/comment/${commentId}`, commentData);
    return response.data;
};

export const deleteComment = async (commentId: string) => {
    const response = await apiClient.delete(`/comment/${commentId}`);
    return response.data;
};
