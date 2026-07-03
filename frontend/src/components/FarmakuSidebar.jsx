import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import * as Icons from 'lucide-react';
import API from '../api/axios';
import { Crown } from 'lucide-react';
import './FarmakuSidebar.css';
import './FarmakuSidebar.css';

// Map module titles → icon color class for visual distinction
const MODULE_COLORS = {
    'Dashboard':           'nav-icon-blue',
    'Attendance':          'nav-icon-green',
    'Material Tracking':   'nav-icon-orange',
    'HRMS':                'nav-icon-purple',
    'ERP':                 'nav-icon-cyan',
    'CRM':                 'nav-icon-rose',
    'Tasks & Projects':    'nav-icon-yellow',
    'Financial Operations':'nav-icon-teal',
    'Reports & Analytics': 'nav-icon-indigo',
    'Notifications':       'nav-icon-rose',
    'Help & Support':      'nav-icon-white',
    'Settings':            'nav-icon-white',
};

// Get user initials for avatar
const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name[0] || 'U').toUpperCase();
};

const FarmakuSidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState('');
    const [navigation, setNavigation] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNavigation = async () => {
            try {
                const response = await API.get('/system/navigation');
                setNavigation(response.data);
            } catch (error) {
                console.error("Failed to load navigation:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNavigation();
    }, []);

    const toggleMenu = (menu) => {
        if (expandedMenu === menu) {
            setExpandedMenu('');
        } else {
            setExpandedMenu(menu);
        }
    };

    const isPathActive = (navItem) => {
        if (navItem.path && location.pathname === navItem.path) return true;
        if (navItem.children) {
            return navItem.children.some(child => location.pathname === child.path || location.pathname.startsWith(child.path + '/'));
        }
        return false;
    };

    const renderIcon = (iconName, title) => {
        const IconComponent = Icons[iconName] || Icons.Circle;
        const colorClass = MODULE_COLORS[title] || 'nav-icon-white';
        return <IconComponent size={18} className={colorClass} />;
    };

    const renderNavItem = (item, index) => (
        <li key={index || item.title}>
            {item.children ? (
                <>
                    <div
                        className={`farmaku-nav-item ${isPathActive(item) ? 'active' : ''}`}
                        onClick={() => toggleMenu(item.title)}
                    >
                        {renderIcon(item.icon, item.title)}
                        <span>{item.title}</span>
                        {expandedMenu === item.title
                            ? <Icons.ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                            : <Icons.ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                        }
                    </div>
                    {expandedMenu === item.title && (
                        <div className="farmaku-submenu">
                            {item.children.map((child, cIndex) => (
                                <NavLink
                                    key={cIndex}
                                    to={child.path}
                                    className={({ isActive }) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}
                                >
                                    {child.title}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <NavLink
                    to={item.path}
                    className={({ isActive }) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}
                >
                    {renderIcon(item.icon, item.title)}
                    <span>{item.title}</span>
                    <Icons.ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                </NavLink>
            )}
        </li>
    );

    return (
        <aside className="farmaku-sidebar">
            {/* ── Logo Header ── */}
            <div className="farmaku-sidebar-header">
                <div className="farmaku-logo-container">
                    <div className="farmaku-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l8 4.5v9L12 22l-8-4.5v-9L12 2z" opacity="0.3"/>
                            <path d="M9 9l3-2 3 2v4l-3 2-3-2z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="farmaku-logo-text-wrapper">
                        <span className="farmaku-logo-text">SMTBMS</span>
                        <span className="farmaku-logo-subtext">Smart Material Tracking &<br/>Business Management System</span>
                    </div>
                </div>
            </div>

            {/* ── Nav Content ── */}
            <div className="farmaku-sidebar-content">
                <ul className="farmaku-nav-list">
                    {loading ? (
                        <div style={{ padding: '20px 10px', color: 'rgba(148,163,184,0.4)', fontSize: 13 }}>
                            Loading menu…
                        </div>
                    ) : (
                        navigation
                            .filter(item => item.title !== 'Settings')
                            .map((item, index) => renderNavItem(item, index))
                    )}

                    {/* Divider */}
                    <div className="farmaku-divider" style={{ margin: '8px 0' }} />

                    {/* Notifications */}
                    <li>
                        <NavLink to="/notifications" className={({ isActive }) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <Icons.Bell size={18} className="nav-icon-rose" />
                            <span>Notifications</span>
                            {unreadCount > 0 ? (
                                <span className="farmaku-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            ) : (
                                <Icons.ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                            )}
                        </NavLink>
                    </li>

                    {/* Help & Support */}
                    <li>
                        <NavLink to="/support" className={({ isActive }) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <Icons.HelpCircle size={18} className="nav-icon-white" />
                            <span>Help &amp; Support</span>
                            <Icons.ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                        </NavLink>
                    </li>

                    {/* Settings (if available) */}
                    {!loading && navigation.find(item => item.title === 'Settings') && (
                        renderNavItem(navigation.find(item => item.title === 'Settings'), 'settings')
                    )}

                    <div className="farmaku-divider" style={{ margin: '8px 0' }} />

                    {/* Logout */}
                    <li>
                        <div className="farmaku-logout-item" onClick={logout}>
                            <Icons.LogOut size={18} />
                            <span>Logout</span>
                        </div>
                    </li>
                </ul>
            </div>

        </aside>
    );
};

export default FarmakuSidebar;
