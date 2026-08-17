import React from 'react';

const Avatar = ({ user, size = 40 }) => {
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    return (
        <div 
            style={{ 
                width: size, 
                height: size, 
                borderRadius: '50%', 
                backgroundColor: '#3E5A73', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: size * 0.4, 
                fontWeight: '600',
                overflow: 'hidden',
                flexShrink: 0
            }}
        >
            {user?.picture ? (
                <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <span>{getInitials(user?.name)}</span>
            )}
        </div>
    );
};

export default Avatar;
