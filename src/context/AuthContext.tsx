import React, { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContextDef';
import { login as authLogin, logout as authLogout, register as authRegister } from '../services/auth.service';
import { getUserById } from '../services/user.service'; // Assuming we fetch user details after login
import type { IUser } from '../types';



export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const userId = localStorage.getItem('userId');
            
            if (token && userId) {
                try {
                    const userData = await getUserById(userId);
                    setUser(userData);
                } catch (err) {
                    console.error("Failed to fetch user profile", err);
                }
            }
            setIsLoading(false);
        };

        void initAuth();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authLogin(credentials);
            const userData = await getUserById(response._id); 
            setUser(userData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: Partial<IUser> & { password: string }, imageFile?: File | null) => {
        setIsLoading(true);
        setError(null);
        try {
            await authRegister(data, imageFile);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authLogout();
            setUser(null);
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


