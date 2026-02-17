import apiClient from '../api/client';
import type { IUser, LoginResponse } from '../types';

export const register = async (
    userData: Partial<IUser> & { password: string },
    imageFile?: File | null
) => {
    // If there's an image file, send as multipart/form-data
    if (imageFile) {
        const formData = new FormData();

        formData.append('username', userData.username || '');
        formData.append('email', userData.email || '');
        formData.append('password', userData.password);
        formData.append('image', imageFile);

        const response = await apiClient.post<IUser>('/user', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    }

    // Otherwise, send as JSON
    const response = await apiClient.post<IUser>('/user', userData);
    return response.data;
};

export const login = async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    console.log(response.data);

    if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
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

export const googleLogin = async (credential: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/google', { credential });

    if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userId', response.data._id);
    }

    return response.data;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('accessToken');
};
