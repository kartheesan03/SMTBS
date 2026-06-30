import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import * as Icons from 'lucide-react';
import API from '../api/axios';
import './FarmakuSidebar.css';

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

    const renderIcon = (iconName) => {
        const IconComponent = Icons[iconName] || Icons.Circle;
        return <IconComponent size={20} />;
    };

    return (
        <aside className="farmaku-sidebar">
            <div className="farmaku-sidebar-header">
                <div className="farmaku-logo-container">
                    <div className="farmaku-logo-icon">
                        <Icons.Box size={24} strokeWidth={2.5} />
                    </div>
                    <div className="farmaku-logo-text-wrapper">
                        <span className="farmaku-logo-text">SMTBMS</span>
                        <span className="farmaku-logo-subtext">Smart Material Tracking &<br/>Business Management System</span>
                    </div>
                </div>
            </div>

            <div className="farmaku-sidebar-content" style={{ padding: '0 16px' }}>
                <ul className="farmaku-nav-list" style={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading menu...</div>
                    ) : (
                        (() => {
                            console.log('--- Sidebar Navigation Debug ---');
                            console.log('Fetched Navigation Array:', navigation);
                            console.log('Rendered Menu Items count:', navigation.length);
                            return navigation.map((item, index) => (
                            <li key={index}>
                                {item.children ? (
                                    <>
                                        <div 
                                            className={`farmaku-nav-item ${isPathActive(item) || expandedMenu === item.title ? 'active' : ''}`} 
                                            onClick={() => toggleMenu(item.title)}
                                        >
                                            {renderIcon(item.icon)}
                                            <span>{item.title}</span>
                                            {expandedMenu === item.title ? <Icons.ChevronDown size={16} style={{marginLeft: 'auto'}} /> : <Icons.ChevronRight size={16} style={{marginLeft: 'auto'}} />}
                                        </div>
                                        {expandedMenu === item.title && (
                                            <div className="farmaku-submenu">
                                                {item.children.map((child, cIndex) => (
                                                    <NavLink 
                                                        key={cIndex}
                                                        to={child.path} 
                                                        className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}
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
                                        className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}
                                    >
                                        {renderIcon(item.icon)}
                                        <span>{item.title}</span>
                                        <Icons.ChevronRight size={16} style={{marginLeft: 'auto'}} />
                                    </NavLink>
                                )}
                            </li>
                        ));
                        })()
                    )}

                    {/* Static Items that are not entirely permission driven in the same way (like Notifications, Support, Logout) */}
                    <li>
                        <NavLink to="/notifications" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <Icons.Bell size={20} />
                            <span>Notifications</span>
                            {unreadCount > 0 ? (
                                <div style={{marginLeft: 'auto', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{unreadCount}</div>
                            ) : (
                                <Icons.ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            )}
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/support" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <Icons.HelpCircle size={20} />
                            <span>Help & Support</span>
                            <Icons.ChevronRight size={16} style={{marginLeft: 'auto'}} />
                        </NavLink>
                    </li>

                    <li>
                        <div className="farmaku-nav-item" onClick={logout} style={{marginTop: '16px'}}>
                            <Icons.LogOut size={20} />
                            <span>Logout</span>
                        </div>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default FarmakuSidebar;
