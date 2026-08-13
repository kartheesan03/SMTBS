import React, { createContext, useState, useCallback } from 'react';
export const AriaContext = createContext();
export const AriaProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [contextData, setContextData] = useState(null);
    const [openMaximized, setOpenMaximized] = useState(false);
    const openAria = useCallback((data, { maximized = false } = {}) => {
        setContextData(data);
        setOpenMaximized(maximized);
        setIsOpen(true);
    }, []);
    const closeAria = useCallback(() => {
        setIsOpen(false);
        setOpenMaximized(false);
        setTimeout(() => setContextData(null), 300);
    }, []);
    return (
        <AriaContext.Provider value={{ isOpen, contextData, openAria, closeAria, openMaximized }}>
            {children}
        </AriaContext.Provider>
    );
};
