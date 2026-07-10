import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, ShoppingCart, Users, Briefcase, Settings as SettingsIcon,
    ChevronLeft, ChevronRight, LogOut, Home, BarChart2, CheckSquare, Bell,
    UserPlus, FileText, DollarSign, Box, Truck, Clock, Calendar, Wallet, Package,
    HelpCircle, User, Activity, List, Key, Shield, PieChart, Info, Map, 
    BookOpen, Layers, Archive, PackageCheck, Target, Navigation, ScanLine, TrendingUp, Camera
} from 'lucide-react';
import SmtbmsLogo from './SmtbmsLogo';
import UserAvatar from './UserAvatar';
import './DualSidebar.css';

const DualSidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const hasPerm = (perm) => user?.permissions?.includes(perm) || user?.permissions?.includes("all");
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isExpanded, setIsExpanded] = useState(true);
    const [activePrimaryTab, setActivePrimaryTab] = useState('dashboard');
    const [darkMode, setDarkMode] = useState(false);

    // Determine active primary tab based on current path
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/attendance')) {
            setActivePrimaryTab('attendance');
        } else if (path.startsWith('/hrms') || path.startsWith('/payroll') || path.startsWith('/leave') || path.startsWith('/my-salary') || path.startsWith('/employee')) {
            setActivePrimaryTab('hrms');
        } else if (path.startsWith('/material') || path.startsWith('/my-materials') || path.startsWith('/stock') || path.startsWith('/vendor') || path.startsWith('/tracking-overview') || path.startsWith('/gps-tracking')) {
            setActivePrimaryTab('materials');
        } else if (path.startsWith('/crm') || path.startsWith('/customer') || path.startsWith('/lead') || path.startsWith('/opportunities') || path.startsWith('/follow-ups') || path.startsWith('/quotation') || path.startsWith('/sales')) {
            setActivePrimaryTab('crm');
        } else if (path.startsWith('/erp') || path.startsWith('/order') || path.startsWith('/inventory') || path.startsWith('/finance') || path.startsWith('/assets')) {
            setActivePrimaryTab('erp');
        } else if (path.startsWith('/task') || path.startsWith('/my-tasks')) {
            setActivePrimaryTab('tasks');
        } else if (path.startsWith('/report')) {
            setActivePrimaryTab('reports');
        } else if (path.startsWith('/support')) {
            setActivePrimaryTab('support');
        } else if (path.startsWith('/notification')) {
            setActivePrimaryTab('notifications');
        } else if (path.startsWith('/profile')) {
            setActivePrimaryTab('profile');
        } else if (path.startsWith('/setting')) {
            setActivePrimaryTab('settings');
        } else {
            setActivePrimaryTab('dashboard');
        }
    }, [location]);

    const handleConfirmLogout = () => {
        logout();
        navigate('/login');
    };

    const navigationConfig = {
        dashboard: {
            title: 'Dashboard',
            sections: [
                {
                    title: 'OVERVIEW',
                    links: [
                        { name: 'Dashboard', path: '/', icon: <Home /> },
                    ]
                }
            ]
        },
        attendance: {
            title: 'Attendance',
            sections: [
                {
                    title: 'TIME & ATTENDANCE',
                    links: [
                        { name: 'My Attendance', path: '/attendance/my', icon: <Clock /> },
                        { name: 'Master Attendance', path: '/attendance', icon: <List /> }
                    ]
                }
            ]
        },
        hrms: {
            title: 'HRMS',
            sections: [
                {
                    title: 'HUMAN RESOURCES',
                    links: [
                        { name: 'Employee Management', path: '/hrms', icon: <Users /> },
                        { name: 'Leave Management', path: '/leave-management', icon: <Calendar /> },
                        { name: 'Payroll', path: '/payroll', icon: <DollarSign /> },
                        { name: 'My Salary', path: '/my-salary', icon: <Wallet /> },
                    ]
                }
            ]
        },
        materials: {
            title: 'Material Management',
            sections: [
                {
                    title: 'MATERIALS',
                    links: [
                        { name: 'Materials', path: '/materials', icon: <Box /> },
                        { name: 'Material Tracking', path: '/tracking-overview', icon: <Map /> },
                        { name: 'Stock Request', path: '/stock-requests', icon: <Package /> },
                        { name: 'Vendors', path: '/vendors', icon: <Users /> },
                        { name: 'Barcode / QR', path: '/materials/barcode', icon: <ScanLine /> },
                        { name: 'Scanner (Employee)', path: '/my-materials/barcode', icon: <Camera /> },
                        { name: 'GPS Tracking', path: '/gps-tracking', icon: <Truck /> },
                    ]
                }
            ]
        },
        crm: {
            title: 'CRM',
            sections: [
                {
                    title: 'CUSTOMER RELATIONS',
                    links: [
                        { name: 'CRM Dashboard', path: '/crm', icon: <Users /> },
                        { name: 'Quotations', path: '/quotations', icon: <FileText /> },
                        { name: 'Sales Goals', path: '/sales/goals', icon: <Target /> }
                    ]
                }
            ]
        },
        erp: {
            title: 'ERP',
            sections: [
                {
                    title: 'ENTERPRISE RESOURCE',
                    links: [
                        { name: 'ERP Dashboard', path: '/erp', icon: <ShoppingCart /> },
                        { name: 'Order Pipeline', path: '/order-kanban', icon: <Map /> }
                    ]
                }
            ]
        },
        tasks: {
            title: 'Task Management',
            sections: [
                {
                    title: 'TASKS',
                    links: [
                        { name: 'My Tasks', path: '/my-tasks', icon: <CheckSquare /> }
                    ]
                }
            ]
        },
        reports: {
            title: 'Reports',
            sections: [
                {
                    title: 'ANALYTICS & EXPORT',
                    links: [
                        { name: 'Reports', path: '/reports', icon: <BarChart2 /> }
                    ]
                }
            ]
        },
        support: {
            title: 'Support',
            sections: [
                {
                    title: 'HELP DESK',
                    links: [
                        { name: 'Support', path: '/support', icon: <HelpCircle /> }
                    ]
                }
            ]
        },
        notifications: {
            title: 'Notifications',
            sections: [
                {
                    title: 'ALERTS',
                    links: [
                        { name: 'Notifications', path: '/notifications', icon: <Bell /> }
                    ]
                }
            ]
        },
        profile: {
            title: 'Profile',
            sections: [
                {
                    title: 'ACCOUNT',
                    links: [
                        { name: 'Profile', path: '/profile', icon: <User /> }
                    ]
                }
            ]
        },
        settings: {
            title: 'Administration',
            sections: [
                {
                    title: 'ADMINISTRATION',
                    links: [
                        { name: 'Dashboard', path: '/', icon: <LayoutDashboard /> },
                        { name: 'Users', path: '/hrms', icon: <Users /> },
                        { name: 'Roles & Permissions', path: '/settings/roles', icon: <Shield /> },
                        { name: 'System Settings', path: '/settings/system', icon: <SettingsIcon /> },
                        { name: 'Backup & Restore', path: '/settings/backup', icon: <Archive /> },
                        { name: 'Audit Logs', path: '/settings/audit-logs', icon: <Activity /> }
                    ]
                }
            ]
        }
    };

    const currentNav = navigationConfig[activePrimaryTab];

    return (
        <div className={`dual-sidebar-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="primary-sidebar" style={{overflowY: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none'}}>
                <div className="ps-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                
                <div className="ps-nav" style={{flex: 1}}>
                    <button className={`ps-nav-item ${activePrimaryTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('dashboard'); setIsExpanded(true); }} title="Dashboard">
                        <LayoutDashboard size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'attendance' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('attendance'); setIsExpanded(true); }} title="Attendance">
                        <Clock size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'hrms' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('hrms'); setIsExpanded(true); }} title="HRMS">
                        <Users size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'materials' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('materials'); setIsExpanded(true); }} title="Material Management">
                        <Box size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'crm' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('crm'); setIsExpanded(true); }} title="CRM">
                        <Briefcase size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'erp' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('erp'); setIsExpanded(true); }} title="ERP">
                        <ShoppingCart size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'tasks' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('tasks'); setIsExpanded(true); }} title="Task Management">
                        <CheckSquare size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'reports' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('reports'); setIsExpanded(true); }} title="Reports">
                        <BarChart2 size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'support' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('support'); setIsExpanded(true); }} title="Support">
                        <HelpCircle size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'notifications' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('notifications'); setIsExpanded(true); }} title="Notifications">
                        <Bell size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'profile' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('profile'); setIsExpanded(true); }} title="Profile">
                        <User size={24} />
                    </button>
                    <button className={`ps-nav-item ${activePrimaryTab === 'settings' ? 'active' : ''}`} onClick={() => { setActivePrimaryTab('settings'); setIsExpanded(true); }} title="Settings">
                        <SettingsIcon size={24} />
                    </button>
                </div>

                <div className="ps-bottom">
                    <button className="ps-toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </div>

            <div className="secondary-sidebar">
                <div className="ss-header">
                    <SmtbmsLogo size={26} />
                    <button className="ss-close-btn" onClick={() => setIsExpanded(false)}>
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <div className="ss-content">
                    {currentNav.sections.map((section, idx) => (
                        <div key={idx} className="ss-section">
                            <span className="ss-section-title">{section.title}</span>
                            {section.links.map((link, lIdx) => (
                                <NavLink 
                                    key={lIdx} 
                                    to={link.path} 
                                    className={({isActive}) => isActive ? "ss-link active" : "ss-link"}
                                >
                                    {link.icon}
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="ss-profile">
                    <div className="ss-toggle-row">
                        <div className="ss-toggle-label">
                            <SettingsIcon />
                            Dark mode
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="ss-profile-info">
                        <UserAvatar
                            src={user?.picture || user?.avatar}
                            name={user?.name || 'Admin'}
                            size={40}
                        />
                        <div className="ss-profile-text">
                            <span className="ss-profile-name">{user?.name || 'System Admin'}</span>
                            <span className="ss-profile-role">{user?.role || 'Admin'}</span>
                        </div>
                    </div>

                    <button className="ss-logout-btn" onClick={handleConfirmLogout}>
                        <LogOut size={16} /> Log out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DualSidebar;
