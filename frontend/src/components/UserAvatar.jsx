import React from 'react';

/**
 * UserAvatar — Local initials-based avatar component.
 * Replaces all external ui-avatars.com API calls throughout the app.
 * Shows a profile picture if available, otherwise renders
 * a gradient circle with the user's initials — all local, no network requests.
 *
 * Props:
 *  - src: profile picture URL (optional)
 *  - name: user's display name (used to generate initials)
 *  - size: diameter in px (default: 36)
 *  - fontSize: font size for initials (default: auto-calculated)
 *  - style: extra inline styles (optional)
 *  - className: extra CSS class (optional)
 *  - colorIndex: 0–5 to pick a specific gradient (optional, auto from name)
 */

const AVATAR_GRADIENTS = [
    ['#3b82f6', '#6366f1'],   // blue → indigo
    ['#8b5cf6', '#ec4899'],   // purple → pink
    ['#10b981', '#3b82f6'],   // emerald → blue
    ['#f59e0b', '#ef4444'],   // amber → red
    ['#06b6d4', '#6366f1'],   // cyan → indigo
    ['#14b8a6', '#10b981'],   // teal → emerald
];

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getColorIndex = (name) => {
    if (!name) return 0;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % AVATAR_GRADIENTS.length;
};

const UserAvatar = ({
    src,
    name,
    size = 36,
    fontSize,
    style = {},
    className = '',
    colorIndex,
    alt,
}) => {
    const [imgError, setImgError] = React.useState(false);

    const initials = getInitials(name);
    const gradIndex = colorIndex !== undefined ? colorIndex : getColorIndex(name);
    const [color1, color2] = AVATAR_GRADIENTS[gradIndex % AVATAR_GRADIENTS.length];
    const calculatedFontSize = fontSize || Math.max(10, Math.round(size * 0.38));
    const showImage = src && !imgError;

    const baseStyle = {
        width: size,
        height: size,
        borderRadius: '0px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
    };

    if (showImage) {
        return (
            <div style={baseStyle} className={className}>
                <img
                    src={src}
                    alt={alt || name || 'User avatar'}
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0px' }}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                ...baseStyle,
                background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
            }}
            className={className}
            aria-label={alt || name || 'User avatar'}
            role="img"
        >
            <span style={{
                color: '#ffffff',
                fontSize: calculatedFontSize,
                fontWeight: 700,
                letterSpacing: '0.03em',
                lineHeight: 1,
                fontFamily: "'Inter', sans-serif",
                userSelect: 'none',
            }}>
                {initials}
            </span>
        </div>
    );
};

export default UserAvatar;
