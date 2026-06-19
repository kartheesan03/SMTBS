import React, { useContext } from 'react';
import { Bell, Calendar as CalendarIcon, ChevronDown, Search, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../api/axios';

const Topbar = () => {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [designation, setDesignation] = React.useState('');

    React.useEffect(() => {
        const fetchMe = async () => {
            if (user && user.role !== 'Customer' && user.role !== 'Vendor') {
                try {
                    const { data } = await API.get('/employees/me');
                    if (data && data.designation) {
                        setDesignation(data.designation);
                    }
                } catch (err) {
                    console.error("Failed to fetch designation in Topbar", err);
                }
            }
        };
        fetchMe();
    }, [user]);

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Generate Breadcrumbs
    const pathnames = location.pathname.split('/').filter(x => x);
    
    return (
        <header className="topbar">
            
            <div className="topbar-left desktop-only">
                <nav className="breadcrumbs">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                    {pathnames.map((value, index) => {
                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathnames.length - 1;
                        const formattedValue = value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return (
                            <React.Fragment key={to}>
                                <ChevronRight size={14} className="breadcrumb-separator" />
                                {isLast ? (
                                    <span className="breadcrumb-current">{formattedValue}</span>
                                ) : (
                                    <Link to={to} className="breadcrumb-link">{formattedValue}</Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </nav>
            </div>
            
            <div className="topbar-center desktop-only">
                <div className="global-search">
                    <Search size={14} className="search-icon" />
                    <input type="text" placeholder="Search across app..." />
                    <span className="search-shortcut">⌘K</span>
                </div>
            </div>
            
            <div className="topbar-actions">
                <div className="date-selector desktop-only">
                    <CalendarIcon size={14} className="text-muted" />
                    <span>{today}</span>
                </div>
                
                <button className="topbar-btn relative" onClick={() => navigate('/notifications')}>
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="notification-dot"></span>}
                </button>
                
                <div className="topbar-profile" onClick={() => navigate('/profile')}>
                    <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563eb&color=fff`} alt="Profile" className="profile-avatar" />
                    <div className="profile-info desktop-only">
                        <span className="profile-name">{user?.name || 'User'}</span>
                        <span className="profile-role">{designation || user?.role || 'Employee'}</span>
                    </div>
                    <ChevronDown size={14} className="text-muted desktop-only" style={{ marginLeft: '4px' }} />
                </div>
            </div>

            <style jsx="true">{`
                .topbar {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    height: var(--header-height, 60px);
                    padding: 0 24px;
                    background: rgba(255, 255, 255, 0.98);
                    border-bottom: 1px solid var(--border-subtle);
                    position: sticky;
                    top: 0;
                    z-index: 900;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }

                .topbar-left {
                    display: flex;
                    align-items: center;
                }

                .breadcrumbs {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 500;
                }
                .breadcrumb-link {
                    color: var(--text-muted);
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .breadcrumb-link:hover {
                    color: var(--primary);
                }
                .breadcrumb-separator {
                    color: var(--border-strong);
                }
                .breadcrumb-current {
                    color: var(--text-heading);
                    font-weight: 600;
                }

                .topbar-center {
                    display: flex;
                    justify-content: center;
                }
                
                .global-search {
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-sm);
                    padding: 0 12px;
                    width: 380px;
                    height: 34px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .global-search:focus-within {
                    background: #ffffff;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }
                .global-search input {
                    background: transparent;
                    border: none;
                    outline: none;
                    width: 100%;
                    padding-left: 10px;
                    font-size: 13px;
                    color: var(--text-heading);
                    font-family: 'Inter', sans-serif;
                }
                .global-search input::placeholder {
                    color: var(--text-muted);
                }
                .search-icon { color: var(--text-muted); }
                .global-search:focus-within .search-icon { color: var(--primary); }
                
                .search-shortcut {
                    font-size: 11px;
                    color: var(--text-muted);
                    background: #ffffff;
                    border: 1px solid var(--border-subtle);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                    margin-left: 8px;
                }

                .topbar-actions {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 16px;
                }

                .date-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-main);
                    padding: 6px 12px;
                    border-right: 1px solid var(--border-subtle);
                    padding-right: 16px;
                }

                .topbar-btn {
                    background: transparent;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--secondary-hover);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .topbar-btn:hover {
                    color: var(--primary);
                    background: var(--primary-light);
                }
                .notification-dot {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 8px;
                    height: 8px;
                    background: var(--danger);
                    border-radius: 50%;
                    border: 2px solid #ffffff;
                }

                .topbar-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    padding-left: 4px;
                    transition: opacity 0.2s;
                }
                .topbar-profile:hover {
                    opacity: 0.8;
                }
                .profile-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid var(--border-subtle);
                }
                .profile-info {
                    display: flex;
                    flex-direction: column;
                }
                .profile-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-heading);
                    line-height: 1.2;
                }
                .profile-role {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                @media (max-width: 768px) {
                    .topbar {
                        display: flex;
                        justify-content: space-between;
                        padding: 0 16px;
                    }
                    .topbar-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }
                }
            `}</style>
        </header>
    );
};

export default Topbar;
