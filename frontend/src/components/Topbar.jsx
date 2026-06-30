import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, RefreshCw, Search, Grid, Plus, LogOut, User, Settings as SettingsIcon, ArrowLeft, X, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmtbmsLogo from './SmtbmsLogo';
import UserAvatar from './UserAvatar';

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
                <div className="topbar-brand" onClick={() => navigate('/')}>
                    <SmtbmsLogo size={26} textColor="#1e293b" />
                </div>
                
                <button className="apps-toggle-btn" onClick={onOpenModuleLauncher} title="Modules">
                    <Grid size={20} />
                </button>
            </div>

            <div className="topbar-center">
                <div className="search-bar" onClick={onOpenCommandCenter}>
                    <Search size={18} className="search-icon" />
                    <span className="search-placeholder">Search materials, PO, vendors...</span>
                   
                </div>
            </div>

            <div className="topbar-right">
                <div className="datetime-pill">
                    <Calendar size={14} />
                    <span className="date-text">{formattedDate}</span>
                    <span className="time-text">{formattedTime}</span>
                </div>

                <button className="quick-create-btn" onClick={() => navigate('/orders/select-type')}>
                    <Plus size={16} /> New
                </button>

                <div className="topbar-divider"></div>

                <button className="icon-btn" title="Refresh">
                    <RefreshCw size={18} />
                </button>

                <button className="icon-btn notification-btn" onClick={() => navigate('/notifications')}>
                    <Bell size={18} />
                    <span className="badge">4</span>
                </button>

                <div className="profile-container" ref={profileRef}>
                    <div className="profile-dropdown" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                        <div className="profile-avatar">
                            <UserAvatar
                                src={user?.picture || user?.avatar}
                                name={user?.name || 'System Admin'}
                                size={36}
                            />
                        </div>
                        <div className="profile-info">
                            <span className="name">{user?.name || 'System Admin'}</span>
                            <span className="role">{user?.role || 'Super Admin'} <span className="status-dot"></span></span>
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

            <style jsx="true">{`
                .topbar {
                    height: 72px;
                    background: #ffffff;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    position: sticky;
                    top: 0;
                    z-index: 40;
                }

                .topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .topbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                }

                .brand-logo-tb {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #e11d48, #be123c);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 800;
                    font-size: 16px;
                }

                .topbar-brand h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    color: #0f172a;
                }

                .apps-toggle-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: #f1f5f9;
                    color: #475569;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .apps-toggle-btn:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }

                .topbar-center {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 0 16px;
                    width: 400px;
                    height: 40px;
                    position: relative;
                    cursor: text;
                    transition: all 0.2s;
                }

                .search-bar:hover {
                    border-color: #cbd5e1;
                    background: #ffffff;
                }

                .search-icon {
                    color: #94a3b8;
                    margin-right: 12px;
                }

                .search-placeholder {
                    flex: 1;
                    font-size: 14px;
                    color: #94a3b8;
                }

                .shortcut {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    padding: 2px 6px;
                    font-size: 12px;
                    color: #ef4444;
                    font-weight: 600;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .topbar-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .topbar-divider {
                    width: 1px;
                    height: 24px;
                    background: #e2e8f0;
                    margin: 0 8px;
                }

                .quick-create-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #e11d48;
                    color: white;
                    border: none;
                    height: 40px;
                    padding: 0 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .quick-create-btn:hover {
                    background: #be123c;
                }

                .datetime-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(244, 63, 94, 0.08);
                    padding: 8px 16px;
                    border-radius: 20px;
                    color: #e11d48;
                    font-weight: 600;
                    font-size: 13px;
                }

                .date-text {
                    color: #475569;
                }

                .icon-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }
                .icon-btn:hover {
                    background: #f8fafc;
                    color: #0f172a;
                }

                .notification-btn .badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #ffffff;
                }

                .profile-container {
                    position: relative;
                }

                .profile-dropdown {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 4px 12px 4px 4px;
                    border: 1px solid #fecdd3;
                    border-radius: 30px;
                    cursor: pointer;
                    background: #fff1f2;
                    transition: all 0.2s;
                }
                .profile-dropdown:hover {
                    background: #ffe4e6;
                }

                .profile-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #e11d48;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                }

                .profile-info {
                    display: flex;
                    flex-direction: column;
                }

                .profile-info .name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.2;
                }

                .profile-info .role {
                    font-size: 11px;
                    font-weight: 700;
                    color: #e11d48;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                }

                /* Profile Menu Dropdown */
                .profile-menu {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: 0;
                    width: 260px;
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
                    z-index: 50;
                    overflow: hidden;
                    animation: slideUpFade 0.2s ease;
                }

                .pm-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: #f8fafc;
                    border-bottom: 1px solid #f1f5f9;
                }

                .pm-header img {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .pm-header-info {
                    display: flex;
                    flex-direction: column;
                }

                .pm-name {
                    font-weight: 700;
                    font-size: 15px;
                    color: #0f172a;
                }

                .pm-email {
                    font-size: 13px;
                    color: #64748b;
                }

                .pm-body {
                    padding: 8px 0;
                }

                .pm-body button {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 12px 20px;
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    color: #475569;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-align: left;
                }

                .pm-body button:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                .pm-footer {
                    padding: 8px 0;
                    border-top: 1px solid #f1f5f9;
                }

                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 12px 20px;
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    color: #e11d48;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-align: left;
                }

                .logout-btn:hover {
                    background: #fff1f2;
                }

                /* Modern Logout Modal */
                .logout-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    animation: fadeIn 0.15s ease-out;
                }

                .logout-modal-modern {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90%;
                    max-width: 420px;
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 32px;
                    z-index: 1001;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                    animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .logout-close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .logout-close-btn:hover {
                    background: #dbeafe;
                    color: #0f172a;
                }

                .logout-modal-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .logout-icon-box {
                    width: 52px;
                    height: 52px;
                    background: #fff1f2;
                    border: 1px solid #fecdd3;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logout-header-text h3 {
                    margin: 0 0 4px 0;
                    font-size: 20px;
                    color: #0f172a;
                    font-weight: 800;
                }

                .logout-header-text p {
                    margin: 0;
                    color: #64748b;
                    font-size: 13px;
                }

                .logout-divider {
                    height: 1px;
                    background-color: #f1f5f9;
                    margin: 24px 0;
                }

                .logout-user-card {
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                }

                .logout-user-card img {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    object-fit: cover;
                    margin-right: 12px;
                }

                .luc-info {
                    flex-grow: 1;
                }

                .luc-info h4 {
                    margin: 0 0 2px 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                }

                .luc-info p {
                    margin: 0;
                    font-size: 12px;
                    color: #64748b;
                }

                .luc-status-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #10b981;
                    border-radius: 50%;
                }

                .logout-actions-modern {
                    display: flex;
                    gap: 12px;
                }

                .btn-stay, .btn-signout {
                    flex: 1;
                    height: 48px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-stay {
                    background: transparent;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                }

                .btn-stay:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                    color: #0f172a;
                }

                .btn-signout {
                    background: #be123c;
                    border: none;
                    color: white;
                }

                .btn-signout:hover {
                    background: #9f1239;
                }

                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes scaleUp {
                    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                @media (max-width: 768px) {
                    .search-bar, .datetime-pill {
                        display: none;
                    }
                }
            `}</style>
        </header>
    );
};

export default Topbar;
