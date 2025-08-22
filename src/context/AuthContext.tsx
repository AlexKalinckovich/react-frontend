import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getUserData, setUserData, clearUserData } from '../types/userTypes';
import { getAccessToken, getRefreshToken, clearTokens } from '../utils/tokenUtils';

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    accessToken:  string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: ({children}: { children: React.ReactNode }) => React.JSX.Element =
    ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() : void => {
        const initAuth: () => void = () : void => {
            const userData:  User | null = getUserData();
            const token:   string | null = getAccessToken();
            const refresh: string | null = getRefreshToken();

            if (userData) {
                setUserState(userData);
            }

            if (token) {
                setAccessToken(token);
            }

            if (refresh) {
                setRefreshToken(refresh);
            }
        };

        initAuth();
    }, []);

    const setUser: (userData: (User | null)) => void = (userData: User | null) : void => {
        setUserState(userData);
        if (userData) {
            setUserData(userData);
        } else {
            clearUserData();
        }
    };

    const logout: () => void = () : void => {
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

export const useAuth: () => AuthContextType = () : AuthContextType => {
    const ctx: AuthContextType | undefined = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return ctx;
};