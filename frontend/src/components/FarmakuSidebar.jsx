import React, { useState, useContext, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { AriaContext } from '../context/AriaContext';
import * as Icons from 'lucide-react';
import API from '../api/axios';
import './FarmakuSidebar.css';

const MODULE_COLORS = {
    'Dashboard':           'icon-bg-rose',
    'Attendance':          'icon-bg-green',
    'Material Tracking':   'icon-bg-orange',
    'HRMS':                'icon-bg-purple',
    'ERP':                 'icon-bg-cyan',
    'CRM':                 'icon-bg-rose',
    'Tasks & Projects':    'icon-bg-yellow',
    'Financial Operations':'icon-bg-teal',
    'Reports & Analytics': 'icon-bg-indigo',
    'Notifications':       'icon-bg-rose',
    'Help & Support':      'icon-bg-gray',
    'Settings':            'icon-bg-gray',
    'Audit Logs':          'icon-bg-rose',
    'Employee Management': 'icon-bg-purple',
    'Leave Management':    'icon-bg-yellow',
    'Payroll':             'icon-bg-teal',
    'Performance':         'icon-bg-green',
    'Recruitment':         'icon-bg-blue',
    'Training':            'icon-bg-cyan',
    'Reports':             'icon-bg-indigo',
    'Holiday Calendar':    'icon-bg-rose',
    'Inventory':           'icon-bg-orange',
    'Purchase':            'icon-bg-blue',
    'Vendors':             'icon-bg-cyan',
    'Sales & CRM':         'icon-bg-rose',
    'User Management':     'icon-bg-purple',
    'Backup & Restore':    'icon-bg-gray'
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
        const colorClass = MODULE_COLORS[title] || 'icon-bg-gray';
        return (
            <div className={`icon-wrapper ${colorClass}`}>
                <IconComponent />
            </div>
        );
    };

    const renderNavItem = (item, index) => {
        const hasChildren = item.children && item.children.length > 0;
        const leafActive = isParentActive(item.children || []) || isLeafActive(item.path);
        const isExpanded = expandedMenu === item.title;
        const isNotifications = item.path === '/notifications';

        if (hasChildren) {
            return (
                <li key={index ?? item.title}>
                    <div 
                        className={`farmaku-nav-item ${leafActive ? 'active' : ''}`}
                        onClick={() => toggleMenu(item.title)}
                        style={{ cursor: 'pointer' }}
                    >
                        {renderIcon(item.icon, item.title)}
                        <span>{item.title}</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                            {isExpanded ? <Icons.ChevronDown size={16} /> : <Icons.ChevronRight size={16} />}
                        </div>
                    </div>
                    {isExpanded && (
                        <div className="farmaku-submenu" style={{ paddingLeft: '40px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {item.children.map((child, cIdx) => (
                                <NavLink
                                    key={cIdx}
                                    to={child.path || '#'}
                                    className={() => `farmaku-subnav-item ${isLeafActive(child.path) ? 'active' : ''}`}
                                    style={{ fontSize: '13px', color: isLeafActive(child.path) ? 'var(--li-primary)' : 'var(--li-text-2)', textDecoration: 'none', padding: '6px 0', fontWeight: isLeafActive(child.path) ? 600 : 400 }}
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
                        <Icons.Layers size={20} />
                    </div>
                    <div className="farmaku-logo-text-wrapper">
                        <span className="farmaku-logo-text">SMTBMS</span>
                    </div>
                </div>
            </div>

            {/* ── Nav Content ── */}
            <div className="farmaku-sidebar-content">
                <ul className="farmaku-nav-list">
                    {loading ? (
                        <div style={{ padding: '20px 10px', color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>
                            Loading menu…
                        </div>
                    ) : (
                        // Flat list rendering (Removed section labels)
                        navigation
                            .filter(item => item.title !== 'Settings')
                            .map((item, index) => renderNavItem(item, `nav-${index}`))
                    )}

                    {!dynamicPaths.has('/notifications') && (
                        <li>
                            <NavLink to="/notifications" end className={() => `farmaku-nav-item${isLeafActive('/notifications') ? ' active' : ''}`}>
                                <div className="icon-wrapper icon-bg-rose"><Icons.Bell /></div>
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
                                <div className="icon-wrapper icon-bg-gray"><Icons.HelpCircle /></div>
                                <span>Help &amp; Support</span>
                            </NavLink>
                        </li>
                    )}

                    <li>
                        <NavLink to="/ocr" end className={() => `farmaku-nav-item${isLeafActive('/ocr') ? ' active' : ''}`}>
                            <div className="icon-wrapper icon-bg-teal"><Icons.Scan /></div>
                            <span>OCR Tool</span>
                        </NavLink>
                    </li>

                    <li>
                        <div className="farmaku-nav-item" onClick={() => openAria()} role="button">
                            <div className="icon-wrapper icon-bg-blue"><Icons.Bot /></div>
                            <span>AI Assistant</span>
                        </div>
                    </li>

                    {!loading && navigation.find((item) => item.title === 'Settings') &&
                        renderNavItem(navigation.find((item) => item.title === 'Settings'), 'settings')}

                    <div style={{ flex: 1, minHeight: '20px' }}></div>
                </ul>
            </div>


            <div className="farmaku-sidebar-footer" style={{ borderTop: '1px solid #E5E7EB', padding: '16px' }}>

                <div className="farmaku-logout-item" onClick={logout} style={{ margin: 0, padding: '10px' }}>
                    <Icons.LogOut size={16} />
                    <span>Logout</span>
                </div>
            </div>
        </aside>
    );
};

export default FarmakuSidebar;