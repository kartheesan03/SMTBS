import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { AriaContext } from '../context/AriaContext';
import * as Icons from 'lucide-react';
import API from '../api/axios';
import './FarmakuSidebar.css';

const SECTIONS_CONFIG = [
    {
        label: 'WORKSPACE',
        items: ['Dashboard', 'Tasks & Projects', 'Company Feed']
    },
    {
        label: 'OPERATIONS',
        items: ['Material Tracking', 'ERP', 'CRM', 'Financial Operations']
    },
    {
        label: 'PEOPLE',
        items: ['HRMS', 'Attendance']
    },
    {
        label: 'SYSTEM',
        items: [] // Catch-all for others
    }
];

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

    const renderIcon = (iconName) => {
        const IconComponent = Icons[iconName] || Icons.Circle;
        return (
            <div className="icon-wrapper">
                <IconComponent />
            </div>
        );
    };

    const renderNavItem = (item, index, extraProps = {}) => {
        const hasChildren = item.children && item.children.length > 0;
        const leafActive = isParentActive(item.children || []) || isLeafActive(item.path);
        const isExpanded = expandedMenu === item.title;
        const isNotifications = item.path === '/notifications' || item.title === 'Notifications';

        if (hasChildren) {
            return (
                <li key={index ?? item.title}>
                    <div 
                        className={`farmaku-nav-item ${leafActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => toggleMenu(item.title)}
                        {...extraProps}
                    >
                        {renderIcon(item.icon)}
                        <span>{item.title}</span>
                        <Icons.ChevronRight className="chevron-icon" />
                    </div>
                    {isExpanded && (
                        <div className="farmaku-submenu">
                            {item.children.map((child, cIdx) => (
                                <NavLink
                                    key={cIdx}
                                    to={child.path || '#'}
                                    className={() => `farmaku-subnav-item ${isLeafActive(child.path) ? 'active' : ''}`}
                                >
                                    {child.title}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </li>
            );
        }

        const targetPath = item.path || '#';

        return (
            <li key={index ?? item.title}>
                <NavLink
                    to={targetPath}
                    className={() => `farmaku-nav-item${leafActive ? ' active' : ''}`}
                    {...extraProps}
                >
                    {renderIcon(item.icon)}
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

    // Group navigation items based on SECTIONS_CONFIG
    const groupedNavigation = useMemo(() => {
        const groups = {
            WORKSPACE: [],
            OPERATIONS: [],
            PEOPLE: [],
            SYSTEM: []
        };

        const categorizedTitles = new Set();

        navigation.forEach(item => {
            if (item.title === 'Settings') return; // Handled separately if needed, or put in SYSTEM
            
            let placed = false;
            for (const section of SECTIONS_CONFIG) {
                if (section.items.includes(item.title)) {
                    groups[section.label].push(item);
                    categorizedTitles.add(item.title);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                groups['SYSTEM'].push(item);
            }
        });

        return groups;
    }, [navigation]);

    return (
        <aside className="farmaku-sidebar">
            {/* ── Logo Header ── */}
            <div className="farmaku-sidebar-header">
                <div className="farmaku-logo-container">
                    <div className="farmaku-logo-icon">
                        <Icons.Layers />
                    </div>
                    <div className="farmaku-logo-text-wrapper">
                        <span className="farmaku-logo-text">SMTBMS</span>
                        <span className="farmaku-logo-subtitle">Smart Material Tracking</span>
                    </div>
                </div>
            </div>

            {/* ── Nav Content ── */}
            <div className="farmaku-sidebar-content">
                {loading ? (
                    <div style={{ padding: '20px 10px', color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>
                        Loading menu…
                    </div>
                ) : (
                    <>
                        {SECTIONS_CONFIG.map(section => {
                            const items = groupedNavigation[section.label];
                            // For SYSTEM section, we inject static items if they are not dynamically provided
                            if (section.label === 'SYSTEM') {
                                return (
                                    <div key={section.label} className="farmaku-nav-section">
                                        <div className="farmaku-section-label">{section.label}</div>
                                        <ul className="farmaku-nav-list">
                                            {items.map((item, index) => renderNavItem(item, `sys-${index}`))}
                                            
                                            {!dynamicPaths.has('/notifications') && (
                                                <li>
                                                    <NavLink to="/notifications" end className={() => `farmaku-nav-item${isLeafActive('/notifications') ? ' active' : ''}`}>
                                                        <div className="icon-wrapper"><Icons.Bell /></div>
                                                        <span>Notifications</span>
                                                        {unreadCount > 0 && (
                                                            <span className="farmaku-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                                                        )}
                                                    </NavLink>
                                                </li>
                                            )}

                                            {!dynamicPaths.has('/support') && (
                                                <li>
                                                    <NavLink to="/support" end className={() => `farmaku-nav-item${isLeafActive('/support') ? ' active' : ''}`}>
                                                        <div className="icon-wrapper"><Icons.HelpCircle /></div>
                                                        <span>Help &amp; Support</span>
                                                    </NavLink>
                                                </li>
                                            )}


                                            <li>
                                                <div className="farmaku-nav-item" onClick={() => openAria()} role="button">
                                                    <div className="icon-wrapper"><Icons.Bot /></div>
                                                    <span>AI Assistant</span>
                                                </div>
                                            </li>

                                            {!loading && navigation.find((item) => item.title === 'Settings') &&
                                                renderNavItem(navigation.find((item) => item.title === 'Settings'), 'settings')}
                                        </ul>
                                    </div>
                                );
                            }

                            if (items && items.length > 0) {
                                return (
                                    <div key={section.label} className="farmaku-nav-section">
                                        <div className="farmaku-section-label">{section.label}</div>
                                        <ul className="farmaku-nav-list">
                                            {items.map((item, index) => renderNavItem(item, `${section.label}-${index}`))}
                                        </ul>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="farmaku-sidebar-footer">
                <div className="farmaku-logout-item" onClick={logout}>
                    <Icons.LogOut />
                    <span>Logout</span>
                </div>
            </div>
        </aside>
    );
};

export default FarmakuSidebar;