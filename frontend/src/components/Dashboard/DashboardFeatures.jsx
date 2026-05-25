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
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
                    height: 100%;
                }
                .features-sidebar-title {
                    font-size: 15px;
                    font-weight: 800;
                    color: #1e3a8a; /* Deep primary color header */
                    letter-spacing: 0.5px;
                    margin-bottom: 24px;
                    border-bottom: 2px solid #eff6ff;
                    padding-bottom: 12px;
                }
                .features-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    transition: transform 0.2s ease;
                }
                .feature-item:hover {
                    transform: translateX(4px);
                }
                .feature-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 42px;
                    border-radius: 10px;
                    flex-shrink: 0;
                }
                .feature-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .feature-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }
                .feature-desc {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
};

export default DashboardFeatures;
