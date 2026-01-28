import apiClient from '../api/client';
import type { IUser } from '../types';

export const getAllUsers = async () => {
    const response = await apiClient.get<IUser[]>('/user');
    return response.data;
};

export const getUserById = async (userId: string) => {
    const response = await apiClient.get<IUser>(`/user/${userId}`);
    return response.data;
};

export const updateUserProfile = async (userId: string, userData: Partial<IUser>) => {
    const response = await apiClient.put<IUser>(`/user/${userId}`, userData);
    return response.data;
};

export const updateUserAsAdmin = async (userId: string, userData: Partial<IUser>) => {
    const response = await apiClient.put<IUser>(`/user/${userId}`, userData);
    return response.data;
};

// Deleting user usually is restricted or sensitive, but for completeness:
export const deleteUser = async (userId: string) => {
    const response = await apiClient.delete(`/user/${userId}`);
    return response.data;
};
