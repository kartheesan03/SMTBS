import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, RefreshCw, Search, Menu, MessageSquare, LogOut, User, Settings as SettingsIcon, X, Calendar, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import './Topbar.css';

const Topbar = ({ onOpenModuleLauncher, onOpenCommandCenter }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close dropdowns if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const handleConfirmLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchUnreadCount = async () => {
        try {
            const { data } = await API.get('/notifications/unread-count');
            setUnreadCount(data.count || 0);
        } catch (err) {
            console.error('Error fetching unread count', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications?limit=5');
            setNotifications(data.notifications || data);
        } catch (err) {
            console.error('Error fetching notifications', err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    const toggleNotificationMenu = () => {
        setIsNotificationOpen(!isNotificationOpen);
        if (!isNotificationOpen) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.read) {
                await API.patch(`/notifications/${notif._id || notif.id}/read`);
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setIsNotificationOpen(false);
            if (notif.referenceId && notif.module === 'Orders') {
                navigate(`/orders/${notif.referenceId}`);
            } else {
                navigate('/notifications');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="menu-toggle-btn" onClick={onOpenModuleLauncher}>
                    <Menu size={22} color="#64748b" />
                </button>
            </div>

            <div className="topbar-center">
                <div className="search-bar" onClick={onOpenCommandCenter}>
                    <Search size={18} className="search-icon" />
                    <span className="search-placeholder">Search...</span>
                    <div className="search-shortcut">
                        Ctrl + K
                    </div>
                </div>
            </div>

            <div className="topbar-right">
                <div className="datetime-pill">
                    <Calendar size={14} color="#64748b" />
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                        <span className="date-text" style={{fontSize: 11, lineHeight: 1}}>{formattedDate}</span>
                        <span className="time-text" style={{fontSize: 13, lineHeight: 1.2, fontWeight: 700}}>{formattedTime}</span>
                    </div>
                </div>

                <div className="status-pill">
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>All Systems Operational</span>
                </div>

                <div className="topbar-divider"></div>

                <button className="icon-btn" title="Refresh">
                    <RefreshCw size={18} />
                </button>

                <div className="notification-container" ref={notificationRef} style={{ position: 'relative' }}>
                    <button className="icon-btn notification-btn" onClick={toggleNotificationMenu}>
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                    </button>
                    
                    {isNotificationOpen && (
                        <div className="notification-dropdown" style={{
                            position: 'absolute', top: '100%', right: '0', width: '320px', background: '#fff',
                            borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
                            zIndex: 1000, marginTop: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Notifications</h4>
                                <span style={{ fontSize: '12px', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/notifications')}>View All</span>
                            </div>
                            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                {notifications.length > 0 ? notifications.map((notif, idx) => (
                                    <div key={notif._id || notif.id || idx} onClick={() => handleNotificationClick(notif)} style={{
                                        padding: '16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                        background: notif.read ? '#fff' : '#eff6ff', display: 'flex', gap: '12px', transition: 'background 0.2s'
                                    }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.read ? 'transparent' : '#3b82f6', marginTop: '6px', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{notif.title}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4', marginBottom: '6px' }}>{notif.message}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                        No recent notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button className="icon-btn notification-btn">
                    <MessageSquare size={18} />
                    <span className="badge">2</span>
                </button>

                <div className="profile-container" ref={profileRef}>
                    <div className="profile-dropdown" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                        <div className="profile-avatar-custom">
                            KR
                        </div>
                        <div className="profile-info-custom">
                            <span className="name">Karthik Rajan</span>
                            <span className="role">ADMIN <span className="status-dot"></span></span>
                        </div>
                    </div>

                    {isProfileMenuOpen && (
                        <div className="profile-menu">
                            <div className="pm-header">
                                <UserAvatar
                                    src={user?.picture || user?.avatar}
                                    name={user?.name || 'System Admin'}
                                    size={40}
                                />
                                <div className="pm-header-info">
                                    <span className="pm-name">{user?.name || 'System Admin'}</span>
                                    <span className="pm-email">{user?.email || 'admin@smtbms.com'}</span>
                                </div>
                            </div>
                            <div className="pm-body">
                                <button onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }}>
                                    <User size={16} /> My Profile
                                </button>
                                <button onClick={() => { setIsProfileMenuOpen(false); navigate('/settings'); }}>
                                    <SettingsIcon size={16} /> Account Settings
                                </button>
                            </div>
                            <div className="pm-footer">
                                <button className="logout-btn" onClick={() => { setIsProfileMenuOpen(false); setIsLogoutModalOpen(true); }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <>
                    <div className="logout-overlay" onClick={() => setIsLogoutModalOpen(false)}></div>
                    <div className="logout-modal-modern">
                        <button className="logout-close-btn" onClick={() => setIsLogoutModalOpen(false)}>
                            <X size={16} />
                        </button>
                        <div className="logout-modal-header">
                            <div className="logout-icon-box">
                                <LogOut size={20} color="#e11d48" />
                            </div>
                            <div className="logout-header-text">
                                <h3>Sign out?</h3>
                                <p>Your session will be securely ended</p>
                            </div>
                        </div>
                        
                        <div className="logout-divider"></div>
                        
                        <div className="logout-user-card">
                            <img src={user?.picture || 'https://via.placeholder.com/40'} alt="User" />
                            <div className="luc-info">
                                <h4>{user?.name || 'Admin'}</h4>
                                <p>{user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Full Access'} · smtbms.com</p>
                            </div>
                            <div className="luc-status-dot"></div>
                        </div>
                        
                        <div className="logout-actions-modern">
                            <button className="btn-stay" onClick={() => setIsLogoutModalOpen(false)}>Stay</button>
                            <button className="btn-signout" onClick={handleConfirmLogout}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Topbar;
