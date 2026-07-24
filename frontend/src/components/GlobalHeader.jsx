import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Search, Bell, Calendar, RefreshCw, Grid, LogOut, User } from 'lucide-react';
import './GlobalHeader.css';

const GlobalHeader = ({ onRefresh, onOpenModuleLauncher, onOpenCommandCenter }) => {
    const { user, logout } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const navigate = useNavigate();
    
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
    const [timezone, setTimezone] = useState(localStorage.getItem('timezone') || 'Asia/Kolkata');
    const profileRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        const handleSettingsUpdate = () => {
            setDateFormat(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
            setTimezone(localStorage.getItem('timezone') || 'Asia/Kolkata');
        };
        window.addEventListener('settingsUpdated', handleSettingsUpdate);
        
        return () => {
            clearInterval(timer);
            window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        };
    }, []);

    // Close profile menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'AU';
    const isSales = user?.role?.toLowerCase() === 'sales';
    const role = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Admin';

    // Deterministic gradient based on name so avatar always has a rich color
    const AVATAR_GRADIENTS = [
        'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'linear-gradient(135deg, #3b82f6, #06b6d4)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #f59e0b, #ef4444)',
        'linear-gradient(135deg, #ec4899, #8b5cf6)',
        'linear-gradient(135deg, #14b8a6, #3b82f6)',
        'linear-gradient(135deg, #f97316, #ef4444)',
    ];
    const avatarGradient = AVATAR_GRADIENTS[(initials.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length];

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        } else {
            window.location.reload();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatCurrentDate = () => {
        if (dateFormat === 'YYYY-MM-DD') {
            return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(currentTime);
        }
        if (dateFormat === 'MM/DD/YYYY') {
            return new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(currentTime);
        }
        if (dateFormat === 'DD/MM/YYYY') {
            return new Intl.DateTimeFormat('en-GB', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(currentTime);
        }
        return currentTime.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <header className="rd-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e2e8f0', margin: 0, width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                    className="rd-icon-btn" 
                    onClick={onOpenModuleLauncher} 
                    title="Modules"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <Grid size={18} color="#64748b" />
                </button>
                <div className="rd-search-bar">
                    <Search size={16} color="#94a3b8" />
                    <input type="text" className="rd-search-input" placeholder="Search..." />
                </div>
            </div>
            
            <div className="rd-header-actions">
                <div className="rd-datetime-pill">
                    <Calendar size={16} />
                    {formatCurrentDate()}
                    <span style={{ color: '#fda4af', margin: '0 4px' }}>·</span>
                    {currentTime.toLocaleTimeString('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
                
                <button className="rd-icon-btn" onClick={handleRefresh} title="Refresh">
                    <RefreshCw size={18} />
                </button>
                
                <button className="rd-icon-btn" onClick={() => navigate('/notifications')} title="Notifications">
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="rd-badge">{unreadCount}</span>}
                </button>
                
                <div className="rd-profile-menu-container" ref={profileRef} style={{ position: 'relative' }}>
                    <div className="rd-profile-menu" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} style={{ cursor: 'pointer' }}>
                        <div className="rd-avatar" style={{ background: avatarGradient }}>{initials}</div>
                        <div className="rd-profile-info">
                            <span className="rd-profile-name">{user?.name || 'Admin User'}</span>
                            <span className="rd-profile-role" style={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>
                                {role} <span className="rd-dot"></span>
                            </span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4}}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>

                    {isProfileMenuOpen && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            right: '0', 
                            marginTop: '8px',
                            background: '#fff', 
                            borderRadius: '0px', 
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e2e8f0',
                            width: '240px',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="rd-avatar" style={{ width: '40px', height: '40px', fontSize: '16px', background: avatarGradient }}>{initials}</div>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{user?.name || 'Admin User'}</div>
                                    <div style={{ color: '#64748b', fontSize: '12px' }}>{user?.email || 'admin@smtbms.com'}</div>
                                </div>
                            </div>
                            <div style={{ padding: '8px' }}>
                                <div 
                                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '0px', fontSize: '14px', color: '#475569' }}
                                    onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <User size={16} /> My Profile
                                </div>
                                <div 
                                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '0px', fontSize: '14px', color: '#ef4444', marginTop: '4px' }}
                                    onClick={handleLogout}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={16} /> Logout
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default GlobalHeader;
