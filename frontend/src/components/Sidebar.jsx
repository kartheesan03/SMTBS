import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { 
    LayoutDashboard, 
    Box, 
    Users, 
    ShoppingCart, 
    Briefcase, 
    BarChart3, 
    Bell, 
    LogOut,
    Calendar,
    CheckCircle,
    DollarSign,
    X,
    HelpCircle,
    Package,
    Truck,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Activity,
    ClipboardList,
    FolderKanban
} from 'lucide-react';

const Sidebar = ({ logout, isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (window.innerWidth <= 768) {
            onClose();
            setIsCollapsed(false);
        }
    }, [location, onClose]);
    
    // Core icons upgraded
    const adminMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={18} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={18} /> },
        { path: '/hrms', name: 'HRMS', icon: <Briefcase size={18} /> },
        { path: '/leave-management', name: 'Leave Mgmt', icon: <Calendar size={18} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={18} /> },
        { path: '/erp', name: 'ERP System', icon: <FolderKanban size={18} /> },
        { path: '/materials', name: 'Material Tracking', icon: <Package size={18} /> },
        { path: '/vendors', name: 'Suppliers', icon: <Truck size={18} /> },
        { path: '/crm', name: 'CRM', icon: <Users size={18} /> },
        { path: '/analytics', name: 'Analytics', icon: <TrendingUp size={18} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={18} /> },
    ];

    const employeeMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/my-tasks', name: 'My Tasks', icon: <ClipboardList size={18} /> },
        { path: '/materials', name: 'Materials', icon: <Package size={18} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={18} /> },
        { path: '/my-salary', name: 'Payslips', icon: <DollarSign size={18} /> },
        { path: '/leave-management', name: 'Leaves', icon: <Calendar size={18} /> },
        { path: '/erp', name: 'ERP Orders', icon: <ShoppingCart size={18} /> },
        { path: '/stock-requests', name: 'Stock Requests', icon: <Box size={18} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={18} /> },
    ];

    const hrMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/hrms', name: 'Directory', icon: <Users size={18} /> },
        { path: '/my-tasks', name: 'Tasks', icon: <ClipboardList size={18} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={18} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Activity size={18} /> },
        { path: '/leave-management', name: 'Leave Mgmt', icon: <Calendar size={18} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={18} /> },
        { path: '/erp', name: 'ERP Orders', icon: <ShoppingCart size={18} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={18} /> },
        { path: '/hr-reports', name: 'Reports', icon: <BarChart3 size={18} /> },
    ];

    const managerMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={18} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={18} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={18} /> },
        { path: '/erp', name: 'Projects / ERP', icon: <FolderKanban size={18} /> },
        { path: '/my-tasks', name: 'Tasks', icon: <ClipboardList size={18} /> },
        { path: '/team-performance', name: 'Team Performance', icon: <TrendingUp size={18} /> },
        { path: '/materials', name: 'Materials', icon: <Package size={18} /> },
        { path: '/vendors', name: 'Suppliers', icon: <Truck size={18} /> },
        { path: '/crm', name: 'CRM', icon: <Briefcase size={18} /> },
        { path: '/stock-requests', name: 'Stock', icon: <Box size={18} /> },
        { path: '/analytics', name: 'Reports', icon: <BarChart3 size={18} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={18} /> },
    ];

    const salesMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/my-tasks', name: 'My Tasks', icon: <ClipboardList size={18} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={18} /> },
        { path: '/crm', name: 'CRM', icon: <Users size={18} /> },
        { path: '/erp', name: 'ERP Orders', icon: <ShoppingCart size={18} /> },
        { path: '/stock-requests', name: 'Deliveries', icon: <Truck size={18} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={18} /> },
        { path: '/analytics', name: 'Reports', icon: <BarChart3 size={18} /> },
    ];

    const customerMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/orders/create-order', name: 'New Order', icon: <ShoppingCart size={18} /> },
        { path: '/support', name: 'Support', icon: <HelpCircle size={18} /> }
    ];

    const vendorMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/support', name: 'Support', icon: <HelpCircle size={18} /> }
    ];

    const userRole = user?.role ? user.role.toLowerCase() : '';
    const isAdmin = user?.email === 'admin@smtbms.com' || userRole === 'admin' || userRole === 'super admin';
    const menuItems = isAdmin ? adminMenu : 
                      userRole === 'hr' ? hrMenu : 
                      userRole === 'manager' ? managerMenu : 
                      userRole === 'sales' ? salesMenu : 
                      userRole === 'customer' ? customerMenu :
                      userRole === 'vendor' ? vendorMenu :
                      employeeMenu;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    {!isCollapsed ? <h2>SMTBMS</h2> : <h2>SM</h2>}
                </div>
                <div className="sidebar-controls">
                    <button className="collapse-btn desktop-only" onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    <button className="close-sidebar mobile-only" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
            </div>

            {user && (
                <NavLink to="/profile" className="sidebar-user-card" style={{ textDecoration: 'none' }}>
                    <div className="user-avatar-wrapper">
                        <div className="user-avatar-circle">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=2563eb&color=fff`} alt="User Avatar" />
                        </div>
                        {isCollapsed && <span className="status-dot-absolute"></span>}
                    </div>
                    {!isCollapsed && (
                        <div className="user-details">
                            <h4 className="user-name" style={{color: '#ffffff'}}>{user?.name || 'Admin User'}</h4>
                            <span className="user-role" style={{color: '#94a3b8'}}>{isAdmin ? 'Super Admin' : user?.role}</span>
                        </div>
                    )}
                </NavLink>
            )}

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.name : ''}
                    >
                        <span className="item-icon-wrapper">{item.icon}</span>
                        {!isCollapsed && <span className="item-name">{item.name}</span>}
                        
                        {!isCollapsed && item.name === 'Notifications' && unreadCount > 0 && (
                            <span className="sidebar-badge">{unreadCount}</span>
                        )}
                        {isCollapsed && item.name === 'Notifications' && unreadCount > 0 && (
                            <span className="sidebar-badge-dot"></span>
                        )}
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn nav-item" title={isCollapsed ? 'Logout' : ''}>
                    <span className="item-icon-wrapper"><LogOut size={18} /></span>
                    {!isCollapsed && <span className="item-name">Logout</span>}
                </button>
            </div>

            <style jsx="true">{`
                .sidebar {
                    width: var(--sidebar-width, 240px);
                    height: 100vh;
                    background: #0f172a;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    padding: 20px 0;
                    z-index: 1000;
                    transition: width 0.3s ease, transform 0.3s ease;
                }
                .sidebar.collapsed {
                    width: 72px;
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px 20px;
                }
                .sidebar.collapsed .sidebar-header {
                    justify-content: center;
                    padding: 0 10px 20px;
                }
                .sidebar-logo h2 {
                    font-size: 20px;
                    font-weight: 800;
                    font-family: 'Inter', sans-serif;
                    color: #ffffff;
                    letter-spacing: -0.5px;
                    margin: 0;
                }
                .sidebar-controls {
                    display: flex;
                    align-items: center;
                }
                .collapse-btn, .close-sidebar {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: #94a3b8;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .collapse-btn {
                    width: 24px;
                    height: 24px;
                }
                .collapse-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }
                .sidebar.collapsed .collapse-btn {
                    position: absolute;
                    right: -12px;
                    top: 24px;
                    background: #1e293b;
                    border: 1px solid rgba(255,255,255,0.1);
                    z-index: 10;
                }
                
                .sidebar-user-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    margin: 0 16px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .sidebar.collapsed .sidebar-user-card {
                    padding: 8px;
                    margin: 0 12px 20px;
                    justify-content: center;
                }
                .user-avatar-wrapper { position: relative; }
                .user-avatar-circle {
                    width: 36px; height: 36px; border-radius: 50%; overflow: hidden;
                }
                .sidebar.collapsed .user-avatar-circle {
                    width: 32px; height: 32px;
                }
                .user-avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
                .user-details { display: flex; flex-direction: column; justify-content: center; }
                .user-name { color: #fff; font-size: 13px; font-weight: 600; margin: 0; line-height: 1.2; }
                .user-role { color: #94a3b8; font-size: 11px; font-weight: 500; margin-top: 2px; text-transform: capitalize; }
                .status-dot-absolute {
                    position: absolute; bottom: 0; right: 0; width: 8px; height: 8px;
                    background: #10b981; border-radius: 50%; border: 2px solid #0f172a;
                }

                .sidebar-nav {
                    flex: 1; padding: 0 12px; overflow-y: auto; overflow-x: hidden;
                    display: flex; flex-direction: column; gap: 4px;
                }
                .nav-item {
                    display: flex; align-items: center; padding: 10px 12px;
                    color: #94a3b8; border-radius: 6px; transition: all 0.2s ease;
                    cursor: pointer; font-weight: 500; font-size: 13px; text-decoration: none;
                    position: relative; white-space: nowrap;
                }
                .sidebar.collapsed .nav-item {
                    padding: 10px; justify-content: center;
                }
                .item-icon-wrapper {
                    display: flex; align-items: center; margin-right: 12px; color: #94a3b8; transition: color 0.2s ease;
                }
                .sidebar.collapsed .item-icon-wrapper { margin-right: 0; }
                .item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
                
                .sidebar-badge {
                    background: #ef4444; color: white; font-size: 10px; font-weight: 700;
                    padding: 2px 6px; border-radius: 10px; margin-left: auto;
                }
                .sidebar-badge-dot {
                    position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
                    background: #ef4444; border-radius: 50%;
                }
                
                .nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
                .nav-item:hover .item-icon-wrapper { color: #fff; }
                
                .nav-item.active { background: #6366f1; color: #fff !important; font-weight: 600; }
                .nav-item.active .item-icon-wrapper { color: #fff !important; }
                
                .sidebar-footer { padding: 12px; margin-top: auto; }
                .logout-btn {
                    width: 100%; background: transparent; border: none; text-align: left;
                    color: #94a3b8; display: flex; align-items: center;
                }
                .sidebar.collapsed .logout-btn { justify-content: center; }
                .logout-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); width: 240px; }
                    .sidebar.open { transform: translateX(0); }
                    .mobile-only { display: block; }
                    .desktop-only { display: none; }
                }
                @media (min-width: 769px) {
                    .mobile-only { display: none; }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
