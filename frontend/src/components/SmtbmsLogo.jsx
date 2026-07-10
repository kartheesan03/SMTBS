import React from 'react';

/**
 * SmtbmsLogo - Premium Unique Brand Logo Component
 * Features an exploding isometric 3D cube revealing a smart glowing core,
 * representing "Smart Material Tracking & Business Management".
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
    collapsed = false,
    title = 'SMTBMS'
}) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, userSelect: 'none' }}>
            {/* Premium Custom SVG Logomark */}
            <svg 
                width={size} 
                height={size} 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
            >
                {/* Background soft plate */}
                <rect width="40" height="40" rx="10" fill="#3b82f6" />
                
                {/* Stacked Layers */}
                {/* Top Diamond */}
                <path d="M 20 10.5 L 31 16 L 20 21.5 L 9 16 Z" fill="#ffffff" />
                
                {/* Middle Chevron */}
                <path d="M 9 19.5 L 20 25 L 31 19.5 L 31 22 L 20 27.5 L 9 22 Z" fill="#ffffff" opacity="0.6" />
                
                {/* Bottom Chevron */}
                <path d="M 9 24 L 20 29.5 L 31 24 L 31 26.5 L 20 32 L 9 26.5 Z" fill="#ffffff" opacity="0.3" />
            </svg>

            {/* Brand text */}
            {!collapsed && showText && (
                    <span style={{
                        fontSize: Math.max(14, size * 0.5),
                        fontWeight: 700,
                        color: textColor,
                        letterSpacing: '-0.3px',
                        lineHeight: 1.1,
                        fontFamily: "'Inter', sans-serif",
                        whiteSpace: title === 'SMTBMS' ? 'normal' : 'nowrap'
                    }}>
                        {title.includes('&') ? (
                            <>
                                {title.split('&')[0]} &<br/>
                                {title.split('&')[1]}
                            </>
                        ) : title}
                    </span>
            )}
        </div>
    );
};

export default SmtbmsLogo;
