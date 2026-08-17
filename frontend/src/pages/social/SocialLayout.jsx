import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Rss, Users, MessageSquare, Search, Bell } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './SocialLayout.css';

const SocialLayout = ({ children }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Mock presence - randomly assign for demo purposes based on user ID or just hardcode to 'online' for the logged-in user
    const presenceStatus = 'online'; 

    return (
        <div className="social-layout">
            {/* Left Icon Rail */}
            <div className="social-rail">
                <div className="rail-nav">
                    <div 
                        className="rail-item"
                        title="Back to ERP Dashboard"
                        onClick={() => navigate('/')}
                    >
                        <LayoutDashboard size={24} />
                        <span>Home</span>
                    </div>

                    <NavLink 
                        to="/social"
                        className={`rail-item ${location.pathname === '/social' ? 'active' : ''}`}
                        title="Social Hub"
                    >
                        <Rss size={24} />
                        <span>Feed</span>
                    </NavLink>

                    <NavLink 
                        to="/social/network"
                        className={`rail-item ${location.pathname === '/social/network' ? 'active' : ''}`}
                        title="My Network"
                    >
                        <Users size={24} />
                        <span>Network</span>
                    </NavLink>

                    <NavLink 
                        to="/social/messages"
                        className={`rail-item ${location.pathname.startsWith('/social/messages') ? 'active' : ''}`}
                        title="Messages"
                    >
                        <MessageSquare size={24} />
                        <span>Messages</span>
                    </NavLink>

                    <div className="rail-item bottom-pinned" title="Profile">
                        <div className="rail-avatar-wrapper" onClick={() => navigate(`/social/profile/${user?.id}`)}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            <span className={`presence-dot ${presenceStatus}`}></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="social-main-area">
                {/* Top Bar */}
                <div className="social-topbar">
                    <div className="topbar-search">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Search across Social Hub..." />
                    </div>
                    
                    <div className="topbar-right">
                        <div className="topbar-actions">
                            <Bell size={20} />
                            <span className="notification-badge">3</span>
                        </div>
                        
                        <div className="topbar-profile" onClick={() => navigate(`/social/profile/${user?.id}`)} style={{cursor: 'pointer'}}>
                            <div className="topbar-profile-info">
                                <span className="topbar-name">{user?.name || 'User'}</span>
                                <span className="topbar-role">{user?.role || 'Employee'}</span>
                            </div>
                            <div className="topbar-avatar">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                <span className={`presence-dot ${presenceStatus}`}></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content Container */}
                <div className="social-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SocialLayout;
