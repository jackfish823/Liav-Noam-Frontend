import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the access token to headers
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
    refreshSubscribers.map((callback) => callback(token));
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Avoid infinite loops
        if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !(originalRequest as any)._retry) {
            (originalRequest as any)._retry = true;

            if (isRefreshing) {
                return new Promise((resolve) => {
                    addRefreshSubscriber((token: string) => {
                        originalRequest.headers.set('Authorization', `Bearer ${token}`);
                        resolve(apiClient(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post<RefreshTokenResponse>(`${API_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                isRefreshing = false;
                onRefreshed(accessToken);
                refreshSubscribers = [];

                originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
                return apiClient(originalRequest);

            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                // Clear tokens and redirect to login or handle logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Optional: window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
