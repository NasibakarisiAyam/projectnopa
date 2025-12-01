import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (nis, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nis, password }),
            });

            const data = await response.json();

            // Handle application-level wrapper with `code` field (some proxies/extensions use this)
            if (data && typeof data === 'object' && 'code' in data && data.code !== 200) {
                const err = new Error(data.message || 'API error');
                err.response = { status: data.code, data };
                throw err;
            }

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            // expose server message when available
            const message = error?.response?.data?.message || error?.message || 'Network error. Please try again.';
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data && typeof data === 'object' && 'code' in data && data.code !== 200) {
                const err = new Error(data.message || 'API error');
                err.response = { status: data.code, data };
                throw err;
            }

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Register error:', error);
            const message = error?.response?.data?.message || error?.message || 'Network error. Please try again.';
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const hasRole = (role) => {
        return user && user.role === role;
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
