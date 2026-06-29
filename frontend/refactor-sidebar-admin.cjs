const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'FarmakuSidebar.jsx');

const content = `import React, { useState, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { 
    LayoutDashboard, ShoppingCart, Users, Briefcase, Settings as SettingsIcon,
    BarChart2, Bell, Box, Clock, ChevronRight, ChevronDown, 
    LogOut, Shield, RefreshCw, Link as LinkIcon, ClipboardList, HelpCircle, Activity, UserCog
} from 'lucide-react';
import './FarmakuSidebar.css';

const FarmakuSidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const hasPerm = (perm) => user?.permissions?.includes(perm) || user?.permissions?.includes("all");
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState('');

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

            <div className="farmaku-sidebar-content" style={{ padding: '0 16px' }}>
                <ul className="farmaku-nav-list" style={{ marginTop: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
                    <li>
                        <NavLink to="/" className={({isActive}) => isActive && location.pathname === '/' ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                            <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                        </NavLink>
                    </li>

                    {hasPerm('view_materials') && ( <li>
                        <div className={\`farmaku-nav-item \${isPathActive(['/materials', '/tracking-overview', '/stock-requests', '/vendors']) || expandedMenu === 'materials' ? 'active' : ''}\`} onClick={() => toggleMenu('materials')}>
                            <Box size={20} />
                            <span>Material Tracking</span>
                            {expandedMenu === 'materials' ? <ChevronDown size={16} style={{marginLeft: 'auto'}} /> : <ChevronRight size={16} style={{marginLeft: 'auto'}} />}
                        </div>
                        {expandedMenu === 'materials' && (
                            <div className="farmaku-submenu">
                                <NavLink to="/materials" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Materials</NavLink>
                                <NavLink to="/tracking-overview" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Tracking Overview</NavLink>
                                <NavLink to="/stock-requests" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Stock Request</NavLink>
                                <NavLink to="/vendors" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Vendors</NavLink>
                            </div>
                        )}
                    </li> )}

                    {hasPerm('view_hrms') && ( <li>
                        <div className={\`farmaku-nav-item \${isPathActive(['/hrms', '/leave-management', '/payroll', '/my-salary', '/attendance']) || expandedMenu === 'hrms' ? 'active' : ''}\`} onClick={() => toggleMenu('hrms')}>
                            <Users size={20} />
                            <span>HRMS</span>
                            {expandedMenu === 'hrms' ? <ChevronDown size={16} style={{marginLeft: 'auto'}} /> : <ChevronRight size={16} style={{marginLeft: 'auto'}} />}
                        </div>
                        {expandedMenu === 'hrms' && (
                            <div className="farmaku-submenu">
                                <NavLink to="/hrms" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Employee Management</NavLink>
                                <NavLink to="/attendance" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Attendance</NavLink>
                                <NavLink to="/leave-management" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Leave Management</NavLink>
                                <NavLink to="/payroll" className={({isActive}) => isActive ? "farmaku-subnav-item active" : "farmaku-subnav-item"}>Payroll</NavLink>
                            </div>
                        )}
                    </li> )}

                    {hasPerm('view_erp') && ( <li>
                        <NavLink to="/erp" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <Briefcase size={20} />
                            <span>ERP</span>
                            <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                        </NavLink>
                    </li> )}

                    {hasPerm('view_crm') && ( <li>
                        <NavLink to="/crm" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <Briefcase size={20} />
                            <span>CRM</span>
                            <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                        </NavLink>
                    </li> )}

                    {hasPerm('view_reports') && ( <li>
                        <NavLink to="/analytics" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <BarChart2 size={20} />
                            <span>Reports & Analytics</span>
                            <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                        </NavLink>
                    </li> )}

                    {hasPerm('view_settings') && ( <>
                        <li>
                            <NavLink to="/hrms" className={({isActive}) => isActive && location.pathname === '/hrms' ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <Users size={20} />
                                <span>User Management</span>
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings/roles" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <Shield size={20} />
                                <span>Roles & Permissions</span>
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                    </>)}

                    <li>
                        <NavLink to="/notifications" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <Bell size={20} />
                            <span>Notifications</span>
                            {unreadCount > 0 ? (
                                <div style={{marginLeft: 'auto', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{unreadCount}</div>
                            ) : (
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            )}
                        </NavLink>
                    </li>

                    {hasPerm('view_settings') && ( <>
                        <li>
                            <NavLink to="/settings" className={({isActive}) => isActive && location.pathname === '/settings' ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <SettingsIcon size={20} />
                                <span>System Settings</span>
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings/audit-logs" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <Activity size={20} />
                                <span>Audit Logs</span>
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings/integrations" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <LinkIcon size={20} />
                                <span>Integrations</span>
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings/backup" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                                <RefreshCw size={20} />
                                <span>Backup & Restore</span>
                                <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                            </NavLink>
                        </li>
                    </>)}

                    <li>
                        <NavLink to="/support" className={({isActive}) => isActive ? "farmaku-nav-item active" : "farmaku-nav-item"}>
                            <HelpCircle size={20} />
                            <span>Help & Support</span>
                            <ChevronRight size={16} style={{marginLeft: 'auto'}} />
                        </NavLink>
                    </li>

                    <li>
                        <div className="farmaku-nav-item" onClick={logout} style={{marginTop: '16px'}}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </div>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default FarmakuSidebar;
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Restructured FarmakuSidebar.jsx');
