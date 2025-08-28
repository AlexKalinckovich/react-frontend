import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getUserData, setUserData, clearUserData } from '../types/userTypes';
import { getAccessToken, getRefreshToken, clearTokens } from '../utils/tokenUtils';

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = () => {
            const userData = getUserData();
            const token = getAccessToken();
            const refresh = getRefreshToken();

            if (userData) setUserState(userData);
            if (token) setAccessToken(token);
            if (refresh) setRefreshToken(refresh);
        };

        initAuth();
    }, []);

    const setUser = (userData: User | null) => {
        setUserState(userData);
        if (userData) {
            setUserData(userData);
        } else {
            clearUserData();
        }
    };

    const logout = () => {
        clearTokens();
        clearUserData();
        setUserState(null);
        setAccessToken(null);
        setRefreshToken(null);
    };

    const value: AuthContextType = {
        user,
        setUser,
        logout,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return ctx;
};