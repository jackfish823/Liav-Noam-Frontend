import apiClient from '../api/client';
import type { IUser, LoginResponse } from '../types';

export const register = async (userData: Partial<IUser> & { password: string }) => {
    // Creating a user is effectively "registering"
    const response = await apiClient.post<IUser>('/user', userData);
    return response.data;
};

export const login = async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userId', response.data._id);
    }
    return response.data;
};

export const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
        if (refreshToken) {
            await apiClient.post('/auth/logout', { refreshToken });
        }
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('accessToken');
};
