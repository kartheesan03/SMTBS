import React, { useState, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, ShoppingCart, Users, Briefcase, Settings as SettingsIcon,
    Home, BarChart2, CheckSquare, Bell, UserPlus, DollarSign, Box, Truck, 
    Clock, Calendar, Wallet, HelpCircle, User, Map, List, Moon, ChevronRight, ChevronDown, 
    PanelLeftClose
} from 'lucide-react';
import './FarmakuSidebar.css';

const FarmakuSidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const toggleMenu = (menu) => {
        if (expandedMenu === menu) {
            setExpandedMenu('');
        } else {
            setExpandedMenu(menu);
        }
    };

    const isPathActive = (paths) => {
        if (Array.isArray(paths)) {
            return paths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
        }
        return location.pathname === paths;
    };

    return (
        <aside className="farmaku-sidebar">
            <div className="farmaku-sidebar-header">
                <div className="farmaku-logo-container">
                    <div className="farmaku-logo-icon">
                        {/* Custom Medical Cross Logo inspired by the Dribbble shot */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 2V11H2V13H11V22H13V13H22V11H13V2H11Z" fill="currentColor"/>
                            <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M5 5L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <span className="farmaku-logo-text">Farmaku</span>
                </div>
                <button className="farmaku-collapse-btn">
                    <PanelLeftClose size={18} />
                </button>
            </div>

            <div className="farmaku-sidebar-content">
                <div className="farmaku-nav-group">
                    <div className="farmaku-nav-title">MENU</div>
                    <ul className="farmaku-nav-list">
                        <li>
                            <NavLink to="/" className={({isActive}) => isActive && location.pathname === '/' ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </NavLink>
                        </li>

                        <li>
                            <div className={`farmaku-nav-item ${isPathActive(['/hrms', '/leave-management', '/payroll', '/my-salary']) ? 'active' : ''}`} onClick={() => toggleMenu('hrms')}>
                                <Users size={20} />
                                <span>HRMS</span>
                                {expandedMenu === 'hrms' ? <ChevronDown size={16} style={{marginLeft: 'auto'}} /> : <ChevronRight size={16} style={{marginLeft: 'auto'}} />}
                            </div>
                            {expandedMenu === 'hrms' && (
                                <div className="farmaku-submenu">
                                    <NavLink to="/hrms" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Employee Management</NavLink>
                                    <NavLink to="/leave-management" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Leave Management</NavLink>
                                    <NavLink to="/payroll" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Payroll</NavLink>
                                    <NavLink to="/my-salary" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>My Salary</NavLink>
                                </div>
                            )}
                        </li>

                        <li>
                            <div className={`farmaku-nav-item ${isPathActive(['/materials', '/tracking-overview', '/stock-requests', '/vendors']) ? 'active' : ''}`} onClick={() => toggleMenu('materials')}>
                                <Box size={20} />
                                <span>Materials</span>
                                {expandedMenu === 'materials' ? <ChevronDown size={16} style={{marginLeft: 'auto'}} /> : <ChevronRight size={16} style={{marginLeft: 'auto'}} />}
                            </div>
                            {expandedMenu === 'materials' && (
                                <div className="farmaku-submenu">
                                    <NavLink to="/materials" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Materials</NavLink>
                                    <NavLink to="/tracking-overview" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Material Tracking</NavLink>
                                    <NavLink to="/stock-requests" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Stock Request</NavLink>
                                    <NavLink to="/vendors" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Vendors</NavLink>
                                </div>
                            )}
                        </li>

                        <li>
                            <NavLink to="/erp" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <ShoppingCart size={20} />
                                <span>ERP</span>
                            </NavLink>
                        </li>

                        <li>
                            <div className={`farmaku-nav-item ${isPathActive(['/attendance', '/attendance/my']) ? 'active' : ''}`} onClick={() => toggleMenu('attendance')}>
                                <Clock size={20} />
                                <span>Attendance</span>
                                {expandedMenu === 'attendance' ? <ChevronDown size={16} style={{marginLeft: 'auto'}} /> : <ChevronRight size={16} style={{marginLeft: 'auto'}} />}
                            </div>
                            {expandedMenu === 'attendance' && (
                                <div className="farmaku-submenu">
                                    <NavLink to="/attendance/my" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>My Attendance</NavLink>
                                    <NavLink to="/attendance" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Master Attendance</NavLink>
                                </div>
                            )}
                        </li>

                        <li>
                            <NavLink to="/crm" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <Briefcase size={20} />
                                <span>CRM</span>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/my-tasks" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <CheckSquare size={20} />
                                <span>Tasks</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <div className="farmaku-nav-group">
                    <div className="farmaku-nav-title">OTHERS</div>
                    <ul className="farmaku-nav-list">
                        <li>
                            <NavLink to="/reports" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <BarChart2 size={20} />
                                <span>Reports</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/notifications" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <Bell size={20} />
                                <span>Notifications</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profile" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <User size={20} />
                                <span>Profile</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="farmaku-sidebar-footer">
                <div className="farmaku-nav-title">PREFERENCES</div>
                <ul className="farmaku-footer-list">
                    <li>
                        <div className="farmaku-theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                            <div className="farmaku-theme-toggle-left">
                                <Moon size={20} />
                                <span>Dark Mode</span>
                            </div>
                            <div className="farmaku-switch" style={{ backgroundColor: darkMode ? '#0f172a' : '#e2e8f0' }}>
                                <div style={{
                                    width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#fff',
                                    position: 'absolute', top: '2px', left: darkMode ? '16px' : '2px', transition: 'left 0.2s'
                                }} />
                            </div>
                        </div>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"} style={{marginTop: '4px'}}>
                            <SettingsIcon size={20} />
                            <span>Settings</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/support" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"} style={{marginTop: '4px'}}>
                            <HelpCircle size={20} />
                            <span>Help</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default FarmakuSidebar;
