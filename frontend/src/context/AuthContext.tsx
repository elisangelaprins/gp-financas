'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface User {
    id: string;
    name: string;
    email: string;
};

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (Credentials: { email: string, password: string }) => Promise<void>;
    register: (data: { name: string; email: string; password: string }) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const data = await apiClient<{ user: User }>('/api/auth/verify');
                setUser(data.user);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        checkAuth();
    }, []);

    const login = async (Credentials: { email: string; password: string }) => {
        const data = await apiClient<{ user: User }>('/api/auth/login', {
            data: Credentials,
        });
        setUser(data.user);
    };

    const register = async (data: { name: string; email: string; password: string }) => {
        await apiClient('/api/auth/register', {
            data,
        });
        await login({ email: data.email, password: data.password });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}> {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context
}