import apiClient from '../api/client';
import type { IComment } from '../types';

export const getAllComments = async () => {
    const response = await apiClient.get<IComment[]>('/comment');
    return response.data;
};

export interface CommentsResponse {
    comments: IComment[];
    pagination: {
        nextCursor: string | null;
        hasMore: boolean;
        limit?: number;
    };
}

export const getCommentsByPostId = async (postId: string, cursor?: string | null, limit = 1) => {
    const params = new URLSearchParams({
        postId,
        limit: limit.toString(),
    });
    
    if (cursor) {
        params.append('cursor', cursor);
    }
    
    const response = await apiClient.get<CommentsResponse>(`/comment?${params.toString()}`);
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

export const updateComment = async (commentId: string, commentData: { body: string }) => {
    const response = await apiClient.put<IComment>(`/comment/${commentId}`, commentData);
    return response.data;
};

export const deleteComment = async (commentId: string) => {
    const response = await apiClient.delete(`/comment/${commentId}`);
    return response.data;
};
