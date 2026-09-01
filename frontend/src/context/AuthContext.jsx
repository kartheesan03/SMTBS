import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { clearDashboardCache } from '../hooks/useDashboardData';
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUser = async () => {
            const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
            
            if (userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    
                    // Immediately render the application shell using cached user data
                    setUser(parsedUser);
                    setLoading(false);
                    
                    // Ensure axios header is set immediately for subsequent requests
                    if (parsedUser.token) {
                        API.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                    }

                    // Background fetch to update profile
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
                    // Do not logout user on network failure here, allow cache to persist
                }
            }
            
            setLoading(false); // Ensure loading is disabled if no userInfo
        };
        fetchUser();
    }, []);
    const login = (data, rememberMe = false) => {
        clearDashboardCache();
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
        if (data.token) {
            API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        }
        setUser(data);
    };
    const logout = () => {
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        clearDashboardCache();
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
