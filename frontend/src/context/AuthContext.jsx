import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
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
