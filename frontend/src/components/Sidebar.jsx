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
    FileText,
    ShieldCheck
} from 'lucide-react';

const Sidebar = ({ logout, isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [designation, setDesignation] = useState('');
    const [empId, setEmpId] = useState('');
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [user?.picture]);

    useEffect(() => {
        if (window.innerWidth <= 768) {
            onClose();
            setIsCollapsed(false);
        }
    }, [location, onClose]);

    useEffect(() => {
        if (isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
        }
    }, [isCollapsed]);

    useEffect(() => {
        const fetchMe = async () => {
            if (user && user.role !== 'Customer' && user.role !== 'Vendor') {
                try {
                    const { data } = await API.get('/employees/me');
                    if (data) {
                        if (data.designation) setDesignation(data.designation);
                        if (data.employeeId || data.employeeCode) setEmpId(data.employeeId || data.employeeCode);
                    }
                } catch (err) {
                    console.error("Failed to fetch employee details in Sidebar", err);
                }
            }
        };
        fetchMe();
    }, [user]);
    
    // Core icons upgraded
    const adminMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={20} /> },
        { path: '/hrms', name: 'HRMS', icon: <Briefcase size={20} /> },
        { path: '/leave-management', name: 'Leave Mgmt', icon: <Calendar size={20} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={20} /> },
        { path: '/payslips', name: 'Payslips', icon: <FileText size={20} /> },
        { path: '/erp', name: 'ERP System', icon: <FolderKanban size={20} /> },
        { path: '/materials', name: 'Material Tracking', icon: <Package size={20} /> },
        { path: '/vendors', name: 'Suppliers', icon: <Truck size={20} /> },
        { path: '/crm', name: 'CRM', icon: <Users size={20} /> },
        { path: '/analytics', name: 'Analytics', icon: <TrendingUp size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
    ];

    const employeeMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/my-tasks', name: 'My Tasks', icon: <ClipboardList size={20} /> },
        { path: '/materials', name: 'Materials', icon: <Package size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/my-salary', name: 'Payslips', icon: <DollarSign size={20} /> },
        { path: '/leave-management', name: 'Leaves', icon: <Calendar size={20} /> },
        { path: '/erp', name: 'ERP Orders', icon: <ShoppingCart size={20} /> },
        { path: '/stock-requests', name: 'Stock Requests', icon: <Box size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
    ];

    const hrMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/hrms', name: 'Directory', icon: <Users size={20} /> },
        { path: '/my-tasks', name: 'Tasks', icon: <ClipboardList size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Activity size={20} /> },
        { path: '/leave-management', name: 'Leave Mgmt', icon: <Calendar size={20} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={20} /> },
        { path: '/payslips', name: 'Payslips', icon: <FileText size={20} /> },
        { path: '/erp', name: 'ERP Orders', icon: <ShoppingCart size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
        { path: '/hr-reports', name: 'Reports', icon: <BarChart3 size={20} /> },
    ];

    const managerMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/hrms', name: 'HRMS', icon: <Briefcase size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={20} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={20} /> },
        { path: '/payslips', name: 'Payslips', icon: <FileText size={20} /> },
        { path: '/erp', name: 'Projects / ERP', icon: <FolderKanban size={20} /> },
        { path: '/my-tasks', name: 'Tasks', icon: <ClipboardList size={20} /> },
        { path: '/team-performance', name: 'Team Performance', icon: <TrendingUp size={20} /> },
        { path: '/materials', name: 'Materials', icon: <Package size={20} /> },
        { path: '/vendors', name: 'Suppliers', icon: <Truck size={20} /> },
        { path: '/crm', name: 'CRM', icon: <Briefcase size={20} /> },
        { path: '/stock-requests', name: 'Stock', icon: <Box size={20} /> },
        { path: '/analytics', name: 'Reports', icon: <BarChart3 size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
    ];

    const salesMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/my-tasks', name: 'My Tasks', icon: <ClipboardList size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/crm', name: 'CRM', icon: <Users size={20} /> },
        { path: '/erp', name: 'ERP Orders', icon: <ShoppingCart size={20} /> },
        { path: '/stock-requests', name: 'Deliveries', icon: <Truck size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
        { path: '/analytics', name: 'Reports', icon: <BarChart3 size={20} /> },
    ];

    const customerMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/orders/create-order', name: 'New Order', icon: <ShoppingCart size={20} /> },
        { path: '/support', name: 'Support', icon: <HelpCircle size={20} /> }
    ];

    const vendorMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/support', name: 'Support', icon: <HelpCircle size={20} /> }
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
                        <div className="simple-profile-card" onClick={() => window.location.href='/profile'}>
                            <div className="simple-avatar">
                                {user?.picture && !imgError ? (
                                    <img 
                                        src={user.picture} 
                                        alt="User Avatar" 
                                        className="simple-avatar-img" 
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <span className="simple-avatar-initial">
                                        {(user?.name || 'User').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="simple-details">
                                    <span className="simple-name">{user?.name || 'User'}</span>
                                    <span className="simple-role">
                                        {userRole === 'admin' || userRole === 'super admin' || user?.email === 'admin@smtbms.com' 
                                            ? 'System Administrator' 
                                            : userRole === 'customer' 
                                                ? 'Customer' 
                                                : userRole === 'vendor' 
                                                    ? 'Vendor' 
                                                    : (designation || 'Employee')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={logout} className="nav-item logout-btn" title={isCollapsed ? 'Logout' : ''}>
                        <span className="item-icon-wrapper"><LogOut size={20} /></span>
                        {!isCollapsed && <span className="item-name">Logout</span>}
                    </button>
                </div>
            </nav>

            <style jsx="true">{`
                .sidebar {
                    width: var(--sidebar-width);
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
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .sidebar::-webkit-scrollbar { display: none; }
                .sidebar { -ms-overflow-style: none; scrollbar-width: none; }
                .sidebar.collapsed { width: 72px; }
                
                .sidebar-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 16px 16px; margin-bottom: 8px;
                }
                .sidebar.collapsed .sidebar-header {
                    justify-content: center; padding: 0 10px 16px;
                }
                
                .sidebar-logo h2 {
                    font-size: 20px; font-weight: 700; color: var(--text-heading);
                    letter-spacing: -0.02em; margin: 0;
                }
                
                .collapse-btn, .close-sidebar {
                    background: var(--bg-surface); border: 1px solid var(--border-subtle);
                    color: var(--text-muted); border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s; padding: 0;
                }
                .collapse-btn { width: 24px; height: 24px; }
                .collapse-btn:hover { background: var(--bg-hover); color: var(--text-heading); }
                .sidebar.collapsed .collapse-btn {
                    position: absolute; right: -12px; top: 24px;
                    background: var(--bg-surface); border: 1px solid var(--border-subtle);
                    box-shadow: var(--shadow-sm); z-index: 10;
                }
                
                .simple-profile-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    margin: 0 12px 16px;
                    background: transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-decoration: none;
                    border: 1px solid transparent;
                }
                .simple-profile-card:hover {
                    background: var(--bg-hover, #f1f5f9);
                }
                .sidebar.collapsed .simple-profile-card {
                    padding: 10px;
                    margin: 0 8px 16px;
                    justify-content: center;
                }

                .simple-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--primary, #2563eb);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }
                .sidebar.collapsed .simple-avatar {
                    width: 32px;
                    height: 32px;
                }
                .simple-avatar-img { 
                    width: 100%; 
                    height: 100%; 
                    border-radius: 50%; 
                    object-fit: cover; 
                }
                .simple-avatar-initial { 
                    font-size: 14px; 
                    font-weight: 600; 
                }

                .simple-details {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    flex: 1;
                    min-width: 0;
                }
                .simple-name {
                    color: var(--text-heading, #0f172a);
                    font-size: 14px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .simple-role {
                    color: var(--text-muted, #64748b);
                    font-size: 12px;
                    font-weight: 400;
                    margin-top: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sidebar-nav {
                    flex: 1; padding: 0 16px 16px; overflow-y: auto; overflow-x: hidden;
                    display: flex; flex-direction: column; gap: 4px;
                }
                
                .nav-item {
                    display: flex; align-items: center; padding: 10px 12px; height: 44px;
                    color: var(--text-muted); border-radius: 8px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    text-decoration: none; font-weight: 500; font-size: 14px; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer;
                    border-left: 3px solid transparent;
                }
                .sidebar.collapsed .nav-item { padding: 10px; justify-content: center; border-left: none; }
                
                .item-icon-wrapper { display: flex; align-items: center; margin-right: 14px; transition: color 0.2s ease; }
                .sidebar.collapsed .item-icon-wrapper { margin-right: 0; }
                .item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
                
                .sidebar-badge {
                    background: var(--primary); color: white; font-size: 10px; font-weight: 700;
                    padding: 2px 6px; border-radius: 10px; margin-left: auto;
                }
                .sidebar-badge-dot {
                    position: absolute; top: 8px; right: 8px; width: 6px; height: 6px;
                    background: var(--primary); border-radius: 50%;
                }
                
                .nav-item:hover { background: var(--bg-hover); color: var(--text-heading); border-left-color: var(--border-strong); }
                .nav-item:hover .item-icon-wrapper { color: var(--text-heading); }
                
                .nav-item.active { 
                    background: var(--primary-100); 
                    color: var(--primary) !important; 
                    font-weight: 600; 
                    border-left-color: var(--primary);
                }
                .nav-item.active .item-icon-wrapper { color: var(--primary) !important; }
                
                .logout-btn { color: var(--text-muted); margin-top: auto; }
                .logout-btn:hover { color: var(--danger); background: var(--danger-bg); }
                .logout-btn:hover .item-icon-wrapper { color: var(--danger); }

                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); }
                    .sidebar.open { transform: translateX(0); box-shadow: var(--shadow-xl); }
                    .mobile-only { display: block; }
                    .desktop-only { display: none; }
                }
                @media (min-width: 769px) { .mobile-only { display: none; } }
            `}</style>
        </aside>
    );
};

export default Sidebar;
