import React, { useState, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, ShoppingCart, Users, Briefcase, Settings as SettingsIcon,
    Home, BarChart2, CheckSquare, Bell, UserPlus, DollarSign, Box, Truck, 
    Clock, Calendar, Wallet, HelpCircle, User, Map, List, Moon, ChevronRight, ChevronDown, 
    PanelLeftClose, LogOut
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
                        <Box size={24} strokeWidth={2.5} />
                    </div>
                    <div className="farmaku-logo-text-wrapper">
                        <span className="farmaku-logo-text">SMTBMS</span>
                        <span className="farmaku-logo-subtext">Smart Material Tracking &<br/>Business Management System</span>
                    </div>
                </div>
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
                            <NavLink to="/tasks" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
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
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/notifications" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <Bell size={20} />
                                <span>Notifications</span>
                                <div style={{marginLeft: 'auto', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>4</div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profile" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <User size={20} />
                                <span>Profile</span>
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <SettingsIcon size={20} />
                                <span>Settings</span>
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                        <li>
                            <div className="farmaku-nav-item" onClick={logout} style={{marginTop: '8px'}}>
                                <LogOut size={20} />
                                <span>Logout</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="farmaku-sidebar-footer" style={{ padding: '0', display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', borderTop: '1px solid #334155', cursor: 'pointer', marginTop: 'auto' }}>
                <div style={{ flex: 1, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
                    <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                    <span>Collapse</span>
                </div>
                <div style={{ padding: '16px 20px', borderLeft: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <SettingsIcon size={16} />
                </div>
            </div>
        </aside>
    );
};

export default FarmakuSidebar;
