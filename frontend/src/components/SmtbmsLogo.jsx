import React from 'react';

/**
 * SmtbmsLogo - Professional brand logo component
 * Renders a clean SVG logomark (stylized hexagonal S with gradient)
 * alongside the brand name and optional tagline.
 *
 * Props:
 *  - size: icon size in px (default: 28)
 *  - showText: show brand name text (default: true)
 *  - showTagline: show sub-tagline below brand name (default: false)
 *  - textColor: color of the brand name text (default: '#ffffff')
 *  - taglineColor: color of the tagline text (default: '#94a3b8')
 *  - collapsed: if true, only show the icon (default: false)
 */
const SmtbmsLogo = ({
    size = 28,
    showText = true,
    showTagline = false,
    textColor = '#ffffff',
    taglineColor = '#94a3b8',
    collapsed = false
}) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>
            {/* SVG Logomark — Hexagonal S */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
                aria-label="SMTBMS Logo"
            >
                <defs>
                    <linearGradient id="smtbms-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="smtbms-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.9" />
                    </linearGradient>
                </defs>
                {/* Hexagon background */}
                <path
                    d="M16 2L28.124 9V23L16 30L3.876 23V9L16 2Z"
                    fill="url(#smtbms-grad)"
                />
                {/* Subtle inner glow ring */}
                <path
                    d="M16 4.5L26.124 10.25V21.75L16 27.5L5.876 21.75V10.25L16 4.5Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                />
                {/* Stylized S letterform */}
                <path
                    d="M20.5 11.5C20.5 10.5 19.5 9.5 16 9.5C12.5 9.5 11.5 10.8 11.5 12.2C11.5 13.6 12.5 14.3 15.5 14.8L16.8 15C19.6 15.5 21 16.5 21 18.2C21 20 19.5 22.5 16 22.5C12.5 22.5 11 21 11 19.5"
                    stroke="url(#smtbms-s-grad)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>

            {/* Brand text */}
            {!collapsed && showText && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: textColor,
                        letterSpacing: '-0.4px',
                        lineHeight: 1,
                        fontFamily: "'Inter', sans-serif"
                    }}>
                        SMTBMS
                    </span>
                    {showTagline && (
                        <span style={{
                            fontSize: 8.5,
                            color: taglineColor,
                            lineHeight: 1.3,
                            fontWeight: 500,
                            letterSpacing: '0.2px',
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            Smart Material Tracking &<br />Business Management System
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SmtbmsLogo;
