import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Smile, Zap, DollarSign, ShoppingCart, AlertCircle, Users, Search, Bell, Moon, Briefcase, Activity, Package, FileText, CheckSquare, UserPlus, FilePlus, CheckCircle, RefreshCw, BarChart2 } from 'lucide-react';
import './AdminDashboardPremium.css';

// Animated Counter Component
const AnimatedCounter = ({ value, prefix = '', suffix = '', isCurrency = false }) => {
    // Determine the numeric value to animate
    let numericValue = 0;
    
    if (typeof value === 'number') {
        numericValue = value;
    } else if (typeof value === 'string') {
        // Strip non-numeric characters except decimals to get a clean number for animation
        const parsed = parseFloat(value.replace(/[^0-9.-]+/g,""));
        if (!isNaN(parsed)) {
            numericValue = parsed;
        }
    }

    const springValue = useSpring(0, { bounce: 0, duration: 1500 });
    
    useEffect(() => {
        springValue.set(numericValue);
    }, [numericValue, springValue]);

    const displayValue = useTransform(springValue, (current) => {
        const rounded = isCurrency ? current.toFixed(0) : Math.round(current);
        const formatted = new Intl.NumberFormat('en-US').format(rounded);
        // If the original value was a string with some special formatting not captured by numeric extraction,
        // we fallback to just showing the prefix + number + suffix.
        return `${prefix}${formatted}${suffix}`;
    });

    // If we failed to parse a number (e.g. value is "N/A"), just render it directly
    if (isNaN(numericValue) || (typeof value === 'string' && numericValue === 0 && value !== '0')) {
        return <span>{value}</span>;
    }

    return <motion.span>{displayValue}</motion.span>;
};

// Clean Enterprise KPI Card (Dynamics 365 style)
export const EnterpriseKPICard = ({ 
    title, 
    subtitle,
    value, 
    isCurrency = false,
    prefix = ''
}) => {
    return (
        <motion.div 
            className="erp-card erp-kpi-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="erp-kpi-header">
                <div className="erp-kpi-title-wrapper">
                    <h3 className="erp-kpi-title">{title}</h3>
                    {subtitle && <p className="erp-kpi-subtitle">{subtitle}</p>}
                </div>
            </div>
            
            <div>
                <h2 className="erp-kpi-main-metric">
                    <AnimatedCounter value={value} isCurrency={isCurrency} prefix={prefix} />
                </h2>
            </div>
        </motion.div>
    );
};

export const EmptyState = ({ icon: Icon, title, message }) => {
    return (
        <div className="erp-empty-state">
            {Icon && <Icon size={48} className="erp-empty-icon" />}
            <h3 className="erp-empty-title">{title}</h3>
            <p className="erp-empty-text">{message}</p>
        </div>
    );
};

export const SkeletonCard = () => {
    return (
        <div className="erp-card erp-kpi-card erp-skeleton erp-skeleton-card"></div>
    );
};

export const RoleBasedRenderer = ({ allowedRoles, userRole, children }) => {
    const role = userRole?.toLowerCase() || '';
    if (role === 'admin' || role === 'super admin' || allowedRoles.includes(role)) {
        return <>{children}</>;
    }
    return null;
};

// NEW COMPONENTS FOR REDESIGN

export const TopWelcomeBar = ({ username, data }) => {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    return (
    <div className="erp-premium-top-bar">
        <div className="erp-premium-welcome">
            <h1>{greeting}, {username || 'System Admin'} <span role="img" aria-label="wave">👋</span></h1>
            <p>Here's what's happening with your business today.</p>
        </div>
        <div className="erp-premium-quick-metrics">
            <div className="erp-quick-metric">
                <span className="erp-quick-metric-label">Business Health</span>
                <div className="erp-quick-metric-value-row">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--erp-success-color)' }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{data?.healthStatus || 'Good'}</span>
                    <span className="erp-trend-indicator erp-trend-up erp-trend-pill">{data?.healthScore || 0}%</span>
                </div>
            </div>
            
            <div className="erp-quick-metric">
                <span className="erp-quick-metric-label">Today's Revenue</span>
                <div className="erp-quick-metric-value-row">
                    <span className="erp-quick-metric-val">₹{data?.revenue || 0}</span>
                    {data?.revenueTrend && (
                        <span className={`erp-trend-indicator ${data.revenueTrend >= 0 ? 'erp-trend-up' : 'erp-trend-down'} erp-trend-pill`}>
                            {data.revenueTrend >= 0 ? '↑' : '↓'} {Math.abs(data.revenueTrend)}%
                        </span>
                    )}
                </div>
            </div>

            <div className="erp-quick-metric">
                <span className="erp-quick-metric-label">Today's Orders</span>
                <div className="erp-quick-metric-value-row">
                    <span className="erp-quick-metric-val">{data?.orders || 0}</span>
                    {data?.ordersTrend && (
                        <span className={`erp-trend-indicator ${data.ordersTrend >= 0 ? 'erp-trend-up' : 'erp-trend-down'} erp-trend-pill`}>
                            {data.ordersTrend >= 0 ? '↑' : '↓'} {Math.abs(data.ordersTrend)}%
                        </span>
                    )}
                </div>
            </div>

            <div className="erp-quick-metric">
                <span className="erp-quick-metric-label">Low Stock Alerts</span>
                <div className="erp-quick-metric-value-row">
                    <span className="erp-quick-metric-val">{data?.lowStock || 0}</span>
                    {data?.lowStockTrend && (
                        <span className={`erp-trend-indicator ${data.lowStockTrend <= 0 ? 'erp-trend-down' : 'erp-trend-up'} erp-trend-pill`}>
                            {data.lowStockTrend <= 0 ? '↓' : '↑'} {Math.abs(data.lowStockTrend)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};



export const PremiumKPICard = ({ 
    title, subtitle, value, isCurrency, prefix, icon: Icon, color, trend, trendValue 
}) => {
    return (
        <motion.div 
            className="erp-card erp-kpi-premium-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="erp-kpi-premium-header">
                <div className="erp-kpi-premium-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                    {Icon && <Icon size={18} strokeWidth={2.5} />}
                </div>
                <div className="erp-kpi-premium-title-group">
                    <span className="erp-kpi-premium-title">{title}</span>
                    <span className="erp-kpi-premium-subtitle">{subtitle}</span>
                </div>
            </div>
            
            <div className="erp-kpi-premium-value">
                <AnimatedCounter value={value} isCurrency={isCurrency} prefix={prefix} />
            </div>
            
            {trendValue && (
                <div className={`erp-trend-indicator ${trend === 'up' ? 'erp-trend-up' : 'erp-trend-down'}`}>
                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                </div>
            )}

        </motion.div>
    );
};

export const TimelineWidget = ({ title, items, viewAllLink }) => (
    <div className="erp-card">
        <div className="erp-premium-widget-header">
            <h3 className="erp-premium-widget-title">{title}</h3>
            {viewAllLink && <button className="erp-premium-widget-action">View All</button>}
        </div>
        <div className="erp-timeline">
            {items.map((item, idx) => (
                <div key={idx} className="erp-timeline-item">
                    <div className="erp-timeline-dot" style={{ backgroundColor: item.color }}></div>
                    <div className="erp-timeline-content">
                        <span className="erp-timeline-text">{item.text}</span>
                        <span className="erp-timeline-time">{item.time}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const PendingApprovalsList = ({ approvals = [] }) => {
    if (!approvals || approvals.length === 0) return (
        <div className="erp-card">
            <div className="erp-premium-widget-header">
                <h3 className="erp-premium-widget-title">Pending Approvals</h3>
            </div>
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--erp-text-muted)' }}>No pending approvals</div>
        </div>
    );
    return (
        <div className="erp-card">
            <div className="erp-premium-widget-header">
                <h3 className="erp-premium-widget-title">Pending Approvals</h3>
                <button className="erp-premium-widget-action">View All</button>
            </div>
            <div className="erp-approvals-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {approvals.map((app, idx) => (
                    <div key={idx} className="erp-approval-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="erp-approval-name" style={{ fontSize: '0.875rem', color: 'var(--erp-text-primary)', fontWeight: '500' }}>{app.name}</span>
                        <span className="erp-approval-badge" style={{ backgroundColor: 'var(--erp-primary-light)', color: 'var(--erp-text-secondary)', fontSize: '0.75rem', fontWeight: '600', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{app.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TopSellingMaterialsTable = ({ materials = [] }) => {
    if (!materials || materials.length === 0) return (
        <div className="erp-card erp-premium-table-widget">
            <div className="erp-premium-widget-header">
                <h3 className="erp-premium-widget-title">Top Selling Materials</h3>
            </div>
            <EmptyState icon={Package} title="No Materials Found" message="There is no sales data for top selling materials." />
        </div>
    );
    return (
        <div className="erp-card erp-premium-table-widget">
            <div className="erp-premium-widget-header">
                <h3 className="erp-premium-widget-title">Top Selling Materials</h3>
                <button className="erp-premium-widget-action" style={{ color: 'var(--erp-text-secondary)' }}>This Month ⌄</button>
            </div>
            <table className="erp-premium-table">
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Category</th>
                        <th>Stock / Sold</th>
                        <th>Revenue / Value</th>
                    </tr>
                </thead>
                <tbody>
                    {materials.map((m, idx) => (
                        <tr key={idx}>
                            <td>{m.name}</td>
                            <td>{m.category || '-'}</td>
                            <td>{m.sales || m.qty || 0}</td>
                            <td>{m.revenue ? `$${m.revenue.toLocaleString()}` : (m.rev || '-')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const QuickActionsGrid = () => {
    const navigate = useNavigate();
    const actions = [
        { label: 'Add Employee', icon: UserPlus, path: '/hrms/add-employee' },
        { label: 'Add Material', icon: Package, path: '/materials' },
        { label: 'Create Purchase', icon: ShoppingCart, path: '/orders/create/purchase' },
        { label: 'Create Sales', icon: FilePlus, path: '/orders/create/sales' },
        { label: 'Generate Invoice', icon: FileText, path: '/erp' },
        { label: 'Approve Leave', icon: CheckCircle, path: '/leave-management/approve' },
        { label: 'Update Stock', icon: RefreshCw, path: '/materials' },
        { label: 'View Reports', icon: BarChart2, path: '/analytics' }
    ];
    return (
        <div className="erp-card">
            <div className="erp-premium-widget-header">
                <h3 className="erp-premium-widget-title">Quick Actions</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                {actions.map((action, idx) => {
                    const IconComp = action.icon;
                    return (
                        <button 
                            key={idx} 
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem', background: 'transparent',
                                border: '1px solid var(--erp-border-light)',
                                borderRadius: '8px', cursor: 'pointer',
                                fontSize: '0.75rem', color: 'var(--erp-text-primary)', fontWeight: '500',
                                textAlign: 'left'
                            }}
                            onClick={() => navigate(action.path)}
                        >
                            <IconComp size={16} color="#64748b" /> {action.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};;
  
// New widgets for Layout 
