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
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border-right: 1px solid var(--border);
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
                    padding: 0 24px 28px;
                    border-bottom: 1px solid rgba(6, 182, 212, 0.1);
                    margin-bottom: 20px;
                }
                .sidebar-logo h2 {
                    font-size: 24px;
                    font-family: 'Share Tech Mono', monospace;
                    letter-spacing: 1px;
                }
                .close-sidebar {
                    background: transparent;
                    color: var(--text-main);
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .sidebar-nav {
                    flex: 1;
                    padding: 0 16px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .sidebar-nav::-webkit-scrollbar {
                    width: 3px;
                }
                .sidebar-nav::-webkit-scrollbar-thumb {
                    background: rgba(6, 182, 212, 0.1);
                    border-radius: 4px;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 18px;
                    color: var(--text-muted);
                    border-radius: 4px;
                    transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 13px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    border-left: 2px solid transparent;
                }
                .nav-item:hover {
                    background: rgba(6, 182, 212, 0.05);
                    color: var(--cyber-blue);
                    transform: translateX(4px);
                    border-left-color: var(--cyber-blue);
                }
                .nav-item.active {
                    background: var(--primary-gradient);
                    color: white;
                    border-left-color: var(--cyber-pink);
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.25);
                }
                .nav-item.active:hover {
                    transform: none;
                    background: var(--primary-gradient);
                    color: white;
                }
                .sidebar-footer {
                    padding: 20px 16px 0;
                    border-top: 1px solid rgba(6, 182, 212, 0.1);
                }
                .logout-btn {
                    width: 100%;
                    background: transparent;
                    border: none;
                    text-align: left;
                }
                .logout-btn:hover {
                    color: var(--cyber-pink);
                    background: rgba(244, 63, 94, 0.08);
                    transform: translateX(4px);
                    border-left-color: var(--cyber-pink);
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
