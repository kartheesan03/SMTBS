import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Menu, Search, Bell, Mail, Plus, User, LogOut, ChevronDown } from 'lucide-react';
import CommandPalette from './CommandPalette';
import './GlobalHeader.css';

const GlobalHeader = ({ onRefresh, onOpenModuleLauncher }) => {
    const { user, logout } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const navigate = useNavigate();
    
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        const handleOpenPalette = () => setIsCommandPaletteOpen(true);
        
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('open-command-palette', handleOpenPalette);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('open-command-palette', handleOpenPalette);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'U';

    return (
        <header className="bx-header">
            {/* Left: Search (acts as center/left flex) */}
            <div className="header-left">
                <button className="mobile-menu-btn" onClick={() => {
                    if (window.innerWidth <= 768) {
                        document.body.classList.toggle('sidebar-open');
                    } else if (onOpenModuleLauncher) {
                        onOpenModuleLauncher();
                    }
                }}>
                    <Menu size={20} />
                </button>
                
                <div className="header-search-bar" onClick={() => setIsCommandPaletteOpen(true)}>
                    <Search size={16} />
                    <input type="text" placeholder="Search orders, materials, employees, documents..." readOnly />
                </div>
            </div>
            
            {/* Right: Actions */}
            <div className="header-right">
                
                <div className="header-actions">
                    <button className="header-icon-btn" onClick={() => navigate('/notifications')} title="Notifications">
                        <Bell size={22} color="#475569" strokeWidth={1.5} />
                        <span className="header-badge">{unreadCount > 0 ? unreadCount : 55}</span>
                    </button>

                    <button className="header-icon-btn" title="Messages">
                        <Mail size={22} color="#475569" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="header-divider"></div>

                {/* Profile */}
                <div className="header-profile-container" ref={profileRef}>
                    <div className="header-avatar" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                        {initials}
                    </div>
                    
                    {isProfileMenuOpen && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-body">
                                <div className="dropdown-item" onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }}>
                                    <User size={16} /> View Profile
                                </div>
                                <div className="dropdown-item danger" onClick={handleLogout}>
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
