import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Target, DollarSign, Award, ArrowUpRight, BarChart2
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar, Line, BarChart
} from 'recharts';

const SalesDashboard = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        opportunities: 0,
        closedDeals: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    // Mock data for Recharts
    const salesFunnelData = [
        { name: 'Leads', value: 1200, fill: '#cbd5e1' },
        { name: 'Qualified', value: 800, fill: '#94a3b8' },
        { name: 'Proposals', value: 450, fill: '#64748b' },
        { name: 'Negotiation', value: 200, fill: '#475569' },
        { name: 'Closed Won', value: 85, fill: 'var(--primary)' },
    ];

    const leadSourceData = [
        { name: 'Organic Search', value: 45, color: '#3b82f6' },
        { name: 'Referral', value: 25, color: '#10b981' },
        { name: 'Social Media', value: 20, color: '#8b5cf6' },
        { name: 'Direct', value: 10, color: '#f59e0b' },
    ];

    const salesPerformanceData = [
        { name: 'Jan', target: 40000, actual: 42000 },
        { name: 'Feb', target: 45000, actual: 44000 },
        { name: 'Mar', target: 50000, actual: 54000 },
        { name: 'Apr', target: 55000, actual: 52000 },
        { name: 'May', target: 60000, actual: 68000 },
        { name: 'Jun', target: 65000, actual: 72000 },
    ];

    const recentActivities = [
        { id: 1, text: 'Deal closed with TechCorp ($45k)', time: '1 hour ago' },
        { id: 2, text: 'Proposal sent to Global Logistics', time: '3 hours ago' },
        { id: 3, text: 'New lead assigned: Sarah Jenkins', time: '4 hours ago' },
        { id: 4, text: 'Meeting scheduled with Acme Corp', time: '1 day ago' },
    ];

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                // Simulate fetch
                setStats({
                    totalLeads: 1240,
                    opportunities: 184,
                    closedDeals: 85,
                    revenue: 425000
                });
            } catch (error) {
                console.error("Failed to load Sales stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();
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
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Sales Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Track leads, pipeline, and revenue performance.</p>
            </div>

            {/* Metrics Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Total Leads</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {stats.totalLeads.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px', color: '#64748b' }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)' }}>
                        <ArrowUpRight size={14} /> <span>+24% this month</span>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Opportunities</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {stats.opportunities.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <Target size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)' }}>
                        <ArrowUpRight size={14} /> <span>+12% this month</span>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Closed Deals</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {stats.closedDeals.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Award size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)' }}>
                        <ArrowUpRight size={14} /> <span>+8% this month</span>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Revenue (YTD)</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                ${stats.revenue.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)' }}>
                        <ArrowUpRight size={14} /> <span>+18% against target</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <BarChart2 size={18} className="text-primary" />
                            Sales Performance (Target vs Actual)
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={salesPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                                />
                                <Bar dataKey="actual" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={32} />
                                <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Target size={18} className="text-primary" />
                            Lead Sources
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadSourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {leadSourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                            {leadSourceData.map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.name}</span>
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
                            <Target size={18} className="text-primary" />
                            Sales Funnel
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesFunnelData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} width={90} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                    {salesFunnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-6">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Award size={18} className="text-primary" />
                            Recent Activities
                        </div>
                    </div>
                    <div className="bento-card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                            {recentActivities.map((act) => (
                                <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{act.text}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
