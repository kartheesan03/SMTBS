import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import { Camera, Bookmark, Users } from 'lucide-react';

const FeedProfileCard = () => {
    const { user } = useContext(AuthContext);
    const [hoverAvatar, setHoverAvatar] = useState(false);
    const [hoverCover, setHoverCover] = useState(false);

    // Using mock stats for the UI presentation
    const stats = {
        posts: 12,
        connections: 148,
        teamSize: 24,
    };

    return (
        <div style={{
            background: 'linear-gradient(180deg, #1A2436 0%, #161F32 100%)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '16px'
        }}>
            {/* Cover Photo Area (Mock) */}
            <div 
                onMouseOver={() => setHoverCover(true)}
                onMouseOut={() => setHoverCover(false)}
                style={{
                    height: '60px',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(59, 130, 246, 0.15) 100%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    position: 'relative',
                    cursor: 'pointer'
                }}
            >
                {hoverCover && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={16} color="#F8FAFC" />
                    </div>
                )}
            </div>
            
            <div style={{ padding: '0 0 16px 0', display: 'flex', flexDirection: 'column' }}>
                <div 
                    onMouseOver={() => setHoverAvatar(true)}
                    onMouseOut={() => setHoverAvatar(false)}
                    style={{ 
                        marginTop: '-36px', 
                        marginLeft: '20px',
                        marginBottom: '12px', 
                        borderRadius: '50%', 
                        padding: '2px',
                        background: '#1A2436',
                        display: 'inline-block',
                        width: 'max-content',
                        position: 'relative',
                        cursor: 'pointer'
                    }}
                >
                    <Avatar user={user} size={68} />
                    {hoverAvatar && (
                        <div style={{ position: 'absolute', top: '2px', left: '2px', width: '68px', height: '68px', borderRadius: '50%', backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Camera size={24} color="#F8FAFC" />
                        </div>
                    )}
                </div>
                
                <div style={{ padding: '0 20px' }}>
                    <h3 style={{ margin: '0 0 4px', color: '#F8FAFC', fontSize: '18px', fontWeight: '600' }}>
                        {user?.name || 'Loading...'}
                    </h3>
                    <p style={{ margin: '0 0 4px', color: '#94A3B8', fontSize: '14px', fontWeight: '400' }}>
                        {user?.role || 'Software Engineer at SMTBMS'}
                    </p>
                    <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '12px', fontWeight: '400' }}>
                        Engineering · Salem, TN
                    </p>
                </div>

                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}></div>

                <div style={{ padding: '12px 0' }}>
                    <div 
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 20px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '600' }}>Connections</span>
                        <span style={{ color: '#3B82F6', fontSize: '13px', fontWeight: '600' }}>{stats.connections}</span>
                    </div>
                    <div 
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 20px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '600' }}>Who's viewed your profile</span>
                        <span style={{ color: '#3B82F6', fontSize: '13px', fontWeight: '600' }}>12</span>
                    </div>
                </div>

                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}></div>

                <div style={{ padding: '12px 0 0 0' }}>
                    <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Bookmark size={16} color="#64748B" />
                        <span style={{ color: '#E2E8F0', fontSize: '13px', fontWeight: '500' }}>Saved items</span>
                    </div>
                    <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Users size={16} color="#64748B" />
                        <span style={{ color: '#E2E8F0', fontSize: '13px', fontWeight: '500' }}>My Team</span>
                    </div>
                </div>
        </div>
    );
};

export default FeedProfileCard;
