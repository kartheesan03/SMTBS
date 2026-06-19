import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import API from '../api/axios';
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
    FolderKanban,
    FileText
} from 'lucide-react';

const Sidebar = ({ logout, isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [designation, setDesignation] = useState('');

    useEffect(() => {
        if (window.innerWidth <= 768) {
            onClose();
            setIsCollapsed(false);
        }
    }, [location, onClose]);

    useEffect(() => {
        const fetchMe = async () => {
            if (user && user.role !== 'Customer' && user.role !== 'Vendor') {
                try {
                    const { data } = await API.get('/employees/me');
                    if (data && data.designation) {
                        setDesignation(data.designation);
                    }
                } catch (err) {
                    console.error("Failed to fetch designation in Sidebar", err);
                }
            }
        };
        fetchMe();
    }, [user]);
    
    // Core icons upgraded
    const adminMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={18} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={18} /> },
        { path: '/hrms', name: 'HRMS', icon: <Briefcase size={18} /> },
        { path: '/leave-management', name: 'Leave Mgmt', icon: <Calendar size={18} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={18} /> },
        { path: '/payslips', name: 'Payslips', icon: <FileText size={18} /> },
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
        { path: '/payslips', name: 'Payslips', icon: <FileText size={18} /> },
        { path: '/erp', name: 'ERP Orders', icon: <ShoppingCart size={18} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={18} /> },
        { path: '/hr-reports', name: 'Reports', icon: <BarChart3 size={18} /> },
    ];

    const managerMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/hrms', name: 'HRMS', icon: <Briefcase size={18} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={18} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={18} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={18} /> },
        { path: '/payslips', name: 'Payslips', icon: <FileText size={18} /> },
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
                {/* Integrate Logout directly into nav */}
                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    {user && (
                        <div className="sidebar-profile-section" onClick={() => window.location.href='/profile'}>
                            <div className="user-avatar-wrapper">
                                <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563eb&color=fff`} alt="User Avatar" className="user-avatar-circle" />
                                {isCollapsed && <span className="status-dot-absolute"></span>}
                            </div>
                            {!isCollapsed && (
                                <div className="user-details">
                                    <span className="user-name">{user?.name || 'User'}</span>
                                    <span className="user-role">{designation || user?.role || 'Employee'}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={logout} className="nav-item logout-btn" title={isCollapsed ? 'Logout' : ''}>
                        <span className="item-icon-wrapper"><LogOut size={16} /></span>
                        {!isCollapsed && <span className="item-name">Logout</span>}
                    </button>
                </div>
            </nav>

            <style jsx="true">{`
                .sidebar {
                    width: var(--sidebar-width, 240px);
                    height: 100vh;
                    background: var(--bg-surface);
                    border-right: 1px solid var(--border-subtle);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    padding: 16px 0;
                    z-index: 1000;
                    transition: width 0.3s ease, transform 0.3s ease;
                }
                .sidebar::-webkit-scrollbar {
                    display: none;
                }
                .sidebar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .sidebar.collapsed {
                    width: 72px;
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px 16px;
                }
                .sidebar.collapsed .sidebar-header {
                    justify-content: center;
                    padding: 0 10px 16px;
                }
                .sidebar-logo h2 {
                    font-size: 20px;
                    font-weight: 700;
                    font-family: 'Inter', sans-serif;
                    color: var(--text-heading);
                    letter-spacing: -0.5px;
                    margin: 0;
                }
                .sidebar-controls {
                    display: flex;
                    align-items: center;
                }
                .collapse-btn, .close-sidebar {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-strong);
                    color: var(--text-muted);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 0;
                }
                .collapse-btn {
                    width: 24px;
                    height: 24px;
                }
                .collapse-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-heading);
                }
                .sidebar.collapsed .collapse-btn {
                    position: absolute;
                    right: -12px;
                    top: 24px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-strong);
                    box-shadow: var(--shadow-sm);
                    z-index: 10;
                }
                
                .sidebar-profile-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .sidebar-profile-section:hover {
                    background: var(--bg-hover);
                }
                .sidebar.collapsed .sidebar-profile-section {
                    padding: 12px 0;
                    justify-content: center;
                }
                .user-avatar-wrapper { position: relative; display: flex; align-items: center; justify-content: center; }
                .user-avatar-circle {
                    width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-subtle);
                }
                .sidebar.collapsed .user-avatar-circle {
                    width: 32px; height: 32px;
                }
                .user-details { display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
                .user-name { color: var(--text-heading); font-size: 13px; font-weight: 600; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .user-role { color: var(--text-muted); font-size: 11px; font-weight: 500; margin-top: 2px; text-transform: capitalize; }
                .status-dot-absolute {
                    position: absolute; bottom: 0; right: 0; width: 8px; height: 8px;
                    background: var(--success); border-radius: 50%; border: 2px solid var(--bg-surface);
                }

                .sidebar-nav {
                    flex: 1; padding: 0 16px 16px; overflow-y: auto; overflow-x: hidden;
                    display: flex; flex-direction: column; gap: 4px;
                    -ms-overflow-style: none; scrollbar-width: none;
                }
                .sidebar-nav::-webkit-scrollbar { display: none; }
                
                .nav-item {
                    display: flex; align-items: center; padding: 10px 12px; height: 44px;
                    color: var(--text-muted); border-radius: var(--radius-sm); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none; font-weight: 500; font-size: 13px; position: relative; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer;
                }
                .sidebar.collapsed .nav-item {
                    padding: 10px; justify-content: center;
                }
                .item-icon-wrapper {
                    display: flex; align-items: center; margin-right: 12px; color: var(--text-muted); transition: color 0.15s ease;
                }
                .sidebar.collapsed .item-icon-wrapper { margin-right: 0; }
                .item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
                
                .sidebar-badge {
                    background: var(--danger); color: white; font-size: 10px; font-weight: 700;
                    padding: 2px 6px; border-radius: 10px; margin-left: auto;
                }
                .sidebar-badge-dot {
                    position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
                    background: var(--danger); border-radius: 50%;
                }
                
                .nav-item:hover { background: var(--bg-hover); color: var(--text-heading); }
                .nav-item:hover .item-icon-wrapper { color: var(--text-heading); }
                
                .nav-item.active { 
                    background: var(--primary-light); 
                    color: var(--primary) !important; 
                    font-weight: 600; 
                }
                .nav-item.active .item-icon-wrapper { color: var(--primary) !important; }
                
                .logout-btn {
                    color: var(--text-muted);
                }
                .logout-btn:hover { color: var(--danger); background: #fef2f2; }
                .logout-btn:hover .item-icon-wrapper { color: var(--danger); }

                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); width: 240px; }
                    .sidebar.open { transform: translateX(0); box-shadow: var(--shadow-xl); }
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
