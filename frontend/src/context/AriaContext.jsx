import React, { createContext, useState, useCallback } from 'react';

export const AriaContext = createContext();

export const AriaProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [contextData, setContextData] = useState(null);

    const openAria = useCallback((data) => {
        if (data) setContextData(data);
        setIsOpen(true);
    }, []);

    const closeAria = useCallback(() => {
        setIsOpen(false);
        // Do not reset maximized state immediately to allow smooth transition out
        setTimeout(() => {
            setContextData(null);
            setIsMaximized(false);
        }, 300);
    }, []);

    const toggleMaximize = useCallback(() => {
        setIsMaximized(prev => !prev);
    }, []);

    const minimizeAria = useCallback(() => {
        setIsMaximized(false);
    }, []);

    return (
        <AriaContext.Provider value={{ 
            isOpen, 
            isMaximized, 
            contextData, 
            openAria, 
            closeAria, 
            toggleMaximize,
            minimizeAria 
        }}>
            {children}
        </AriaContext.Provider>
    );
};
