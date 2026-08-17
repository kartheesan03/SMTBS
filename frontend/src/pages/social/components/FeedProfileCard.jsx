import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';

const FeedProfileCard = () => {
    const { user } = useContext(AuthContext);

    // Using mock stats for the UI presentation
    const stats = {
        posts: 12,
        connections: 148,
        teamSize: 24,
    };

    return (
        <div style={{
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #334155',
            overflow: 'hidden',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: '16px'
        }}>
            {/* Cover Photo Area (Mock) */}
            <div style={{
                height: '60px',
                backgroundColor: '#3B82F6',
                backgroundImage: 'linear-gradient(to right, #3B82F6, #1D4ED8)'
            }}></div>
            
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginTop: '-24px', marginBottom: '12px', border: '3px solid #1E293B', borderRadius: '50%', backgroundColor: '#1E293B' }}>
                    <Avatar user={user} size={64} />
                </div>
                
                <h3 style={{ margin: '0 0 4px', color: '#F8FAFC', fontSize: '16px', fontWeight: '600' }}>
                    {user?.name || 'Loading...'}
                </h3>
                <p style={{ margin: '0 0 16px', color: '#94A3B8', fontSize: '13px', textAlign: 'center' }}>
                    {user?.role || 'Team Member'}
                </p>

                <div style={{ width: '100%', height: '1px', backgroundColor: '#334155', marginBottom: '16px' }}></div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#94A3B8' }}>Connections</span>
                        <span style={{ color: '#3B82F6', fontWeight: '600' }}>{stats.connections}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#94A3B8' }}>Posts</span>
                        <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{stats.posts}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#94A3B8' }}>Team Size</span>
                        <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{stats.teamSize}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedProfileCard;
