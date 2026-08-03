import React, { createContext, useState, useCallback } from 'react';
export const AriaContext = createContext();
export const AriaProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [contextData, setContextData] = useState(null);
    const openAria = useCallback((data) => {
        setContextData(data);
        setIsOpen(true);
    }, []);
    const closeAria = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => setContextData(null), 300);
    }, []);
    return (
        <AriaContext.Provider value={{ isOpen, contextData, openAria, closeAria }}>
            {children}
        </AriaContext.Provider>
    );
};
