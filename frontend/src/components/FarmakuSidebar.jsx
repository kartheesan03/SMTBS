import React, { useState, useContext, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import * as Icons from 'lucide-react';
import API from '../api/axios';
import { hrmsMenuItems, hasHrmsPermission } from '../config/hrmsMenuConfig';
import './FarmakuSidebar.css';

// Map module titles → icon color class for visual distinction
const MODULE_COLORS = {
    // ── Generic / Admin modules ──────────────────────────────────────────
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
    // ── HR-specific modules ───────────────────────────────────────────────
    'Employee Management': 'nav-icon-purple',
    'Leave Management':    'nav-icon-yellow',
    'Payroll':             'nav-icon-teal',
    'Performance':         'nav-icon-green',
    'Recruitment':         'nav-icon-blue',
    'Training':            'nav-icon-cyan',
    'Reports':             'nav-icon-indigo',
    'Holiday Calendar':    'nav-icon-rose',
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
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState('');
    const [navigation, setNavigation] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Single source of truth: exact path match ──────────────────────────
    const currentPath = location.pathname;

    // Returns true only if this leaf item's path exactly matches the current URL
    const isLeafActive = useCallback(
        (path) => path != null && currentPath === path,
        [currentPath]
    );

    // Returns true if any child of a collapsible parent is currently active
    const isParentActive = useCallback(
        (children = []) => children.some((c) => currentPath === c.path),
        [currentPath]
    );

    // Auto-expand the parent whose child is currently active (runs on nav load & route change)
    useEffect(() => {
        for (const item of navigation) {
            if (item.children && isParentActive(item.children)) {
                setExpandedMenu(item.title);
                return;
            }
        }
        // Do NOT collapse manually-expanded menus on route change — only auto-open
    }, [navigation, currentPath, isParentActive]);

    useEffect(() => {
        const fetchNavigation = async () => {
            try {
                const response = await API.get(`/system/navigation?t=${Date.now()}`);
                let navData = response.data;
                
                // Dynamically inject the HRMS block if the user has permissions for it
                const allowedHrmsChildren = hrmsMenuItems
                    .filter(item => hasHrmsPermission(user, item.permission))
                    .map(item => ({
                        title: item.label,
                        path: item.path,
                        // Not mapping 'icon' since sub-items in FarmakuSidebar don't render individual icons
                    }));

                if (allowedHrmsChildren.length > 0) {
                    const hrmsNode = {
                        title: 'HRMS',
                        icon: 'Users',
                        permission: 'view_hrms', // or any placeholder, it's just used for rendering
                        children: allowedHrmsChildren
                    };
                    
                    // Try to insert HRMS after Attendance. If not found, try Dashboard, then just push it.
                    let inserted = false;
                    for (let i = 0; i < navData.length; i++) {
                        if (navData[i].title === 'Attendance') {
                            navData.splice(i + 1, 0, hrmsNode);
                            inserted = true;
                            break;
                        }
                    }
                    if (!inserted) {
                        for (let i = 0; i < navData.length; i++) {
                            if (navData[i].title === 'Dashboard') {
                                navData.splice(i + 1, 0, hrmsNode);
                                inserted = true;
                                break;
                            }
                        }
                    }
                    if (!inserted) {
                        navData.push(hrmsNode);
                    }
                }
                
                setNavigation(navData);
            } catch (error) {
                console.error('Failed to load navigation:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNavigation();
    }, []);

    const toggleMenu = (menuTitle) => {
        setExpandedMenu((prev) => (prev === menuTitle ? '' : menuTitle));
    };

    const renderIcon = (iconName, title) => {
        const IconComponent = Icons[iconName] || Icons.Circle;
        const colorClass = MODULE_COLORS[title] || 'nav-icon-white';
        return <IconComponent size={18} className={colorClass} />;
    };

    const renderNavItem = (item, index) => {
        if (item.children && item.children.length > 0) {
            // ── Collapsible parent ──────────────────────────────────────
            const isExpanded = expandedMenu === item.title;
            const hasActiveChild = isParentActive(item.children);

            return (
                <li key={index ?? item.title} className="farmaku-nav-list-item">
                    {/* Parent row — NEVER gets .active, only .expanded and optionally .has-active-child */}
                    <div
                        className={[
                            'farmaku-nav-item',
                            isExpanded ? 'expanded' : '',
                            hasActiveChild ? 'has-active-child active' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={() => toggleMenu(item.title)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleMenu(item.title)}
                    >
                        {renderIcon(item.icon, item.title)}
                        <span>{item.title}</span>
                        {isExpanded ? (
                            <Icons.ChevronDown size={14} />
                        ) : (
                            <Icons.ChevronRight size={14} />
                        )}
                    </div>

                    {/* Submenu */}
                    <div className={`farmaku-submenu-wrapper ${isExpanded ? 'expanded' : ''}`}>
                        <div className="farmaku-submenu">
                            {item.children.map((child, cIndex) => {
                                const childActive = isLeafActive(child.path);
                                return (
                                    <NavLink
                                        key={cIndex}
                                        to={child.path}
                                        end
                                        className={({ isActive }) => `farmaku-subnav-item${childActive ? ' active' : ''}`}
                                    >
                                        <span>{child.title}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </li>
            );
        }

        // ── Leaf item ───────────────────────────────────────────────────
        const leafActive = isLeafActive(item.path);
        const isNotifications = item.path === '/notifications';
        return (
            <li key={index ?? item.title} className="farmaku-nav-list-item">
                <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) => `farmaku-nav-item${leafActive ? ' active' : ''}`}
                >
                    {renderIcon(item.icon, item.title)}
                    <span>{item.title}</span>
                    {isNotifications && unreadCount > 0 && (
                        <span className="farmaku-badge">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </NavLink>
            </li>
        );
    };

    // Paths already covered by the dynamic navigation list
    const dynamicPaths = new Set(
        navigation.flatMap((item) =>
            item.children ? item.children.map((c) => c.path) : [item.path]
        )
    );

    return (
        <aside className="farmaku-sidebar">
            {/* ── Logo Header ── */}
            <div className="farmaku-sidebar-header">
                <div className="farmaku-logo-container">
                    <div className="farmaku-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" fill="currentColor" opacity="0.9"/>
                            <polyline points="2 14 12 20.5 22 14" opacity="0.6"/>
                            <polyline points="2 11 12 17.5 22 11" opacity="0.35"/>
                        </svg>
                    </div>
                    <div className="farmaku-logo-text-wrapper">
                        <span className="farmaku-logo-text" style={{ fontSize: '15px' }}>SMTBMS</span>
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
                            .filter((item) => item.title !== 'Settings')
                            .map((item, index) => renderNavItem(item, index))
                    )}

                    {/* Divider */}
                    <div className="farmaku-divider" style={{ margin: '8px 0' }} />

                    {/* Notifications — only if not already in dynamic nav */}
                    {!dynamicPaths.has('/notifications') && (
                        <li>
                            <NavLink
                                to="/notifications"
                                end
                                className={({ isActive }) => `farmaku-nav-item${isLeafActive('/notifications') ? ' active' : ''}`}
                            >
                                <Icons.Bell size={18} className="nav-icon-rose" />
                                <span>Notifications</span>
                                {unreadCount > 0 ? (
                                    <span className="farmaku-badge">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                ) : (
                                    <Icons.ChevronRight size={14} />
                                )}
                            </NavLink>
                        </li>
                    )}

                    {/* Notifications badge overlay when it IS in dynamic nav (unread count) */}
                    {dynamicPaths.has('/notifications') && unreadCount > 0 && (() => {
                        // Find the rendered notifications item and inject badge — handled in renderNavItem via unreadCount
                        return null;
                    })()}

                    {/* Help & Support — only if not already in dynamic nav */}
                    {!dynamicPaths.has('/support') && (
                        <li>
                            <NavLink
                                to="/support"
                                end
                                className={({ isActive }) => `farmaku-nav-item${isLeafActive('/support') ? ' active' : ''}`}
                            >
                                <Icons.HelpCircle size={18} className="nav-icon-white" />
                                <span>Help &amp; Support</span>
                                <Icons.ChevronRight size={14} />
                            </NavLink>
                        </li>
                    )}

                    {/* Settings (if available in nav) */}
                    {!loading && navigation.find((item) => item.title === 'Settings') &&
                        renderNavItem(navigation.find((item) => item.title === 'Settings'), 'settings')}

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
