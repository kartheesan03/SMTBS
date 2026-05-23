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
        { path: '/settings', name: 'My Profile', icon: <Settings size={20} /> },
    ];

    const hrMenu = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/hrms', name: 'Employees', icon: <Users size={20} /> },
        { path: '/attendance', name: 'Attendance', icon: <CheckCircle size={20} /> },
        { path: '/leave-management', name: 'Leave Management', icon: <Calendar size={20} /> },
        { path: '/payroll', name: 'Payroll', icon: <DollarSign size={20} /> },
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
                    <h2 className="title-gradient">SMTBMS</h2>
                </div>
                <button className="close-sidebar mobile-only" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn nav-item">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            <style jsx="true">{`
                .sidebar {
                    width: 260px;
                    height: 100vh;
                    background: var(--glass);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    padding: 20px 0;
                    z-index: 1000;
                    transition: transform 0.3s ease;
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 25px 30px;
                }
                .sidebar-logo {
                    padding: 0;
                }
                .close-sidebar {
                    background: transparent;
                    color: var(--text-main);
                    padding: 0;
                }
                .sidebar-nav {
                    flex: 1;
                    padding: 0 15px;
                    overflow-y: auto;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    color: var(--text-muted);
                    border-radius: 10px;
                    margin-bottom: 5px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .nav-item:hover, .nav-item.active {
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--primary);
                }
                .nav-item.active {
                    background: var(--primary);
                    color: white;
                }
                .sidebar-footer {
                    padding: 0 15px;
                    border-top: 1px solid var(--border);
                    padding-top: 20px;
                }
                .logout-btn {
                    width: 100%;
                    background: transparent;
                    border: none;
                    text-align: left;
                }
                .logout-btn:hover {
                    color: var(--danger);
                    background: rgba(239, 68, 68, 0.1);
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
