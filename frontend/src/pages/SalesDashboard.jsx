import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, DollarSign, TrendingUp, Target, 
    Briefcase, Activity, CheckCircle, PieChart as PieChartIcon, UserPlus
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
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
    const stats = dashboardData.stats || {};
    const charts = dashboardData.charts || {};
    const tables = dashboardData.tables || {};

    const recentCustomers = salesStats.recentCustomers || 0;
    const totalCustomers = stats.totalCustomers || 0;
    const openOrders = dashboardData.openOrders || 0;
    const totalRevenue = dashboardData.totalRevenue || 0;
    
    // Simulated Sales KPIs
    const totalLeads = 124;
    const qualifiedLeads = 42;
    const closedDeals = 18;
    const salesTarget = 85; // percentage

    // Sales Funnel
    const salesFunnelData = [
        { stage: 'Leads', count: totalLeads, fill: '#3b82f6' },
        { stage: 'Qualified', count: qualifiedLeads, fill: '#10b981' },
        { stage: 'Proposals', count: 28, fill: '#f59e0b' },
        { stage: 'Negotiation', count: 21, fill: '#8b5cf6' },
        { stage: 'Closed', count: closedDeals, fill: '#ec4899' },
    ];

    // Revenue Trend
    const revenueData = charts.monthlyStats && charts.monthlyStats.length > 0 
        ? charts.monthlyStats 
        : [
            { name: 'Jan', revenue: 12000 },
            { name: 'Feb', revenue: 15000 },
            { name: 'Mar', revenue: 14000 },
            { name: 'Apr', revenue: 18000 },
            { name: 'May', revenue: 22000 },
            { name: 'Jun', revenue: 25000 }
        ];

    // Lead Sources
    const leadSources = [
        { name: 'Website', value: 45, color: '#3b82f6' },
        { name: 'Referral', value: 25, color: '#10b981' },
        { name: 'Cold Call', value: 15, color: '#f59e0b' },
        { name: 'Social', value: 15, color: '#8b5cf6' }
    ];

    // Recent Deals
    const recentDeals = tables.recentOrders && tables.recentOrders.length > 0 
        ? tables.recentOrders.map((o, i) => ({
            id: o._id || i,
            client: o.customer?.name || `Customer ${i+1}`,
            amount: o.totalAmount || (Math.random()*1000 + 500).toFixed(0),
            status: 'Closed Won'
        })).slice(0, 4)
        : [
            { id: 1, client: 'Acme Corp', amount: 4500, status: 'Closed Won' },
            { id: 2, client: 'Global Tech', amount: 8200, status: 'Closed Won' },
            { id: 3, client: 'Nexus LLC', amount: 3100, status: 'Closed Won' }
        ];

    return (
        <div className="role-dashboard-layout">
            
            {/* --- Main Content Left --- */}
            <div className="dashboard-main-content">
                <div className="header-section">
                    <h1 className="page-title">Sales Manager Dashboard</h1>
                    <p className="page-subtitle">Sales Pipeline & Revenue Analytics</p>
                </div>

                {/* Top KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><UserPlus size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Leads</span>
                            <h3 className="kpi-value">{totalLeads}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><CheckCircle size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Qualified Leads</span>
                            <h3 className="kpi-value">{qualifiedLeads}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><Briefcase size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Closed Deals</span>
                            <h3 className="kpi-value">{closedDeals}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Users size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Active Customers</span>
                            <h3 className="kpi-value">{totalCustomers}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}><DollarSign size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Revenue</span>
                            <h3 className="kpi-value">${Number(totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfeff', color: '#0891b2' }}><Target size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Target Achieved</span>
                            <h3 className="kpi-value">{salesTarget}%</h3>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    
                    {/* Revenue Trend Line Chart */}
                    <div className="bento-card span-8">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><TrendingUp size={18} /> Revenue Trend (6 Months)</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Lead Sources Pie */}
                    <div className="bento-card span-4">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><PieChartIcon size={18} /> Lead Sources</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadSources}
                                        cx="50%" cy="50%"
                                        innerRadius={0} outerRadius={95}
                                        dataKey="value" stroke="none"
                                    >
                                        {leadSources.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sales Funnel */}
                    <div className="bento-card span-12">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={18} /> Sales Pipeline Funnel</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesFunnelData} margin={{ top: 20, right: 10, left: 20, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} width={80} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                                        {salesFunnelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Right Panel: Sales Features --- */}
            <div className="role-side-panel">
                <div className="side-panel-header">
                    <h3>Sales Features</h3>
                    <span className="badge">Admin</span>
                </div>
                
                <div className="side-panel-content">
                    
                    {/* Quick Actions */}
                    <div className="feature-block">
                        <h4 className="block-title">Quick Actions</h4>
                        <div className="action-list">
                            <button className="action-item"><UserPlus size={16} /> Add New Lead</button>
                            <button className="action-item"><DollarSign size={16} /> Create Quote</button>
                            <button className="action-item"><Briefcase size={16} /> Assign Deal</button>
                        </div>
                    </div>

                    {/* Active Targets */}
                    <div className="feature-block">
                        <h4 className="block-title">Active Targets <Target size={14} className="text-primary ml-1"/></h4>
                        <div className="target-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="target-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Q2 Revenue Target</span>
                                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 700 }}>85%</span>
                                </div>
                                <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ background: '#10b981', width: '85%', height: '100%' }}></div>
                                </div>
                            </div>
                            <div className="target-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>New Customer Acquisition</span>
                                    <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 700 }}>62%</span>
                                </div>
                                <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ background: '#3b82f6', width: '62%', height: '100%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Deals feed */}
                    <div className="feature-block">
                        <h4 className="block-title">Recently Closed Deals</h4>
                        <div className="timeline">
                            {recentDeals.map((deal) => (
                                <div className="timeline-item" key={deal.id}>
                                    <div className="timeline-dot" style={{ borderColor: '#10b981' }}></div>
                                    <div className="timeline-content">
                                        <p>{deal.client}</p>
                                        <span style={{ color: '#10b981', fontWeight: 600, display: 'block', marginTop: '2px' }}>${Number(deal.amount || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Shared Embedded CSS for Role Dashboards --- */}
            <style jsx="true">{`
                .role-dashboard-layout {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .dashboard-main-content {
                    padding: 30px;
                    height: 100vh;
                    overflow-y: auto;
                }

                .header-section { margin-bottom: 24px; }
                .page-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
                .page-subtitle { font-size: 15px; color: #64748b; margin: 0; }

                /* KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }
                .kpi-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-info { flex: 1; }
                .kpi-label { display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 4px; }
                .kpi-value { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }

                /* Charts Grid */
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .bento-card {
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .span-12 { grid-column: span 12; }
                .span-8 { grid-column: span 8; }
                .span-6 { grid-column: span 6; }
                .span-4 { grid-column: span 4; }
                
                .bento-card-header { padding: 20px 24px 0; }
                .bento-card-title { font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
                .bento-card-body { padding: 24px; flex: 1; }

                /* --- Right Panel --- */
                .role-side-panel {
                    background: #ffffff;
                    border-left: 1px solid #e2e8f0;
                    height: 100vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                .side-panel-header {
                    padding: 24px 24px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .side-panel-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
                .badge { background: #3b82f6; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 12px; }
                .side-panel-content { padding: 24px; display: flex; flex-direction: column; gap: 32px; }

                .block-title { margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; }
                .action-list { display: flex; flex-direction: column; gap: 10px; }
                .action-item {
                    display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8fafc;
                    border: 1px solid #f1f5f9; border-radius: 12px; color: #334155; font-weight: 600; font-size: 14px;
                    cursor: pointer; transition: all 0.2s; text-align: left;
                }
                .action-item:hover { background: #f1f5f9; color: #0f172a; }
                .action-item svg { color: #64748b; }

                .timeline { position: relative; padding-left: 14px; border-left: 2px solid #e2e8f0; display: flex; flex-direction: column; gap: 20px; }
                .timeline-item { position: relative; }
                .timeline-dot { position: absolute; left: -21px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #ffffff; border: 3px solid #3b82f6; }
                .timeline-content p { margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #334155; line-height: 1.4; }
                .timeline-content span { font-size: 12px; color: #94a3b8; }

                @media (max-width: 1400px) {
                    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                    .charts-grid { display: flex; flex-direction: column; }
                }
                @media (max-width: 1024px) {
                    .role-dashboard-layout { grid-template-columns: 1fr; }
                    .role-side-panel { display: none; }
                }
                @media (max-width: 768px) {
                    .kpi-grid { grid-template-columns: 1fr; }
                    .dashboard-main-content { padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default SalesDashboard;
