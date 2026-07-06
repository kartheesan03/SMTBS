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
    collapsed = false
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
                style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
            >
                <defs>
                    <linearGradient id="top-face" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8"/>
                        <stop offset="100%" stopColor="#3b82f6"/>
                    </linearGradient>
                    <linearGradient id="left-face" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8"/>
                        <stop offset="100%" stopColor="#4f46e5"/>
                    </linearGradient>
                    <linearGradient id="right-face" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a78bfa"/>
                        <stop offset="100%" stopColor="#7c3aed"/>
                    </linearGradient>
                    <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                        <stop offset="30%" stopColor="#c084fc" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
                    </radialGradient>
                    <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.2" />
                    </filter>
                </defs>
                
                {/* Background soft plate */}
                <rect width="40" height="40" rx="10" fill="#ffffff" fillOpacity="0.05" />

                {/* Glowing Core */}
                <circle cx="20" cy="21" r="11" fill="url(#core-glow)" />
                
                {/* Floating Faces (Exploding Isometric Cube) */}
                
                {/* Top Face */}
                <path d="M20 3 L8.5 9.5 L20 16 L31.5 9.5 Z" fill="url(#top-face)" filter="url(#inner-shadow)" opacity="0.95" />
                
                {/* Left Face */}
                <path d="M6 14.5 L17.5 21 L17.5 34 L6 27.5 Z" fill="url(#left-face)" filter="url(#inner-shadow)" opacity="0.95" />
                
                {/* Right Face */}
                <path d="M34 14.5 L34 27.5 L22.5 34 L22.5 21 Z" fill="url(#right-face)" filter="url(#inner-shadow)" opacity="0.95" />

                {/* Connection Lines (Network/Tracking) */}
                <path d="M20 16 L20 21" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
                <path d="M17.5 21 L20 21" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
                <path d="M22.5 21 L20 21" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
                
                {/* Core dot */}
                <circle cx="20" cy="21" r="2.5" fill="#ffffff" />
            </svg>

            {/* Brand text */}
            {!collapsed && showText && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{
                        fontSize: Math.max(16, size * 0.6),
                        fontWeight: 800,
                        color: textColor,
                        letterSpacing: '-0.5px',
                        lineHeight: 1,
                        fontFamily: "'Inter', sans-serif"
                    }}>
                        SMTBMS
                    </span>
                    {showTagline && (
                        <span style={{
                            fontSize: Math.max(9, size * 0.35),
                            color: taglineColor,
                            lineHeight: 1.3,
                            fontWeight: 500,
                            letterSpacing: '0px',
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
