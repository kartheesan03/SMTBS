import React, { createContext, useState, useCallback } from 'react';

/**
 * AriaContext – 3-state interaction flow
 *
 *  'closed'  →  Nothing shown (State 1 / normal dashboard)
 *  'fab'     →  Small floating Aria button shown (State 2)
 *  'open'    →  Full AI workspace shown (State 3)
 */
export const AriaContext = createContext({
    ariaState: 'closed',
    isOpen: false,
    isFab: false,
    contextData: null,
    openAria: () => {},
    expandAria: () => {},
    collapseAria: () => {},
    closeAria: () => {},
});

export const AriaProvider = ({ children }) => {
    const [ariaState, setAriaState] = useState('closed'); // 'closed' | 'fab' | 'open'
    const [contextData, setContextData] = useState(null);

    // Sidebar click (no data) → State 2 (FAB).
    // Contextual open with data (from order/vendor/material pages) → State 3 (full panel).
    const openAria = useCallback((data) => {
        if (data) {
            setContextData(data);
            setAriaState('open'); // jump straight to full panel when context is provided
        } else {
            setAriaState('fab'); // sidebar click → show floating button first
        }
    }, []);

    // FAB click → State 2 → State 3 (full workspace)
    const expandAria = useCallback(() => {
        setAriaState('open');
    }, []);

    // Close/minimize from full workspace → State 3 → State 2 (back to FAB)
    const collapseAria = useCallback(() => {
        setAriaState('fab');
    }, []);

    // × button → completely dismiss (State 1)
    const closeAria = useCallback(() => {
        setAriaState('closed');
        setTimeout(() => setContextData(null), 300);
    }, []);

    // ── Computed shorthands (kept for backward-compat with any other consumer) ──
    const isOpen = ariaState === 'open';
    const isFab  = ariaState === 'fab';
    const isCollapsed = ariaState === 'fab'; // legacy alias

    return (
        <AriaContext.Provider value={{
            ariaState,
            isOpen,
            isFab,
            isCollapsed,
            contextData,
            openAria,    // sidebar click → show FAB
            expandAria,  // FAB click    → show full panel
            collapseAria,// panel minimize → back to FAB
            closeAria,   // panel close   → fully hidden
        }}>
            {children}
        </AriaContext.Provider>
    );
};
