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
    const profileRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
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

    const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const handleConfirmLogout = () => {
        logout();
        navigate('/login');
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

                <button className="icon-btn notification-btn" onClick={() => navigate('/notifications')}>
                    <Bell size={18} />
                    <span className="badge">11</span>
                </button>

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
                                <p>{user?.role || 'Full Access'} · smtbms.com</p>
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
