import { createContext } from 'react';
import type { IUser } from '../types';

export interface AuthContextType {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    register: (data: Partial<IUser> & { password: string }, imageFile?: File | null) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
