import React from 'react';
import { 
    LayoutDashboard, 
    Box, 
    Users, 
    ShoppingCart, 
    Briefcase, 
    BarChart3, 
    UserCheck, 
    Settings, 
    Bell 
} from 'lucide-react';

const DashboardFeatures = () => {
    const features = [
        {
            title: 'Centralized Overview',
            desc: 'Get a real-time snapshot of materials, HR, ERP, CRM and business performance.',
            icon: <LayoutDashboard size={22} />,
            color: '#2563eb',
            bgColor: '#eff6ff'
        },
        {
            title: 'Material Tracking',
            desc: 'Monitor stock, in-transit items, low stock alerts, and material movements.',
            icon: <Box size={22} />,
            color: '#0891b2',
            bgColor: '#ecfeff'
        },
        {
            title: 'HR Management',
            desc: 'Manage employees, attendance, leaves, payroll, performance and more.',
            icon: <Users size={22} />,
            color: '#16a34a',
            bgColor: '#f0fdf4'
        },
        {
            title: 'ERP Operations',
            desc: 'Handle procurement, inventory, orders, vendors, finances and analytics.',
            icon: <ShoppingCart size={22} />,
            color: '#7c3aed',
            bgColor: '#f5f3ff'
        },
        {
            title: 'CRM Management',
            desc: 'Track leads, customers, sales pipeline, communications and support.',
            icon: <Briefcase size={22} />,
            color: '#2563eb',
            bgColor: '#eff6ff'
        },
        {
            title: 'Reports & Analytics',
            desc: 'Generate insightful reports for data-driven decision making.',
            icon: <BarChart3 size={22} />,
            color: '#0891b2',
            bgColor: '#ecfeff'
        },
        {
            title: 'User & Role Management',
            desc: 'Manage users, roles, permissions and access control.',
            icon: <UserCheck size={22} />,
            color: '#2563eb',
            bgColor: '#eff6ff'
        },
        {
            title: 'System Management',
            desc: 'Configure system settings, integrations, backups and audit logs.',
            icon: <Settings size={22} />,
            color: '#475569',
            bgColor: '#f1f5f9'
        },
        {
            title: 'Notifications & Alerts',
            desc: 'Stay updated with real-time notifications and important alerts.',
            icon: <Bell size={22} />,
            color: '#2563eb',
            bgColor: '#eff6ff'
        }
    ];

    return (
        <div className="features-sidebar-card">
            <h3 className="features-sidebar-title">ADMIN DASHBOARD FEATURES</h3>
            <div className="features-list">
                {features.map((feat, idx) => (
                    <div key={idx} className="feature-item">
                        <div 
                            className="feature-icon" 
                            style={{ color: feat.color, backgroundColor: feat.bgColor }}
                        >
                            {feat.icon}
                        </div>
                        <div className="feature-info">
                            <h4 className="feature-title">{feat.title}</h4>
                            <p className="feature-desc">{feat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx="true">{`
                .features-sidebar-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                    height: 100%;
                }
                .features-sidebar-title {
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--primary-700, #4338ca);
                    letter-spacing: 0.3px;
                    margin-bottom: 24px;
                    border-bottom: 2px solid var(--primary-light, #eef2ff);
                    padding-bottom: 12px;
                }
                .features-list {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    padding: 8px;
                    border-radius: var(--radius-md, 12px);
                    transition: all 0.2s ease;
                }
                .feature-item:hover {
                    background: #f8fafc;
                    transform: translateX(2px);
                }
                .feature-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 42px;
                    border-radius: var(--radius-md, 12px);
                    flex-shrink: 0;
                }
                .feature-info {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .feature-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }
                .feature-desc {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin: 0;
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
};

export default DashboardFeatures;
