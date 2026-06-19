import React, { useContext } from 'react';
import { Bell, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Topbar = () => {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const navigate = useNavigate();
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

    return (
        <header className="topbar">
            
            <div className="topbar-actions">
                <div className="date-selector desktop-only">
                    <CalendarIcon size={16} className="text-muted" />
                    <span>{today}</span>
                    <ChevronDown size={14} className="text-muted" />
                </div>
                
                <button className="topbar-btn relative" onClick={() => navigate('/notifications')}>
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notification-dot"></span>}
                </button>
                
                <div className="topbar-profile" onClick={() => navigate('/profile')}>
                    <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563eb&color=fff`} alt="Profile" className="profile-avatar" />
                    <div className="profile-info desktop-only">
                        <span className="profile-name">{user?.name || 'User'}</span>
                        <span className="profile-role">{designation || user?.role || 'Employee'}</span>
                    </div>
                    <ChevronDown size={14} className="text-muted desktop-only" />
                </div>
            </div>

            <style jsx="true">{`
                .topbar {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    height: var(--header-height, 64px);
                    padding: 0 24px;
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-subtle);
                    position: sticky;
                    top: 0;
                    z-index: 900;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    background: rgba(255, 255, 255, 0.95);
                }

                .topbar-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .date-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-app);
                    padding: 6px 12px;
                    border-radius: var(--radius-sm);
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-main);
                    cursor: pointer;
                    border: 1px solid var(--border-strong);
                    transition: all 0.15s ease;
                }
                .date-selector:hover {
                    border-color: var(--text-disabled);
                    background: var(--bg-hover);
                }

                .topbar-btn {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-strong);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .topbar-btn:hover {
                    color: var(--primary);
                    border-color: var(--primary);
                    background: var(--primary-light);
                }
                .notification-dot {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 8px;
                    height: 8px;
                    background: var(--danger);
                    border-radius: 50%;
                    border: 2px solid var(--bg-surface);
                }

                .topbar-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    padding-left: 16px;
                    border-left: 1px solid var(--border-subtle);
                    transition: opacity 0.2s;
                }
                .topbar-profile:hover {
                    opacity: 0.8;
                }
                .profile-avatar {
                    width: 36px;
                    height: 36px;
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
                }
                .profile-role {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-muted);
                }

                @media (max-width: 768px) {
                    .topbar {
                        padding: 0 16px;
                    }
                }
            `}</style>
        </header>
    );
};

export default Topbar;
