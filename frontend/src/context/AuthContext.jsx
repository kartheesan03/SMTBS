import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                // Initialize immediately with local storage
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
                
                // Fetch fresh data from server in background
                try {
                    const { data } = await API.get('/auth/profile');
                    setUser(data);
                    localStorage.setItem('userInfo', JSON.stringify(data));
                } catch (err) {
                    console.error("Failed to fetch latest user profile on reload", err);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const updateUser = (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
