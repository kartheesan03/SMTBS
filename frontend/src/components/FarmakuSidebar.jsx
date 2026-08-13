import React, { useState, useContext, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { AriaContext } from '../context/AriaContext';
import * as Icons from 'lucide-react';
import API from '../api/axios';
import './FarmakuSidebar.css';

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
    'Audit Logs':          'nav-icon-rose',
    'Employee Management': 'nav-icon-purple',
    'Leave Management':    'nav-icon-yellow',
    'Payroll':             'nav-icon-teal',
    'Performance':         'nav-icon-green',
    'Recruitment':         'nav-icon-blue',
    'Training':            'nav-icon-cyan',
    'Reports':             'nav-icon-indigo',
    'Holiday Calendar':    'nav-icon-rose',
};

const FarmakuSidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const { openAria } = useContext(AriaContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState('');
    const [navigation, setNavigation] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentPath = location.pathname;

    const isLeafActive = useCallback(
        (path) => path != null && currentPath === path,
        [currentPath]
    );
    const isParentActive = useCallback(
        (children = []) => children.some((c) => currentPath === c.path),
        [currentPath]
    );

    useEffect(() => {
        for (const item of navigation) {
            if (item.children && isParentActive(item.children)) {
                setExpandedMenu(item.title);
                return;
            }
        }
    }, [navigation, currentPath, isParentActive]);

    useEffect(() => {
        const fetchNavigation = async () => {
            try {
                const response = await API.get(`/system/navigation?t=${Date.now()}`);
                setNavigation(response.data);
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
            const isExpanded = expandedMenu === item.title;
            const hasActiveChild = isParentActive(item.children);
            return (
                <li key={index ?? item.title} className="farmaku-nav-list-item">
                    <div
                        className={[
                            'farmaku-nav-item',
                            isExpanded ? 'expanded' : '',
                            hasActiveChild ? 'has-active-child active' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => toggleMenu(item.title)}
                        role="button"
                    >
                        {renderIcon(item.icon, item.title)}
                        <span>{item.title}</span>
                        {isExpanded ? <Icons.ChevronDown size={14} /> : <Icons.ChevronRight size={14} />}
                    </div>
                    <div className={`farmaku-submenu-wrapper ${isExpanded ? 'expanded' : ''}`}>
                        <div className="farmaku-submenu">
                            {item.children.map((child, cIndex) => {
                                const childActive = isLeafActive(child.path);
                                return (
                                    <NavLink
                                        key={cIndex}
                                        to={child.path}
                                        end
                                        className={() => `farmaku-subnav-item${childActive ? ' active' : ''}`}
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

        const leafActive = isLeafActive(item.path);
        const isNotifications = item.path === '/notifications';
        return (
            <li key={index ?? item.title} className="farmaku-nav-list-item">
                <NavLink
                    to={item.path}
                    end
                    className={() => `farmaku-nav-item${leafActive ? ' active' : ''}`}
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

                    <div className="farmaku-divider" style={{ margin: '8px 0' }} />

                    {/* Notifications */}
                    {!dynamicPaths.has('/notifications') && (
                        <li>
                            <NavLink
                                to="/notifications"
                                end
                                className={() => `farmaku-nav-item${isLeafActive('/notifications') ? ' active' : ''}`}
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

                    {/* Help & Support */}
                    {!dynamicPaths.has('/support') && (
                        <li>
                            <NavLink
                                to="/support"
                                end
                                className={() => `farmaku-nav-item${isLeafActive('/support') ? ' active' : ''}`}
                            >
                                <Icons.HelpCircle size={18} className="nav-icon-white" />
                                <span>Help &amp; Support</span>
                                <Icons.ChevronRight size={14} />
                            </NavLink>
                        </li>
                    )}

                    {/* OCR Tool */}
                    <li>
                        <NavLink
                            to="/ocr"
                            end
                            className={() => `farmaku-nav-item${isLeafActive('/ocr') ? ' active' : ''}`}
                        >
                            <Icons.Scan size={18} className="nav-icon-teal" />
                            <span>OCR Tool</span>
                            <Icons.ChevronRight size={14} />
                        </NavLink>
                    </li>

                    {/* AI Assistant — opens maximized directly */}
                    <li>
                        <div
                            className="farmaku-nav-item"
                            onClick={() => openAria(null, { maximized: true })}
                            role="button"
                        >
                            <Icons.Bot size={18} className="nav-icon-blue" />
                            <span>AI Assistant</span>
                            <Icons.ChevronRight size={14} />
                        </div>
                    </li>

                    {/* Settings */}
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