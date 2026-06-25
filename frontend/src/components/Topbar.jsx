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
    const [imgError, setImgError] = React.useState(false);

    React.useEffect(() => {
        setImgError(false);
    }, [user?.picture]);

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
                
                <div className="topbar-profile" onClick={() => navigate('/profile')} title="Profile">
                    <img 
                        src={(!imgError && user?.picture) ? user.picture : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563eb&color=fff`} 
                        alt="Profile" 
                        className="profile-avatar" 
                        style={{ width: '36px', height: '36px' }} 
                        onError={() => setImgError(true)}
                    />
                </div>
            </div>

            <style jsx="true">{`
                .topbar {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    height: var(--header-height);
                    padding: 0 40px;
                    background: rgba(255, 255, 255, 0.85);
                    border-bottom: 1px solid var(--border-subtle);
                    position: sticky;
                    top: 0;
                    margin: 0;
                    z-index: 900;
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }

                .topbar-left {
                    display: flex;
                    align-items: center;
                }

                .breadcrumbs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
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
                    background: var(--bg-hover);
                    border: 1px solid transparent;
                    border-radius: 8px;
                    padding: 0 12px;
                    width: 480px;
                    max-width: 40vw;
                    height: 36px;
                    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
                    position: relative;
                }
                .global-search:focus-within {
                    background: var(--bg-surface);
                    border-color: var(--border-strong);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .global-search:hover:not(:focus-within) {
                    background: var(--bg-active);
                }
                .global-search input {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    outline: none !important;
                    width: 100%;
                    padding-left: 12px;
                    font-size: 14px;
                    color: var(--text-primary);
                    font-family: 'Inter', sans-serif;
                }
                .global-search input::placeholder {
                    color: var(--text-muted);
                }
                .search-icon { color: var(--text-muted); }
                .global-search:focus-within .search-icon { color: var(--primary); }
                
                .search-shortcut {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    color: var(--text-muted);
                    background: transparent;
                    border: 1px solid var(--border-strong);
                    padding: 0 6px;
                    height: 20px;
                    line-height: 1;
                    border-radius: 4px;
                    font-weight: 500;
                    margin-left: 8px;
                }

                .topbar-actions {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 16px;
                }

                .topbar-actions > .date-selector {
                    position: relative;
                }
                .topbar-actions > .date-selector::after {
                    content: '';
                    position: absolute;
                    right: -8px;
                    top: 10%;
                    height: 80%;
                    width: 1px;
                    background: var(--border-subtle);
                }

                .topbar-btn {
                    background: transparent;
                    border: 1px solid transparent;
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
                    position: relative;
                    margin-left: 4px;
                }
                .topbar-btn:hover {
                    color: var(--text-heading);
                    background: var(--bg-hover);
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
                    padding: 4px;
                    border-radius: 20px;
                    transition: all 0.2s;
                }
                .topbar-profile:hover {
                    background: var(--bg-hover);
                    box-shadow: 0 0 0 4px var(--bg-hover);
                }
                .profile-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #ffffff;
                    box-shadow: var(--shadow-sm);
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
