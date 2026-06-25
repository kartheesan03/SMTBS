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
                    <Box size={28} color="#4318FF" fill="rgba(67, 24, 255, 0.2)" strokeWidth={2}/>
                    {!isCollapsed && <h2>SMTBMS</h2>}
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

            {/* Profile Section moved to top */}
            {user && (
                <div className="sidebar-profile" onClick={() => window.location.href='/profile'}>
                    <div className="profile-avatar-wrapper">
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
                        <span className="online-indicator"></span>
                    </div>
                    {!isCollapsed && (
                        <div className="simple-details">
                            <span className="simple-name">{user?.name || 'User'}</span>
                            <span className="simple-role">
                                {userRole === 'admin' || userRole === 'super admin' || user?.email === 'admin@smtbms.com' 
                                    ? 'Super Admin' 
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



            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.name : ''}
                    >
                        {({ isActive }) => (
                            <>
                                <span className="item-icon-wrapper">{item.icon}</span>
                                {!isCollapsed && <span className="item-name">{item.name}</span>}
                                
                                {!isCollapsed && isActive && <ChevronRight size={16} className="active-arrow" />}

                                {!isCollapsed && item.name === 'Notifications' && unreadCount > 0 && (
                                    <span className="sidebar-badge">{unreadCount}</span>
                                )}
                                {isCollapsed && item.name === 'Notifications' && unreadCount > 0 && (
                                    <span className="sidebar-badge-dot"></span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
                {/* Integrate Logout directly into nav */}
                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
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
                    background: var(--secondary);
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    padding: 16px 0;
                    z-index: 1000;
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 4px 0 24px rgba(0,0,0,0.2);
                }
                .sidebar::-webkit-scrollbar { display: none; }
                .sidebar { -ms-overflow-style: none; scrollbar-width: none; }
                .sidebar.collapsed { width: 80px; }
                
                .sidebar-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 24px 20px; margin-bottom: 0px;
                }
                .sidebar.collapsed .sidebar-header {
                    justify-content: center; padding: 0 10px 20px;
                }
                
                .sidebar-logo {
                    display: flex; align-items: center; gap: 10px;
                }
                .sidebar-logo h2 {
                    font-size: 24px; font-weight: 800; color: #ffffff;
                    letter-spacing: -0.02em; margin: 0;
                }
                
                .collapse-btn, .close-sidebar {
                    background: transparent; border: none;
                    color: rgba(255, 255, 255, 0.6); border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s; padding: 4px;
                }
                .collapse-btn { width: 28px; height: 28px; }
                .collapse-btn:hover { background: rgba(255,255,255,0.1); color: #ffffff; }
                .sidebar.collapsed .collapse-btn {
                    position: absolute; right: -14px; top: 24px;
                    background: var(--primary); 
                    color: white; border: none;
                    border-radius: 50%; width: 28px; height: 28px;
                    box-shadow: 0 4px 12px rgba(67, 24, 255, 0.4); z-index: 10;
                }
                
                .sidebar-profile {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 18px;
                    margin: 0 16px 24px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .sidebar-profile:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.12);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                }
                .sidebar.collapsed .sidebar-profile {
                    padding: 14px 8px;
                    justify-content: center;
                    border-radius: 12px;
                }

                .profile-avatar-wrapper {
                    position: relative;
                }

                .simple-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #EE5D50 0%, #FF3D00 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(238, 93, 80, 0.3);
                }
                .sidebar.collapsed .simple-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                }
                .simple-avatar-img { 
                    width: 100%; 
                    height: 100%; 
                    border-radius: 14px; 
                    object-fit: cover; 
                }
                .sidebar.collapsed .simple-avatar-img { border-radius: 10px; }
                .simple-avatar-initial { 
                    font-size: 16px; 
                    font-weight: 800; 
                }

                .online-indicator {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background-color: #05CD99;
                    border-radius: 50%;
                    border: 2px solid #0B1120;
                    box-shadow: 0 0 6px rgba(5, 205, 153, 0.5);
                }

                .simple-details {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    flex: 1;
                    min-width: 0;
                }
                .simple-name {
                    color: #ffffff;
                    font-size: 15px;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    letter-spacing: 0.2px;
                }
                .simple-role {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    font-weight: 500;
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
                    display: flex; align-items: center; padding: 12px 16px; min-height: 48px;
                    color: rgba(255, 255, 255, 0.65); border-radius: 12px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none; font-weight: 600; font-size: 14px; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer;
                }
                .sidebar.collapsed .nav-item { padding: 12px; justify-content: center; }
                
                .item-icon-wrapper { display: flex; align-items: center; margin-right: 14px; transition: color 0.3s ease; }
                .sidebar.collapsed .item-icon-wrapper { margin-right: 0; }
                .item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.3px; }
                
                .sidebar-badge {
                    background: linear-gradient(135deg, #EE5D50 0%, #FF3D00 100%); 
                    color: white; font-size: 11px; font-weight: 800;
                    padding: 4px 8px; border-radius: 20px; margin-left: auto;
                    box-shadow: 0 4px 10px rgba(238, 93, 80, 0.3);
                }
                .sidebar-badge-dot {
                    position: absolute; top: 10px; right: 10px; width: 8px; height: 8px;
                    background: #EE5D50; border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(238, 93, 80, 0.4);
                }
                
                .nav-item:hover { 
                    background: rgba(255,255,255,0.06); 
                    color: #ffffff; 
                    transform: translateX(4px);
                }
                .sidebar.collapsed .nav-item:hover { transform: translateY(-2px); }
                .nav-item:hover .item-icon-wrapper { color: #ffffff; }
                
                .nav-item.active { 
                    background: var(--primary);
                    color: #ffffff !important; 
                    font-weight: 700; 
                    box-shadow: 0 6px 16px rgba(67, 24, 255, 0.3);
                }
                .nav-item.active .item-icon-wrapper { color: #ffffff !important; }
                .active-arrow { margin-left: auto; color: #ffffff; opacity: 0.9; }
                
                .logout-btn { color: rgba(255, 255, 255, 0.65); margin-top: auto; }
                .logout-btn:hover { color: #ffffff; background: rgba(238, 93, 80, 0.15); box-shadow: none; }
                .logout-btn:hover .item-icon-wrapper { color: #EE5D50; }

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
