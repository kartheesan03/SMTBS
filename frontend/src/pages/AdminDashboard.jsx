import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Box, ShoppingCart, DollarSign, 
    TrendingUp, Activity, Calendar, Clock, AlertCircle,
    FileText, UserCheck, Inbox, CheckSquare, Bell
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get('/dashboard/stats');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !dashboardData) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const stats = dashboardData.stats || {};
    const hrStats = dashboardData.hrStats || {};
    const charts = dashboardData.charts || {};
    const tables = dashboardData.tables || {};

    // Mock data for new charts to match bento design
    const systemAnalyticsData = charts.monthlyStats && charts.monthlyStats.length > 0 
        ? charts.monthlyStats 
        : [
            { name: 'Jan', revenue: 4000, sales: 2400 },
            { name: 'Feb', revenue: 3000, sales: 1398 },
            { name: 'Mar', revenue: 2000, sales: 9800 },
            { name: 'Apr', revenue: 2780, sales: 3908 },
            { name: 'May', revenue: 1890, sales: 4800 },
            { name: 'Jun', revenue: 2390, sales: 3800 },
        ];

    const departmentData = [
        { name: 'Sales', value: 40, color: '#3b82f6' },
        { name: 'HR', value: 30, color: '#8b5cf6' },
        { name: 'IT', value: 20, color: '#10b981' },
        { name: 'Finance', value: 10, color: '#f59e0b' },
    ];

    const recentActivities = tables.recentActivity || [
        { id: 1, text: 'New employee onboarded', time: new Date(Date.now() - 3600000) },
        { id: 2, text: 'Order #1024 delivered', time: new Date(Date.now() - 7200000) },
        { id: 3, text: 'Invoice #INV-22 paid', time: new Date(Date.now() - 86400000) },
    ];

    const lowStockAlerts = tables.lowStock || [
        { name: 'Printer Ink', quantity: 2, threshold: 5 },
        { name: 'A4 Paper', quantity: 1, threshold: 10 },
    ];

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Enterprise Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Admin Dashboard & System Analytics</p>
            </div>

            {/* Top KPI Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Total Employees</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {dashboardData.totalEmployees?.toLocaleString() || 0}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Total Materials</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {dashboardData.totalMaterials?.toLocaleString() || 0}
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <Box size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Active Orders</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {dashboardData.openOrders?.toLocaleString() || 0}
                            </h2>
                        </div>
                        <div style={{ background: '#ecfeff', padding: '10px', borderRadius: '12px', color: '#06b6d4' }}>
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Revenue Overview</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                ${(dashboardData.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary KPI Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-3" style={{ background: '#f8fafc' }}>
                    <div className="flex-center" style={{ flexDirection: 'column', gap: '8px' }}>
                        <UserCheck size={24} className="text-success" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Attendance Summary</span>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>{hrStats.presentToday || 0} / {dashboardData.totalEmployees || 0}</h3>
                    </div>
                </div>
                <div className="bento-card bento-col-3" style={{ background: '#f8fafc' }}>
                    <div className="flex-center" style={{ flexDirection: 'column', gap: '8px' }}>
                        <FileText size={24} className="text-primary" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Invoices</span>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>{stats.pendingInvoices || 18}</h3>
                    </div>
                </div>
                <div className="bento-card bento-col-3" style={{ background: '#f8fafc' }}>
                    <div className="flex-center" style={{ flexDirection: 'column', gap: '8px' }}>
                        <Inbox size={24} className="text-warning" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock Requests</span>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>{dashboardData.stockRequests || 5}</h3>
                    </div>
                </div>
                <div className="bento-card bento-col-3" style={{ background: '#f8fafc' }}>
                    <div className="flex-center" style={{ flexDirection: 'column', gap: '8px' }}>
                        <CheckSquare size={24} className="text-purple" style={{ color: '#8b5cf6' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Payroll Summary</span>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Processed</h3>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Activity size={18} className="text-primary" />
                            System Analytics (Revenue vs Sales)
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={systemAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
                                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={0.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Users size={18} className="text-primary" />
                            Department Overview
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={departmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
                            {departmentData.map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bento-grid">
                <div className="bento-card bento-col-6">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Clock size={18} className="text-primary" />
                            Recent Activities
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '240px' }}>
                        {recentActivities.length === 0 ? (
                            <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                                No recent activities
                            </div>
                        ) : (
                            <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '8px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
                                {recentActivities.map((activity, i) => (
                                    <div key={activity.id || i} style={{ position: 'relative', paddingLeft: '20px' }}>
                                        <div style={{ 
                                            position: 'absolute', left: '-29px', top: '2px', width: '12px', height: '12px', 
                                            borderRadius: '50%', background: 'var(--bg-card)', border: '3px solid var(--primary)' 
                                        }}></div>
                                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                                            {activity.text}
                                        </h4>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {new Date(activity.time).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bento-card bento-col-6">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <AlertCircle size={18} className="text-danger" />
                            Low Stock Alerts
                        </div>
                        <span style={{ fontSize: '12px', background: 'var(--danger-light)', color: 'var(--danger)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                            {lowStockAlerts.length} Alerts
                        </span>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '240px' }}>
                        {lowStockAlerts.length === 0 ? (
                            <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                                All stock levels are optimal
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {lowStockAlerts.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Box size={18} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{item.name}</h4>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Threshold: {item.threshold}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>{item.quantity} Left</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Reorder Now</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
