import React, { useContext, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Box, 
    Users, 
    ShoppingCart, 
    Briefcase, 
    BarChart3, 
    Bell, 
    Settings,
    LogOut,
    Calendar,
    CheckCircle,
    DollarSign,
    PhoneCall,
    X
} from 'lucide-react';

const Sidebar = ({ logout, isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (window.innerWidth <= 768) {
            onClose();
        }
    }, [location, onClose]);
    
    const adminMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/materials', name: 'Materials', icon: <Box size={20} /> },
        { path: '/hrms', name: 'Employees (HRMS)', icon: <Users size={20} /> },
        { path: '/erp', name: 'Orders (ERP)', icon: <ShoppingCart size={20} /> },
        { path: '/crm', name: 'Customers (CRM)', icon: <Briefcase size={20} /> },
        { path: '/vendors', name: 'Vendors', icon: <Users size={20} /> },
        { path: '/analytics', name: 'Reports & Analytics', icon: <BarChart3 size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
        { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
    ];

    const employeeMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/my-tasks', name: 'My Tasks', icon: <Box size={20} /> },
        { path: '/my-attendance', name: 'Attendance', icon: <BarChart3 size={20} /> },
        { path: '/my-salary', name: 'My Salary', icon: <DollarSign size={20} /> },
        { path: '/leave-management', name: 'Leave Management', icon: <Calendar size={20} /> },
        { path: '/erp', name: 'Orders (ERP)', icon: <ShoppingCart size={20} /> },
        { path: '/settings', name: 'My Profile', icon: <Settings size={20} /> },
    ];

    const hrMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/hrms', name: 'Employees', icon: <Users size={20} /> },
        { path: '/attendance', name: 'Attendance', icon: <CheckCircle size={20} /> },
        { path: '/leave-management', name: 'Leave Management', icon: <Calendar size={20} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={20} /> },
        { path: '/erp', name: 'Orders (ERP)', icon: <ShoppingCart size={20} /> },
        { path: '/hr-reports', name: 'Reports', icon: <BarChart3 size={20} /> },
        { path: '/settings', name: 'Profile', icon: <Settings size={20} /> },
    ];

    const managerMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/erp', name: 'Orders / Projects', icon: <ShoppingCart size={20} /> },
        { path: '/my-tasks', name: 'Task Management', icon: <Box size={20} /> },
        { path: '/team-performance', name: 'Team Performance', icon: <Users size={20} /> },
        { path: '/materials', name: 'Materials Overview', icon: <Briefcase size={20} /> },
        { path: '/analytics', name: 'Reports', icon: <BarChart3 size={20} /> },
        { path: '/settings', name: 'Profile', icon: <Settings size={20} /> },
    ];

    const salesMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/crm', name: 'Leads', icon: <Users size={20} /> },
        { path: '/customers', name: 'Customers', icon: <Users size={20} /> },
        { path: '/sales-pipeline', name: 'Sales Pipeline', icon: <BarChart3 size={20} /> },
        { path: '/follow-ups', name: 'Follow-ups', icon: <PhoneCall size={20} /> },
        { path: '/analytics', name: 'Reports', icon: <BarChart3 size={20} /> },
        { path: '/settings', name: 'Profile', icon: <Settings size={20} /> },
    ];

    const menuItems = user?.role === 'Admin' ? adminMenu : 
                      user?.role === 'HR' ? hrMenu : 
                      user?.role === 'Manager' ? managerMenu : 
                      user?.role === 'Sales' ? salesMenu : employeeMenu;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <h2>SMTBMS</h2>
                </div>
                <button className="close-sidebar mobile-only" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            {user && (
                <div className="sidebar-user-card">
                    <div className="user-avatar-wrapper">
                        <div className="user-avatar-circle">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=2563eb&color=fff`} alt="User Avatar" />
                        </div>
                    </div>
                    <div className="user-details">
                        <h4 className="user-name">{user?.name || 'Admin User'}</h4>
                        <span className="user-role">{user?.role === 'Admin' ? 'Super Admin' : user?.role}</span>
                        <div className="user-status">
                            <span className="status-dot"></span>
                            <span className="status-text">Online</span>
                        </div>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="item-icon-wrapper">{item.icon}</span>
                        <span className="item-name">{item.name}</span>
                        {/* Nested style chevrons for items like Dashboard, ERP, CRM to match reference image */}
                        {(item.name === 'Dashboard' || item.name === 'Orders (ERP)' || item.name === 'Customers (CRM)' || item.name === 'Reports & Analytics') && (
                            <span className="chevron-indicator">▾</span>
                        )}
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn nav-item">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>

            <style jsx="true">{`
                .sidebar {
                    width: 260px;
                    height: 100vh;
                    background: #0f172a; /* Slate 900 Deep Navy */
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    padding: 20px 0;
                    z-index: 1000;
                    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .sidebar-logo h2 {
                    font-size: 22px;
                    font-weight: 800;
                    font-family: 'Outfit', sans-serif;
                    color: #ffffff;
                    letter-spacing: 0.5px;
                }
                .close-sidebar {
                    background: transparent;
                    color: #ffffff;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Sidebar User Card Section */
                .sidebar-user-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    margin-bottom: 15px;
                }
                .user-avatar-wrapper {
                    position: relative;
                }
                .user-avatar-circle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }
                .user-avatar-circle img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .user-details {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .user-name {
                    color: #ffffff;
                    font-size: 15px;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.2;
                }
                .user-role {
                    color: #94a3b8;
                    font-size: 12px;
                    font-weight: 500;
                    margin-top: 2px;
                }
                .user-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 4px;
                }
                .status-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 8px #10b981;
                }
                .status-text {
                    color: #10b981;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .sidebar-nav {
                    flex: 1;
                    padding: 0 12px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .sidebar-nav::-webkit-scrollbar {
                    width: 4px;
                }
                .sidebar-nav::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 16px;
                    color: #94a3b8;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 13px;
                    letter-spacing: 0.2px;
                    text-transform: none; /* Reference image uses standard casing */
                    text-decoration: none;
                }
                .item-icon-wrapper {
                    display: flex;
                    align-items: center;
                    margin-right: 12px;
                    color: #64748b;
                    transition: color 0.2s ease;
                }
                .item-name {
                    flex: 1;
                }
                .chevron-indicator {
                    font-size: 12px;
                    color: #475569;
                    margin-left: auto;
                }
                
                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: #ffffff;
                }
                .nav-item:hover .item-icon-wrapper {
                    color: #3b82f6;
                }
                
                .nav-item.active {
                    background: #2563eb; /* Vibrant blue active state */
                    color: #ffffff !important;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                .nav-item.active .item-icon-wrapper {
                    color: #ffffff !important;
                }
                .nav-item.active .chevron-indicator {
                    color: rgba(255, 255, 255, 0.6);
                }
                
                .sidebar-footer {
                    padding: 15px 12px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .logout-btn {
                    width: 100%;
                    background: transparent;
                    border: none;
                    text-align: left;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .logout-btn:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.08);
                }

                @media (max-width: 768px) {
                    .sidebar {
                        transform: translateX(-100%);
                    }
                    .sidebar.open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
