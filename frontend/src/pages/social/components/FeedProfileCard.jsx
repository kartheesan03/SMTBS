import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import { Camera, Bookmark, Users, Mail, Calendar, Compass } from 'lucide-react';

const FeedProfileCard = () => {
    const { user } = useContext(AuthContext);
    const [hoverAvatar, setHoverAvatar] = useState(false);
    const [hoverCover, setHoverCover] = useState(false);

    const stats = {
        posts: user?.stats?.posts || 0,
        connections: user?.stats?.connections || 0,
        views: user?.stats?.profileViews || 0,
    };

    return (
        <div style={{
            backgroundColor: 'var(--feed-bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--feed-border-card)',
            overflow: 'hidden',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Cover Photo Area */}
            <div 
                style={{
                    height: '55px',
                    backgroundColor: '#A0B4CB', /* Standard LinkedIn default cover color */
                    position: 'relative'
                }}
            >
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 16px 16px', position: 'relative' }}>
                <div 
                    style={{ 
                        marginTop: '-36px', 
                        marginBottom: '12px', 
                        borderRadius: '50%', 
                        border: '3px solid var(--feed-avatar-ring)',
                        backgroundColor: 'var(--feed-bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '76px', /* 72 + border */
                        height: '76px'
                    }}
                >
                    <Avatar user={user} size={70} />
                </div>
                
                <h3 style={{ margin: '0 0 4px', color: 'var(--feed-text-primary)', fontSize: '16px', fontWeight: '600', textAlign: 'center', lineHeight: '1.25' }}>
                    {user?.name || 'Loading...'}
                </h3>
                <p style={{ margin: '0 0 4px', color: 'var(--feed-text-muted)', fontSize: '13px', fontWeight: '400', textAlign: 'center', lineHeight: '1.4' }}>
                    {user?.role || 'Employee'} {user?.department ? `at ${user.department}` : ''}
                </p>
                {user?.location && (
                    <p style={{ margin: '0 0 12px', color: 'var(--feed-text-muted)', fontSize: '12px', fontWeight: '400', textAlign: 'center' }}>
                        {user.location}
                    </p>
                )}

                <button style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--feed-text-muted)',
                    borderRadius: '24px',
                    color: 'var(--feed-text-muted)',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '4px',
                    transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; e.currentTarget.style.border = '1px solid var(--feed-text-primary)'; e.currentTarget.style.color = 'var(--feed-text-primary)'; }}
                onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.border = '1px solid var(--feed-text-muted)'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}
                >
                    + Experience
                </button>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--feed-border-card)' }}></div>

            {/* Promo Banner Block */}
            <div style={{ padding: '12px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                 onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'}
                 onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--feed-text-muted)', fontSize: '12px', marginBottom: '2px' }}>Explore company resources</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Compass size={14} color="#F59E0B" />
                        <span style={{ color: 'var(--feed-text-primary)', fontSize: '13px', fontWeight: '600' }}>Access Employee Portal</span>
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--feed-border-card)' }}></div>

            {/* Stats Block */}
            <div style={{ padding: '12px 0' }}>
                <div 
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ color: 'var(--feed-text-muted)', fontSize: '12px', fontWeight: '600' }}>Profile viewers</span>
                    <span style={{ color: 'var(--feed-accent-blue)', fontSize: '12px', fontWeight: '600' }}>{stats.views}</span>
                </div>
                <div 
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ color: 'var(--feed-text-muted)', fontSize: '12px', fontWeight: '600' }}>View all analytics</span>
                </div>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--feed-border-card)' }}></div>

            {/* Bottom List */}
            <div style={{ padding: '12px 0' }}>
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Bookmark size={16} color="var(--feed-text-muted)" />
                    <span style={{ color: 'var(--feed-text-muted)', fontSize: '13px', fontWeight: '600' }}>Saved items</span>
                </div>
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Users size={16} color="var(--feed-text-muted)" />
                    <span style={{ color: 'var(--feed-text-muted)', fontSize: '13px', fontWeight: '600' }}>Groups</span>
                </div>
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Mail size={16} color="var(--feed-text-muted)" />
                    <span style={{ color: 'var(--feed-text-muted)', fontSize: '13px', fontWeight: '600' }}>Newsletters</span>
                </div>
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Calendar size={16} color="var(--feed-text-muted)" />
                    <span style={{ color: 'var(--feed-text-muted)', fontSize: '13px', fontWeight: '600' }}>Events</span>
                </div>
            </div>
        </div>
    );
};

export default FeedProfileCard;
