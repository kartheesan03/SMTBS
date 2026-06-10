import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Box, ShoppingCart, DollarSign, 
    TrendingUp, Activity, Calendar, Clock
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalMaterials: 0,
        totalOrders: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    // Mock data for Recharts (to be replaced with actual backend data when API is updated)
    const systemAnalyticsData = [
        { name: 'Mon', usage: 4000, capacity: 2400 },
        { name: 'Tue', usage: 3000, capacity: 1398 },
        { name: 'Wed', usage: 2000, capacity: 9800 },
        { name: 'Thu', usage: 2780, capacity: 3908 },
        { name: 'Fri', usage: 1890, capacity: 4800 },
        { name: 'Sat', usage: 2390, capacity: 3800 },
        { name: 'Sun', usage: 3490, capacity: 4300 },
    ];

    const attendanceData = [
        { name: 'Present', value: 85, color: '#10b981' },
        { name: 'Absent', value: 5, color: '#ef4444' },
        { name: 'On Leave', value: 10, color: '#f59e0b' },
    ];

    const payrollData = [
        { name: 'Jan', amount: 40000 },
        { name: 'Feb', amount: 42000 },
        { name: 'Mar', amount: 41000 },
        { name: 'Apr', amount: 45000 },
        { name: 'May', amount: 48000 },
        { name: 'Jun', amount: 47000 },
    ];

    const recentActivities = [
        { id: 1, title: 'New Employee Onboarded', time: '10 mins ago', type: 'hr' },
        { id: 2, title: 'Purchase Order #PO-045 Created', time: '1 hour ago', type: 'erp' },
        { id: 3, title: 'Material Aluminum 7075 Restocked', time: '3 hours ago', type: 'inventory' },
        { id: 4, title: 'Payroll Processed for May', time: '1 day ago', type: 'finance' },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch actual data where available
                const [empRes, matRes, orderRes] = await Promise.all([
                    API.get('/employees'),
                    API.get('/materials'),
                    API.get('/orders')
                ]);
                
                // Calculate simple mock revenue based on orders if backend doesn't provide it
                let totalRev = 0;
                if (orderRes.data && Array.isArray(orderRes.data)) {
                    totalRev = orderRes.data.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                }

                setStats({
                    totalEmployees: empRes.data.length || 142, // Fallback to mock if empty
                    totalMaterials: matRes.data.length || 850,
                    totalOrders: orderRes.data?.length || 32,
                    revenue: totalRev || 124500
                });
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

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
                                {stats.totalEmployees.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)' }}>
                        <TrendingUp size={14} /> <span>+12% from last month</span>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Total Materials</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {stats.totalMaterials.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <Box size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)' }}>
                        <TrendingUp size={14} /> <span>Stock levels healthy</span>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Active Orders</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {stats.totalOrders.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ background: '#ecfeff', padding: '10px', borderRadius: '12px', color: '#06b6d4' }}>
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--warning)' }}>
                        <Activity size={14} /> <span>5 pending approvals</span>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Revenue Overview</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                ${stats.revenue.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)' }}>
                        <TrendingUp size={14} /> <span>+4.3% from last week</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Activity size={18} className="text-primary" />
                            System Analytics
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
                                <Area type="monotone" dataKey="usage" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
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
                            {attendanceData.map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.name}</span>
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
                            Payroll Summary (YTD)
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payrollData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
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
                    <div className="bento-card-body" style={{ overflowY: 'auto' }}>
                        <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '8px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
                            {recentActivities.map((activity, i) => (
                                <div key={activity.id} style={{ position: 'relative', paddingLeft: '20px' }}>
                                    {/* Timeline Dot */}
                                    <div style={{ 
                                        position: 'absolute', left: '-29px', top: '2px', width: '12px', height: '12px', 
                                        borderRadius: '50%', background: 'var(--bg-card)', border: '3px solid var(--primary)' 
                                    }}></div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                                        {activity.title}
                                    </h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
