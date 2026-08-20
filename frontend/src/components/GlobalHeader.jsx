import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import { Search, Bell, Calendar, RefreshCw, Grid, LogOut, User, Sun, Moon, Menu, CheckCircle2 } from 'lucide-react';
import CommandPalette from './CommandPalette';
import './GlobalHeader.css';
const GlobalHeader = ({ onRefresh, onOpenModuleLauncher, onOpenCommandCenter }) => {
    const { user, logout } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
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
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        const handleOpenPalette = () => {
            setIsCommandPaletteOpen(true);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('open-command-palette', handleOpenPalette);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('open-command-palette', handleOpenPalette);
        };
    }, []);
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'AU';
    const isSales = user?.role?.toLowerCase() === 'sales';
    const role = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Admin';
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
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <header className="rd-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e2e8f0', margin: 0, width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', padding: '12px 24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <button 
                    className="rd-icon-btn" 
                    onClick={onOpenModuleLauncher} 
                    title="Menu"
                    style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                    <Menu size={24} color="#64748b" />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                        {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Admin'}! 👋
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', marginTop: '4px' }}>
                        Welcome back! You are doing great today.
                    </div>
                </div>
            </div>
            
            <div className="rd-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', gap: '6px', whiteSpace: 'nowrap' }}>
                    <CheckCircle2 size={14} /> All Systems Operational
                </div>

                <div className="rd-datetime-pill" style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <Calendar size={14} />
                    {currentTime.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    <span style={{ margin: '0 4px' }}>·</span>
                    {currentTime.toLocaleTimeString('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
                
                <div className="rd-divider" style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
                
                <div className="rd-search-bar" onClick={() => setIsCommandPaletteOpen(true)} style={{ cursor: 'pointer', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Search...</span>
                </div>

                <button className="rd-icon-btn" onClick={() => navigate('/notifications')} title="Notifications" style={{ position: 'relative', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={18} color="#64748b" />
                    {unreadCount > 0 && <span className="rd-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>{unreadCount}</span>}
                </button>
                
                <div className="rd-profile-menu-container" ref={profileRef} style={{ position: 'relative' }}>
                    <div className="rd-profile-menu" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="rd-avatar" style={{ background: avatarGradient, width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{initials}</div>
                    </div>
                    {isProfileMenuOpen && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            right: '0', 
                            marginTop: '8px',
                            background: '#fff', 
                            borderRadius: '8px', 
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e2e8f0',
                            width: '240px',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="rd-avatar" style={{ width: '40px', height: '40px', fontSize: '16px', background: avatarGradient, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{initials}</div>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{user?.name || 'Admin User'}</div>
                                    <div style={{ color: '#64748b', fontSize: '12px' }}>{user?.email || 'admin@smtbms.com'}</div>
                                </div>
                            </div>
                            <div style={{ padding: '8px' }}>
                                <div 
                                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', color: '#475569' }}
                                    onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <User size={16} /> My Profile
                                </div>
                                <div 
                                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', color: '#ef4444', marginTop: '4px' }}
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
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
        </header>
    );
};
export default GlobalHeader;
