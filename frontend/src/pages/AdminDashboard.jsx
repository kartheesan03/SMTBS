import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Box, ShoppingCart, DollarSign, 
    TrendingUp, Activity, Calendar, Clock, AlertCircle
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
        const interval = setInterval(fetchDashboardData, 30000); // 30 seconds auto refresh
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

    const systemAnalyticsData = charts.monthlyStats && charts.monthlyStats.length > 0 
        ? charts.monthlyStats 
        : [
            { name: 'Jan', revenue: 0, sales: 0 },
            { name: 'Feb', revenue: 0, sales: 0 }
        ];

    const attendanceData = [
        { name: 'Present', value: hrStats.presentToday || 0, color: '#10b981' },
        { name: 'Absent', value: hrStats.absentToday || 0, color: '#ef4444' },
        { name: 'On Leave', value: hrStats.onLeave || 0, color: '#f59e0b' },
    ];
    
    // If all are zero, give a tiny slice to show empty state
    if (attendanceData.every(d => d.value === 0)) {
        attendanceData.push({ name: 'No Data', value: 1, color: '#e2e8f0' });
    }

    const payrollData = charts.payrollData && charts.payrollData.length > 0 
        ? charts.payrollData 
        : [ { name: 'No Data', amount: 0 } ];

    const recentActivities = tables.recentActivity || [];

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Welcome back, Admin. Here is your enterprise summary.</p>
            </div>

            {/* Metrics Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
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

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
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
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
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
                            Today's Attendance
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: 'auto' }}>
                            {attendanceData.filter(i => i.name !== 'No Data').map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        {item.name} ({item.value})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bento-grid">
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <DollarSign size={18} className="text-primary" />
                            Payroll Summary (Recent)
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payrollData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Clock size={18} className="text-primary" />
                            Activity Timeline
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '280px' }}>
                        {recentActivities.length === 0 ? (
                            <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                                No recent activities
                            </div>
                        ) : (
                            <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '8px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
                                {recentActivities.map((activity, i) => (
                                    <div key={activity.id || i} style={{ position: 'relative', paddingLeft: '20px' }}>
                                        {/* Timeline Dot */}
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
            </div>
        </div>
    );
};

export default AdminDashboard;
