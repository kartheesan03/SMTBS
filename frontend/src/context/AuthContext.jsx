import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
            if (userInfo) {
                // Initialize immediately with local or session storage
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
                
                // Fetch fresh data from server in background
                try {
                    const { data } = await API.get('/auth/profile');
                    if (parsedUser.loginTime) {
                        data.loginTime = parsedUser.loginTime;
                    }
                    if (parsedUser.token) {
                        data.token = parsedUser.token;
                    }
                    setUser(data);
                    if (localStorage.getItem('userInfo')) {
                        localStorage.setItem('userInfo', JSON.stringify(data));
                    } else if (sessionStorage.getItem('userInfo')) {
                        sessionStorage.setItem('userInfo', JSON.stringify(data));
                    }
                } catch (err) {
                    console.error("Failed to fetch latest user profile on reload", err);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = (data, rememberMe = false) => {
        if (!data.loginTime) {
            data.loginTime = new Date().toISOString();
        }
        if (rememberMe) {
            localStorage.setItem('userInfo', JSON.stringify(data));
            sessionStorage.removeItem('userInfo');
        } else {
            sessionStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.removeItem('userInfo');
        }
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        setUser(null);
    };

    const updateUser = (data) => {
        if (localStorage.getItem('userInfo')) {
            localStorage.setItem('userInfo', JSON.stringify(data));
        } else if (sessionStorage.getItem('userInfo')) {
            sessionStorage.setItem('userInfo', JSON.stringify(data));
        }
        setUser(data);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
