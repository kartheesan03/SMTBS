import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, UserPlus, FileText, 
    ShoppingCart, Package, Briefcase, Activity, 
    BarChart2, Shield, Search, Star, Clock, X 
} from 'lucide-react';
import './ModuleLauncher.css';

const ModuleLauncher = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const modules = [
        { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={24} />, path: '/', color: '#3b82f6' },
        { id: 'hrms', name: 'HRMS', icon: <Users size={24} />, path: '/hrms', color: '#10b981' },
        { id: 'crm', name: 'CRM & Sales', icon: <UserPlus size={24} />, path: '/crm', color: '#f59e0b' },
        { id: 'inventory', name: 'Inventory', icon: <Package size={24} />, path: '/materials', color: '#6366f1' },
        { id: 'procurement', name: 'Procurement', icon: <ShoppingCart size={24} />, path: '/erp', color: '#ec4899' },
        { id: 'payroll', name: 'Payroll', icon: <FileText size={24} />, path: '/payroll', color: '#8b5cf6' },
        { id: 'analytics', name: 'Analytics', icon: <BarChart2 size={24} />, path: '/analytics', color: '#14b8a6' },
        { id: 'settings', name: 'Settings', icon: <Shield size={24} />, path: '/settings', color: '#64748b' }
    ];

    const quickLinks = [
        { name: 'Add Employee', path: '/hrms/add-employee' },
        { name: 'Create Order', path: '/orders/select-type' },
        { name: 'Apply Leave', path: '/leave-management/apply' },
        { name: 'Generate Payroll', path: '/payroll/generate' }
    ];

    const recentPages = [
        { name: 'Inventory List', path: '/materials' },
        { name: 'Active Projects', path: '/erp' },
        { name: 'Team Performance', path: '/team-performance' }
    ];

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            <div className="module-launcher-overlay" onClick={onClose}></div>
            <div className="module-launcher">
                <div className="ml-header">
                    <h2>Apps & Modules</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="ml-search">
                            <Search size={16} className="ml-search-icon" />
                            <input type="text" placeholder="Search modules..." />
                        </div>
                        <button 
                            onClick={onClose} 
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer', 
                                color: '#64748b', 
                                padding: '4px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="ml-body">
                    <div className="ml-main-grid">
                        <h3 className="section-title">All Modules</h3>
                        <div className="modules-grid">
                            {modules.map((mod) => (
                                <button 
                                    key={mod.id} 
                                    className="module-card"
                                    onClick={() => handleNavigate(mod.path)}
                                >
                                    <div className="module-icon" style={{ backgroundColor: `${mod.color}15`, color: mod.color }}>
                                        {mod.icon}
                                    </div>
                                    <span className="module-name">{mod.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ml-sidebar">
                        <div className="ml-quick-section">
                            <h3 className="section-title"><Star size={14}/> Quick Actions</h3>
                            <div className="ml-links">
                                {quickLinks.map((link, i) => (
                                    <button key={i} onClick={() => handleNavigate(link.path)} className="ml-link-btn">
                                        {link.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="ml-quick-section">
                            <h3 className="section-title"><Clock size={14}/> Recent Pages</h3>
                            <div className="ml-links">
                                {recentPages.map((link, i) => (
                                    <button key={i} onClick={() => handleNavigate(link.path)} className="ml-link-btn">
                                        {link.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModuleLauncher;
