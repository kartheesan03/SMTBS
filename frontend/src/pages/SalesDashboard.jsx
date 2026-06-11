import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Target, TrendingUp, CheckCircle, 
    DollarSign, BarChart2, Star, Filter, ArrowUpRight
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const SalesDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get('/dashboard/stats');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to load Sales stats", error);
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

    const salesStats = dashboardData.salesStats || {};
    const totalLeads = salesStats.activeCustomers || 120; // fallback if not provided

    // Mock data for CRM charts
    const revenueTrend = [
        { name: 'Jan', revenue: 40000, target: 35000 },
        { name: 'Feb', revenue: 45000, target: 40000 },
        { name: 'Mar', revenue: 38000, target: 45000 },
        { name: 'Apr', revenue: 52000, target: 50000 },
        { name: 'May', revenue: 61000, target: 55000 },
        { name: 'Jun', revenue: 58000, target: 60000 },
    ];

    const leadSources = [
        { name: 'Website', value: 45, color: '#3b82f6' },
        { name: 'Referral', value: 25, color: '#10b981' },
        { name: 'Social Media', value: 20, color: '#8b5cf6' },
        { name: 'Cold Call', value: 10, color: '#f59e0b' },
    ];

    const salesFunnel = [
        { stage: 'Leads', count: 1200 },
        { stage: 'Qualified', count: 850 },
        { stage: 'Proposal', count: 420 },
        { stage: 'Negotiation', count: 180 },
        { stage: 'Closed Won', count: 95 },
    ];

    const topExecutives = [
        { id: 1, name: 'Alice Smith', revenue: 125000, deals: 14, avatar: 'Alice' },
        { id: 2, name: 'Bob Johnson', revenue: 98000, deals: 11, avatar: 'Bob' },
        { id: 3, name: 'Charlie Davis', revenue: 86000, deals: 9, avatar: 'Charlie' },
    ];

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Sales Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Monitor CRM pipelines, lead conversions, and revenue targets.</p>
            </div>

            {/* Top KPI Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Total Leads</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {totalLeads}
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
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Qualified Leads</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                850
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <Filter size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Open Opportunities</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                420
                            </h2>
                        </div>
                        <div style={{ background: 'var(--warning-light)', padding: '10px', borderRadius: '12px', color: 'var(--warning)' }}>
                            <Target size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Closed Deals</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                95
                            </h2>
                        </div>
                        <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-6" style={{ background: '#f8fafc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', color: 'var(--success)', boxShadow: 'var(--shadow-sm)' }}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly Revenue</span>
                            <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>$58,000</h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', background: 'var(--success-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                        <ArrowUpRight size={14} /> 12% vs last month
                    </div>
                </div>
                
                <div className="bento-card bento-col-6" style={{ background: '#f8fafc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Achievement</span>
                            <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>96% <span style={{fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)'}}>of $60,000</span></h3>
                        </div>
                    </div>
                    <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '96%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <BarChart2 size={18} className="text-primary" />
                            Revenue vs Target Trend
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                                />
                                <Area type="monotone" dataKey="revenue" name="Actual Revenue" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                <Line type="monotone" dataKey="target" name="Target" stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Target size={18} className="text-primary" />
                            Lead Source
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadSources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {leadSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
                            {leadSources.map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        {item.name} ({item.value}%)
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
                            <Filter size={18} className="text-purple" style={{ color: '#8b5cf6' }} />
                            Sales Funnel
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesFunnel} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} width={80} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20}>
                                    {salesFunnel.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`rgba(99, 102, 241, ${1 - index * 0.15})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-6">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Star size={18} className="text-warning" />
                            Top Sales Executives
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '240px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topExecutives.map((exec, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={`https://ui-avatars.com/api/?name=${exec.avatar}&background=eef2ff&color=6366f1`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{exec.name}</h4>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{exec.deals} Closed Deals</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>${exec.revenue.toLocaleString()}</div>
                                    </div>
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
