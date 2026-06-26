import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    Users, 
    Briefcase,
    Settings as SettingsIcon,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Home,
    BarChart2,
    CheckSquare,
    Bell,
    UserPlus,
    FileText,
    DollarSign,
    Box,
    Truck,
    Clock,
    Calendar,
    Wallet,
    HelpCircle,
    User
} from 'lucide-react';
import './DualSidebar.css';

const DualSidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isExpanded, setIsExpanded] = useState(true);
    const [activePrimaryTab, setActivePrimaryTab] = useState('dashboard');
    const [darkMode, setDarkMode] = useState(false);

    // Determine active primary tab based on current path
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/crm') || path.startsWith('/sales') || path.startsWith('/customers')) {
            setActivePrimaryTab('crm');
        } else if (path.startsWith('/erp') || path.startsWith('/orders') || path.startsWith('/vendors') || path.startsWith('/materials') || path.startsWith('/stock-requests') || path.startsWith('/tracking-overview')) {
            setActivePrimaryTab('operations');
        } else if (path.startsWith('/hrms') || path.startsWith('/payroll') || path.startsWith('/attendance') || path.startsWith('/leave-management') || path.startsWith('/my-salary')) {
            setActivePrimaryTab('hrms');
        } else if (path.startsWith('/settings') || path.startsWith('/profile') || path.startsWith('/support')) {
            setActivePrimaryTab('system');
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
            title: 'Overview',
            sections: [
                {
                    title: 'MAIN',
                    links: [
                        { name: 'Dashboard', path: '/', icon: <Home /> },
                        { name: 'My Tasks', path: '/my-tasks', icon: <CheckSquare /> },
                        { name: 'Notifications', path: '/notifications', icon: <Bell /> },
                    ]
                },
                {
                    title: 'ANALYTICS',
                    links: [
                        { name: 'Reports', path: '/analytics', icon: <BarChart2 /> },
                    ]
                }
            ]
        },
        crm: {
            title: 'CRM & Sales',
            sections: [
                {
                    title: 'CUSTOMER MANAGEMENT',
                    links: [
                        { name: 'Customers', path: '/crm/customers', icon: <Users /> },
                        { name: 'Leads', path: '/crm/leads', icon: <UserPlus /> },
                    ]
                },
                {
                    title: 'SALES',
                    links: [
                        { name: 'Pipeline', path: '/crm/pipeline', icon: <BarChart2 /> },
                        { name: 'Quotations', path: '/quotations', icon: <FileText /> },
                        { name: 'Revenue', path: '/sales/revenue', icon: <DollarSign /> },
                    ]
                }
            ]
        },
        operations: {
            title: 'Operations',
            sections: [
                {
                    title: 'SUPPLY CHAIN',
                    links: [
                        { name: 'Orders (ERP)', path: '/erp', icon: <ShoppingCart /> },
                        { name: 'Vendors', path: '/vendors', icon: <Truck /> },
                        { name: 'Materials', path: '/materials', icon: <Box /> },
                    ]
                },
                {
                    title: 'LOGISTICS',
                    links: [
                        { name: 'Stock Requests', path: '/stock-requests', icon: <CheckSquare /> },
                        { name: 'Tracking', path: '/tracking-overview', icon: <Truck /> },
                    ]
                }
            ]
        },
        hrms: {
            title: 'HRMS',
            sections: [
                {
                    title: 'PEOPLE',
                    links: [
                        { name: 'HR Dashboard', path: '/hrms', icon: <Users /> },
                        { name: 'Attendance', path: '/attendance', icon: <Clock /> },
                        { name: 'Leave Management', path: '/leave-management', icon: <Calendar /> },
                    ]
                },
                {
                    title: 'FINANCE',
                    links: [
                        { name: 'Payroll', path: '/payroll', icon: <Wallet /> },
                        { name: 'My Salary', path: '/my-salary', icon: <DollarSign /> },
                    ]
                }
            ]
        },
        system: {
            title: 'System',
            sections: [
                {
                    title: 'PREFERENCES',
                    links: [
                        { name: 'Settings', path: '/settings', icon: <SettingsIcon /> },
                        { name: 'My Profile', path: '/profile', icon: <User /> },
                    ]
                },
                {
                    title: 'HELP',
                    links: [
                        { name: 'Support', path: '/support', icon: <HelpCircle /> },
                    ]
                }
            ]
        }
    };

    const currentNav = navigationConfig[activePrimaryTab];

    return (
        <div className={`dual-sidebar-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {/* Primary Sidebar */}
            <div className="primary-sidebar">
                <div className="ps-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                
                <div className="ps-nav">
                    <button 
                        className={`ps-nav-item ${activePrimaryTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActivePrimaryTab('dashboard'); setIsExpanded(true); }}
                        title="Dashboard"
                    >
                        <LayoutDashboard size={24} />
                    </button>
                    <button 
                        className={`ps-nav-item ${activePrimaryTab === 'crm' ? 'active' : ''}`}
                        onClick={() => { setActivePrimaryTab('crm'); setIsExpanded(true); }}
                        title="CRM & Sales"
                    >
                        <Briefcase size={24} />
                    </button>
                    <button 
                        className={`ps-nav-item ${activePrimaryTab === 'operations' ? 'active' : ''}`}
                        onClick={() => { setActivePrimaryTab('operations'); setIsExpanded(true); }}
                        title="Operations"
                    >
                        <Box size={24} />
                    </button>
                    <button 
                        className={`ps-nav-item ${activePrimaryTab === 'hrms' ? 'active' : ''}`}
                        onClick={() => { setActivePrimaryTab('hrms'); setIsExpanded(true); }}
                        title="HRMS"
                    >
                        <Users size={24} />
                    </button>
                    <button 
                        className={`ps-nav-item ${activePrimaryTab === 'system' ? 'active' : ''}`}
                        onClick={() => { setActivePrimaryTab('system'); setIsExpanded(true); }}
                        title="System"
                    >
                        <SettingsIcon size={24} />
                    </button>
                </div>

                <div className="ps-bottom">
                    <div className="ps-avatar" onClick={() => navigate('/profile')}>
                        <img src={user?.avatar || "https://i.pravatar.cc/150?img=11"} alt={user?.name || 'User'} />
                    </div>
                    <button className="ps-toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </div>

            {/* Secondary Sidebar */}
            <div className="secondary-sidebar">
                <div className="ss-header">
                    <h2>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        SMTBMS
                    </h2>
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
                        <div className="ps-avatar" style={{width: 40, height: 40}}>
                            <img src={user?.avatar || "https://i.pravatar.cc/150?img=11"} alt={user?.name || 'User'} />
                        </div>
                        <div className="ss-profile-text">
                            <span className="ss-profile-name">{user?.name || 'System Admin'}</span>
                            <span className="ss-profile-role">{user?.role || 'Admin Manager'}</span>
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
