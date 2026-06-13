import React, { useContext, useEffect } from 'react';
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
    Settings,
    LogOut,
    Calendar,
    CheckCircle,
    DollarSign,
    PhoneCall,
    X,
    LifeBuoy,
    Shield,
    FileText,
    Plug,
    Database,
    HelpCircle
} from 'lucide-react';

const Sidebar = ({ logout, isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const location = useLocation();

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (window.innerWidth <= 768) {
            onClose();
        }
    }, [location, onClose]);
    
    const adminMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={20} /> },
        { path: '/hrms', name: 'HRMS', icon: <Users size={20} /> },
        { path: '/erp', name: 'ERP', icon: <ShoppingCart size={20} /> },
        { path: '/materials', name: 'Material Tracking', icon: <Box size={20} /> },
        { path: '/vendors', name: 'Supplier/Vendor', icon: <Plug size={20} /> },
        { path: '/crm', name: 'Customers', icon: <Briefcase size={20} /> },
        { path: '/analytics', name: 'Reports & Analytics', icon: <BarChart3 size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
    ];

    const employeeMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/my-tasks', name: 'My Tasks', icon: <Box size={20} /> },
        { path: '/materials', name: 'Material Tracking', icon: <Briefcase size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/my-salary', name: 'My Payslips', icon: <DollarSign size={20} /> },
        { path: '/leave-management', name: 'Leave Management', icon: <Calendar size={20} /> },
        { path: '/erp', name: 'Orders (ERP)', icon: <ShoppingCart size={20} /> },
        { path: '/stock-requests', name: 'Stock Requests', icon: <Box size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
    ];

    const hrMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/hrms', name: 'Employees', icon: <Users size={20} /> },
        { path: '/my-tasks', name: 'Task Management', icon: <Box size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={20} /> },
        { path: '/leave-management', name: 'Leave Management', icon: <Calendar size={20} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={20} /> },
        { path: '/erp', name: 'Orders (ERP)', icon: <ShoppingCart size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
        { path: '/hr-reports', name: 'Reports', icon: <BarChart3 size={20} /> },
    ];

    const managerMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/attendance', name: 'Master Attendance', icon: <Users size={20} /> },
        { path: '/erp', name: 'Orders / Projects', icon: <ShoppingCart size={20} /> },
        { path: '/my-tasks', name: 'Task Management', icon: <Box size={20} /> },
        { path: '/team-performance', name: 'Team Performance', icon: <Users size={20} /> },
        { path: '/materials', name: 'Materials Overview', icon: <Briefcase size={20} /> },
        { path: '/vendors', name: 'Supplier/Vendor', icon: <Plug size={20} /> },
        { path: '/crm', name: 'Customers', icon: <Briefcase size={20} /> },
        { path: '/stock-requests', name: 'Stock Requests', icon: <Box size={20} /> },
        { path: '/analytics', name: 'Reports', icon: <BarChart3 size={20} /> },
        { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
    ];

    const salesMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/my-tasks', name: 'My Tasks', icon: <Box size={20} /> },
        { path: '/my-attendance', name: 'My Attendance', icon: <CheckCircle size={20} /> },
        { path: '/crm', name: 'Customers (CRM)', icon: <Briefcase size={20} /> },
        { path: '/erp', name: 'Orders (ERP)', icon: <ShoppingCart size={20} /> },
        { path: '/stock-requests', name: 'Stock Deliveries', icon: <Box size={20} /> },
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
                <NavLink to="/profile" className="sidebar-user-card" style={{ textDecoration: 'none' }}>
                    <div className="user-avatar-wrapper">
                        <div className="user-avatar-circle">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=2563eb&color=fff`} alt="User Avatar" />
                        </div>
                    </div>
                    <div className="user-details">
                        <h4 className="user-name" style={{color: '#ffffff'}}>{user?.name || 'Admin User'}</h4>
                        <span className="user-role" style={{color: '#94a3b8'}}>{isAdmin ? 'Super Admin' : user?.role}</span>
                        <div className="user-status">
                            <span className="status-dot"></span>
                            <span className="status-text">Online</span>
                        </div>
                    </div>
                </NavLink>
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
                        {item.name === 'Notifications' && unreadCount > 0 && (
                            <span className="sidebar-badge">{unreadCount}</span>
                        )}
                        {/* Nested style chevrons for items to match reference image */}
                        {(item.name === 'Dashboard' || item.name === 'Material Tracking' || item.name === 'HRMS' || item.name === 'ERP' || item.name === 'Customers' || item.name === 'Reports & Analytics' || item.name === 'Supplier/Vendor' || item.name === 'Vendors/Suppliers') && (
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
                    width: var(--sidebar-width, 260px);
                    height: 100vh;
                    background: #0f172a; /* Dark Blue Sidebar */
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    padding: 24px 0;
                    z-index: 1000;
                    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px 24px;
                }
                .sidebar-logo h2 {
                    font-size: 22px;
                    font-weight: 900;
                    font-family: 'Inter', sans-serif;
                    color: #ffffff;
                    letter-spacing: -0.5px;
                }
                .close-sidebar {
                    background: transparent;
                    color: var(--text-primary);
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Sidebar User Card Section */
                .sidebar-user-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    margin: 0 16px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: var(--radius-md, 12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .user-avatar-wrapper {
                    position: relative;
                }
                .user-avatar-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
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
                    color: var(--text-primary);
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.2;
                }
                .user-role {
                    color: var(--text-muted);
                    font-size: 11px;
                    font-weight: 500;
                    margin-top: 2px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                .user-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 4px;
                }
                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--success);
                    box-shadow: 0 0 6px var(--success);
                }
                .status-text {
                    color: var(--success);
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .sidebar-nav {
                    flex: 1;
                    padding: 0 16px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    color: var(--text-sidebar);
                    border-radius: var(--radius-md, 12px);
                    transition: all 0.2s ease;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 14px;
                    text-decoration: none;
                    position: relative;
                }
                .item-icon-wrapper {
                    display: flex;
                    align-items: center;
                    margin-right: 14px;
                    color: var(--text-sidebar);
                    transition: color 0.2s ease;
                }
                .item-name {
                    flex: 1;
                }
                .chevron-indicator {
                    font-size: 12px;
                    color: var(--text-sidebar);
                    margin-left: auto;
                }
                .sidebar-badge {
                    background: var(--danger, #ef4444);
                    color: white;
                    font-size: 10px;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 10px;
                    margin-left: auto;
                }
                
                .nav-item:hover {
                    background: var(--bg-sidebar-hover);
                    color: var(--text-sidebar-hover);
                }
                .nav-item:hover .item-icon-wrapper {
                    color: var(--text-sidebar-hover);
                }
                
                .nav-item.active {
                    background: var(--bg-sidebar-active);
                    color: var(--text-sidebar-active) !important;
                    font-weight: 600;
                }
                .nav-item.active::before {
                    display: none;
                }
                .nav-item.active .item-icon-wrapper {
                    color: var(--text-sidebar-active) !important;
                }
                .nav-item.active .chevron-indicator {
                    color: var(--text-sidebar-active);
                }
                
                .sidebar-footer {
                    padding: 16px;
                    margin-top: auto;
                }
                .logout-btn {
                    width: 100%;
                    background: transparent;
                    border: none;
                    text-align: left;
                    color: var(--text-sidebar);
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 16px;
                }
                .logout-btn:hover {
                    color: var(--danger);
                    background: var(--danger-light);
                    border-radius: var(--radius-md, 12px);
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
