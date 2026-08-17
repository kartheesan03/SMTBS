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
            background: 'linear-gradient(180deg, #1A2436 0%, #161F32 100%)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '16px'
        }}>
            {/* Cover Photo Area (Mock) */}
            <div style={{
                height: '60px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(59, 130, 246, 0.15) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
            }}></div>
            
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                    marginTop: '-28px', 
                    marginBottom: '12px', 
                    borderRadius: '50%', 
                    padding: '3px',
                    background: '#1A2436',
                    display: 'inline-block'
                }}>
                    <Avatar user={user} size={64} />
                </div>
                
                <h3 style={{ margin: '0 0 4px', color: '#F8FAFC', fontSize: '15px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                    {user?.name || 'Loading...'}
                </h3>
                <p style={{ margin: '0 0 20px', color: '#94A3B8', fontSize: '13px', textAlign: 'center', fontWeight: '400' }}>
                    {user?.role || 'Team Member'}
                </p>

                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', marginBottom: '16px' }}></div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '500' }}>Connections</span>
                        <span style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: '600' }}>{stats.connections}</span>
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '500' }}>Posts</span>
                        <span style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: '600' }}>{stats.posts}</span>
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '500' }}>Team</span>
                        <span style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: '600' }}>{stats.teamSize}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedProfileCard;
