import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, TrendingUp, DollarSign, Target, 
    BarChart2, Activity, Filter, Layers, CheckCircle,
    Search, Bell, ChevronDown, Award, FileText, Calendar
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const SalesDashboard = () => {
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

    const charts = dashboardData.charts || {};

    // KPIs
    const totalLeads = 345; // Simulated
    const qualifiedLeads = 120; // Simulated
    const openOpportunities = 45; // Simulated
    const closedDeals = 28; // Simulated
    const monthlyRevenue = dashboardData.totalRevenue || 0;
    const targetAchievement = 82; // Simulated %

    // Charts Data
    const salesFunnelData = [
        { stage: 'Leads', value: 345, fill: '#e2e8f0' },
        { stage: 'Qualified', value: 120, fill: '#94a3b8' },
        { stage: 'Proposals', value: 75, fill: '#64748b' },
        { stage: 'Negotiation', value: 45, fill: '#475569' },
        { stage: 'Closed Won', value: 28, fill: '#3b82f6' },
    ];

    const revenueTrendData = charts.monthlyStats && charts.monthlyStats.length > 0 
        ? charts.monthlyStats 
        : [
            { name: 'Jan', revenue: 4000 },
            { name: 'Feb', revenue: 3000 },
            { name: 'Mar', revenue: 2000 },
            { name: 'Apr', revenue: 2780 },
            { name: 'May', revenue: 1890 },
            { name: 'Jun', revenue: 2390 },
        ];

    const leadSourceData = [
        { name: 'Organic Search', value: 40, color: '#3b82f6' },
        { name: 'Referrals', value: 25, color: '#10b981' },
        { name: 'Social Media', value: 20, color: '#f59e0b' },
        { name: 'Direct', value: 15, color: '#8b5cf6' },
    ];

    const topExecutives = [
        { id: 1, name: 'Alice Smith', deals: 12, revenue: '$45,000', status: 'On Target' },
        { id: 2, name: 'Bob Johnson', deals: 8, revenue: '$32,000', status: 'On Target' },
        { id: 3, name: 'Charlie Brown', deals: 5, revenue: '$18,000', status: 'Behind' },
    ];

    const rightPanelFeatures = [
        { title: 'Lead Management', icon: <Filter size={16} /> },
        { title: 'Pipeline Overview', icon: <Layers size={16} /> },
        { title: 'Customer Directory', icon: <Users size={16} /> },
        { title: 'Revenue Tracking', icon: <DollarSign size={16} /> },
        { title: 'Sales Goals', icon: <Target size={16} /> },
        { title: 'Quotations', icon: <FileText size={16} /> }
    ];

    return (
        <div className="role-dashboard-layout">
            <div className="main-content">



                <div className="header-section">
                    <h1 className="page-title">Sales Manager Dashboard</h1>
                    <p className="page-subtitle">Pipeline & Revenue Overview</p>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +5%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{totalLeads}</h3>
                            <span className="kpi-label">Total Leads</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><Filter size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +2%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{qualifiedLeads}</h3>
                            <span className="kpi-label">Qualified Leads</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><Layers size={18} /></div>
                            <div className="kpi-trend negative"><TrendingDown size={14} /> -1%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{openOpportunities}</h3>
                            <span className="kpi-label">Open Opportunities</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><CheckCircle size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +12%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{closedDeals}</h3>
                            <span className="kpi-label">Closed Deals</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +8%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">${Number(monthlyRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                            <span className="kpi-label">Monthly Revenue</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#fee2e2', color: '#ef4444' }}><Target size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +3%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{targetAchievement}%</h3>
                            <span className="kpi-label">Target Achievement</span>
                        </div>
                    </div>
                </div>

                {/* Row 1 */}
                <div className="charts-grid-3">
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Filter size={16} /> Sales Funnel</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '20px 10px 10px 10px' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart layout="vertical" data={salesFunnelData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#334155' }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {salesFunnelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><TrendingUp size={16} /> Revenue Trend</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '20px 10px 10px 10px' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={16} /> Lead Source Distribution</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '10px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
                                        {leadSourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="charts-grid-3" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Award size={16} /> Top Sales Executives</div>
                        </div>
                        <div className="bento-card-body">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left', background: '#f8fafc' }}>
                                        <th style={{ padding: '16px 20px', fontWeight: 600 }}>Executive Name</th>
                                        <th style={{ padding: '16px 20px', fontWeight: 600 }}>Deals Closed</th>
                                        <th style={{ padding: '16px 20px', fontWeight: 600 }}>Revenue Generated</th>
                                        <th style={{ padding: '16px 20px', fontWeight: 600 }}>Target Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topExecutives.map(exec => (
                                        <tr key={exec.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#f8fafc'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                                            <td style={{ padding: '16px 20px', fontWeight: 600, color: '#334155' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold' }}>{exec.name.charAt(0)}</div>
                                                    {exec.name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', color: '#64748b', fontWeight: 500 }}>{exec.deals}</td>
                                            <td style={{ padding: '16px 20px', color: '#059669', fontWeight: 700 }}>{exec.revenue}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'inline-block',
                                                    background: exec.status === 'On Target' ? '#dcfce7' : '#fee2e2',
                                                    color: exec.status === 'On Target' ? '#16a34a' : '#dc2626'
                                                }}>{exec.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            <style jsx="true">{`
                .role-dashboard-layout {
                    display: block;
                    min-height: 100vh;
                    background: #f4f7fb;
                }

                .main-content {
                    padding: 24px 32px;
                    height: 100vh;
                    overflow-y: auto;
                }

                .header-section { margin-bottom: 24px; }
                .page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.5px; }
                .page-subtitle { font-size: 14px; color: #64748b; margin: 0; font-weight: 500; }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: #ffffff; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02); border: 1px solid #e2e8f0; height: 110px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
                }
                .kpi-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .kpi-icon-wrapper { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .kpi-trend { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 2px; padding: 4px 8px; border-radius: 20px; }
                .kpi-trend.positive { background: #dcfce7; color: #16a34a; }
                .kpi-trend.negative { background: #fee2e2; color: #dc2626; }
                
                .kpi-info { display: flex; flex-direction: column; }
                .kpi-label { font-size: 12px; font-weight: 600; color: #64748b; margin-top: 2px; }
                .kpi-value { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; }

                .charts-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .bento-card {
                    background: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;
                    display: flex; flex-direction: column; overflow: hidden;
                    transition: box-shadow 0.2s ease;
                }
                .bento-card:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); }
                .bento-card-header { padding: 18px 20px 0; }
                .bento-card-title { font-size: 15px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
                .bento-card-body { padding: 20px; flex: 1; overflow-y: hidden; }

                @media (max-width: 1400px) {
                    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 1024px) {
                    .charts-grid-3 { grid-template-columns: 1fr; }
                    .main-content { padding: 16px; }
                }
            `}</style>
        </div>
    );
};

export default SalesDashboard;
