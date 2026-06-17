import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
    Users, TrendingUp, TrendingDown, DollarSign, Target, 
    BarChart2, Activity, Filter, Layers, CheckCircle,
    Search, Bell, ChevronDown, Award, FileText, Calendar, ArrowUpRight, ArrowDownRight, Briefcase
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const SalesDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [ordersData, setOrdersData] = useState([]);
    const [customersData, setCustomersData] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, ordRes, custRes, empRes] = await Promise.all([
                API.get('/dashboard/stats').catch(e => ({ data: {} })),
                API.get('/orders').catch(e => ({ data: [] })),
                API.get('/customers').catch(e => ({ data: [] })),
                API.get('/employees').catch(e => ({ data: [] }))
            ]);
            setDashboardData(dashRes.data || {});
            setOrdersData(ordRes.data || []);
            setCustomersData(Array.isArray(custRes.data) ? custRes.data : []);
            setEmployeesData(empRes.data || []);
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

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const dashboard = dashboardData || {};
    const charts = dashboard.charts || {};

    const salesOrders = ordersData.filter(o => {
        const t = String(o.orderType || '').toUpperCase();
        return t.includes('SALES');
    });
    
    let totalLeads = customersData.filter(c => c.status === 'Lead').length;
    let qualifiedLeads = customersData.filter(c => c.status === 'Active').length;

    if (totalLeads === 0 && qualifiedLeads === 0 && salesOrders.length > 0) {
        // totalLeads = salesOrders.length;
        // qualifiedLeads = salesOrders.filter(o => ['Approved', 'Processing', 'Shipped', 'Delivered', 'Completed'].includes(o.status)).length;
    }
    
    const openOpportunities = salesOrders.filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status)).length;
    const closedDeals = salesOrders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length;
    
    const actualMonthlyRevenue = salesOrders
        .filter(o => ['Delivered', 'Completed'].includes(o.status))
        .reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
        
    const monthlyRevenue = actualMonthlyRevenue || dashboardData.totalRevenue || 0;
    const targetAchievement = monthlyRevenue > 0 ? 100 : 0; 

    const salesFunnelData = [
        { stage: 'Lead', value: totalLeads, fill: '#e2e8f0' },
        { stage: 'Qualified', value: qualifiedLeads, fill: '#cbd5e1' },
        { stage: 'Confirmed', value: salesOrders.filter(o => ['Approved'].includes(o.status)).length, fill: '#94a3b8' },
        { stage: 'Processing', value: salesOrders.filter(o => ['Processing', 'Shipped', 'In Transit', 'Out for Delivery'].includes(o.status)).length, fill: '#64748b' },
        { stage: 'Delivered', value: closedDeals, fill: '#3b82f6' },
    ];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revMap = {};
    salesOrders.forEach(o => {
        if (['Delivered', 'Completed'].includes(o.status)) {
            const date = new Date(o.orderDate || o.createdAt);
            if (!isNaN(date.getTime())) {
                const month = monthNames[date.getMonth()];
                if (!revMap[month]) revMap[month] = { revenue: 0, count: 0 };
                revMap[month].revenue += (Number(o.totalAmount) || Number(o.grandTotal) || 0);
                revMap[month].count += 1;
            }
        }
    });
    
    const currentMonthIdx = new Date().getMonth();
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
        let m = currentMonthIdx - i;
        if (m < 0) m += 12;
        const monthName = monthNames[m];
        trendData.push({
            name: monthName,
            revenue: revMap[monthName]?.revenue || 0,
            count: revMap[monthName]?.count || 0
        });
    }

    const revenueTrendData = trendData;
    
    const prevMonthName = monthNames[(currentMonthIdx - 1 + 12) % 12];
    const prevMonthlyRevenue = revMap[prevMonthName]?.revenue || 0;
    const thisMonthRevenue = revMap[monthNames[currentMonthIdx]]?.revenue || 0;
    let revGrowth = 0;
    if (prevMonthlyRevenue > 0) {
        revGrowth = ((thisMonthRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100;
    } else if (thisMonthRevenue > 0) {
        revGrowth = 100;
    }
    const growthTrend = revGrowth >= 0 ? `+${revGrowth.toFixed(1)}%` : `${revGrowth.toFixed(1)}%`;
    const trendTotalRevenue = trendData.reduce((sum, d) => sum + d.revenue, 0);

    let leadSourceData = [];
    const leads = customersData.filter(c => c.status === 'Lead');
    if (leads.length > 0) {
        const colors = {
            'Website': '#3b82f6',
            'Google': '#10b981',
            'Referral': '#f59e0b',
            'Direct': '#8b5cf6',
            'Social Media': '#ec4899',
            'Other': '#64748b'
        };
        
        leads.forEach(c => {
            const sourceName = c.source || 'Other';
            const existing = leadSourceData.find(x => x.name === sourceName);
            if (existing) {
                existing.value += 1;
            } else {
                leadSourceData.push({ 
                    name: sourceName, 
                    value: 1, 
                    color: colors[sourceName] || colors['Other']
                });
            }
        });
        
        leadSourceData.forEach(item => {
            item.percentage = ((item.value / leads.length) * 100).toFixed(1);
        });
    }

    const formatIndianCurrency = (value) => {
        if (!value) return '₹0';
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString('en-IN')}`;
    };

    const topExecutives = employeesData
        .filter(e => String(e.department || '').toLowerCase().includes('sales') || String(e.role || '').toLowerCase().includes('sales'))
        .map(e => {
            const execOrders = salesOrders.filter(o => o.employeeId === (e.id || e._id) || o.createdById === (e.id || e._id));
            const closed = execOrders.filter(o => ['Delivered', 'Completed'].includes(o.status));
            const rev = closed.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
            return {
                id: e._id || e.id,
                name: `${e.firstName} ${e.lastName || ''}`.trim(),
                deals: closed.length,
                revenue: formatIndianCurrency(rev),
                status: rev > 0 ? Math.min(100, Math.round((rev / 500000) * 100)) + '%' : '0%',
                rawRevenue: rev
            };
        })
        .sort((a, b) => b.rawRevenue - a.rawRevenue)
        .slice(0, 5);

    const kpiCards = [
        { title: 'Total Leads', value: totalLeads, icon: Users, color: '#3b82f6', trend: '+5%', trendType: 'up' },
        { title: 'Qualified Leads', value: qualifiedLeads, icon: Filter, color: '#10b981', trend: '+2%', trendType: 'up' },
        { title: 'Open Opportunities', value: openOpportunities, icon: Layers, color: '#f59e0b', trend: '-1%', trendType: 'down' },
        { title: 'Closed Deals', value: closedDeals, icon: CheckCircle, color: '#8b5cf6', trend: '+12%', trendType: 'up' },
        { title: 'Monthly Revenue', value: `$${Number(monthlyRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: '#10b981', trend: '+8%', trendType: 'up' },
        { title: 'Target Achievement', value: `${targetAchievement}%`, icon: Target, color: '#ef4444', trend: '+3%', trendType: 'up' },
    ];

    const formatYAxis = formatIndianCurrency;
    
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#0f172a' }}>{label}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                            <span style={{ color: '#64748b' }}>Revenue:</span>
                            <span style={{ fontWeight: 600, color: '#10b981' }}>{formatIndianCurrency(data.revenue)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                            <span style={{ color: '#64748b' }}>Orders:</span>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{data.count}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="main-content">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Sales Overview</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Pipeline & Revenue Dashboard</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> Live Data
                    </span>
                </div>
            </div>

            <div className="bento-grid">
                {/* Left Side: KPIs and Charts (Span 9) */}
                <div className="bento-col-9 bento-grid" style={{ alignContent: 'start' }}>
                    
                    {/* Top KPIs (2 rows of 3) */}
                    {kpiCards.map((kpi, idx) => (
                        <div className="bento-col-4" key={idx}>
                            <div className="dashboard-card-3d kpi-card-3d" style={{ position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.title}</div>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${kpi.color}15`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <kpi.icon size={16} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1 }}>{kpi.value}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: kpi.trendType === 'down' ? '#ef4444' : '#10b981' }}>
                                    {kpi.trendType === 'up' ? <ArrowUpRight size={14} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={14} style={{ marginRight: '4px' }}/>}
                                    {kpi.trend}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Middle Section: Charts */}
                    <div className="bento-col-4">
                        <div className="bento-card chart-card">
                            <div className="bento-card-header">
                                <h3 className="bento-card-title"><Activity size={16} /> Lead Sources</h3>
                            </div>
                            <div className="bento-card-body" style={{ position: 'relative' }}>
                                {leadSourceData.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <PieChart>
                                                <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                                                    {leadSourceData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{totalLeads}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                                            {leadSourceData.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                                    {item.name} ({item.percentage}%)
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <Filter size={24} style={{ opacity: 0.5 }} />
                                        No Lead Data Available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bento-col-8">
                        <div className="bento-card chart-card">
                            <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="bento-card-title" style={{ margin: 0 }}><TrendingUp size={16} /> Revenue Trend</h3>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>6-Month Total</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>{formatIndianCurrency(trendTotalRevenue)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Monthly Growth</div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: revGrowth >= 0 ? '#10b981' : '#ef4444' }}>{growthTrend}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bento-card-body">
                                {revenueTrendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <AreaChart data={revenueTrendData} margin={{ top: 30, right: 45, left: 20, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={formatYAxis} domain={[0, 'auto']} allowDataOverflow={false} width={60} />
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} label={{ position: 'top', formatter: formatIndianCurrency, fill: '#1e293b', fontSize: 11, fontWeight: 600, dy: -5 }} animationDuration={1500} isAnimationActive={true} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px' }}>No revenue data available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bento-col-12">
                        <div className="dashboard-card-3d">
                            <div className="bento-card-header">
                                <h3 className="bento-card-title"><Award size={16} /> Top Sales Executives</h3>
                            </div>
                            <div className="bento-card-body">
                                {topExecutives.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b', textAlign: 'left' }}>
                                                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Executive</th>
                                                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Orders Completed</th>
                                                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Revenue Generated</th>
                                                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Achievement %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topExecutives.map((exec, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#0f172a' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold', fontSize: '11px' }}>{exec.name.charAt(0)}</div>
                                                            {exec.name}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 0', color: '#475569', fontWeight: 500 }}>{exec.deals}</td>
                                                    <td style={{ padding: '12px 0', color: '#10b981', fontWeight: 700 }}>{exec.revenue}</td>
                                                    <td style={{ padding: '12px 0' }}>
                                                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: exec.status === 'On Target' ? '#dcfce7' : '#fee2e2', color: exec.status === 'On Target' ? '#16a34a' : '#dc2626', fontSize: '11px', fontWeight: 600 }}>{exec.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex-center" style={{ height: '60px', color: '#94a3b8', fontSize: '13px' }}>No sales executives found</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Side: Feature Panel & Activity (Span 3) */}
                <div className="bento-col-3 bento-grid" style={{ alignContent: 'start' }}>
                    
                    <div className="bento-col-12">
                        <div className="dashboard-card-3d" style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { path: '/crm/leads', name: 'Lead Management', icon: Filter, color: '#3b82f6' },
                                    { path: '/crm/pipeline', name: 'Pipeline Overview', icon: Layers, color: '#8b5cf6' },
                                    { path: '/crm/customers', name: 'Customer Directory', icon: Users, color: '#10b981' },
                                    { path: '/sales/revenue', name: 'Revenue Tracking', icon: DollarSign, color: '#f59e0b' },
                                    { path: '/sales/goals', name: 'Sales Goals', icon: Target, color: '#ec4899' },
                                    { path: '/quotations', name: 'Quotations', icon: FileText, color: '#64748b' }
                                ].map((link, idx) => (
                                    <div onClick={() => navigate(link.path)} key={idx} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', cursor: 'pointer', color: '#0f172a', fontWeight: 500, fontSize: '13px', transition: 'all 0.2s' }} className="quick-action-link quick-action-3d">
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${link.color}15`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                                            <link.icon size={14} />
                                        </div>
                                        {link.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bento-col-12">
                        <div className="dashboard-card-3d" style={{ height: '340px', padding: '16px' }}>
                            <div className="bento-card-header" style={{ marginBottom: '16px', paddingBottom: '0', borderBottom: 'none' }}>
                                <h3 className="bento-card-title" style={{ fontSize: '13px', color: '#64748b' }}><Filter size={14} /> Sales Funnel</h3>
                            </div>
                            <div className="bento-card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 0 }}>
                                {salesFunnelData.some(d => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart layout="vertical" data={salesFunnelData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                            <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155' }} />
                                            <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                                {salesFunnelData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px' }}>No sales data</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx="true">{`
                .quick-action-link:hover {
                    background: #fff !important;
                    border-color: #e2e8f0 !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
                }
            `}</style>
        </div>
    );
};

export default SalesDashboard;
