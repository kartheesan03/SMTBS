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
import SkeletonLoader from '../components/SkeletonLoader';

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
            <div style={{ padding: '24px', background: 'var(--bg-body)', minHeight: '100vh' }}>
                <SkeletonLoader type="dashboard" />
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
    const monthsWithRevenue = revenueTrendData.filter(d => d.revenue > 0).length;
    const highestRevenueMonth = [...revenueTrendData].sort((a,b) => b.revenue - a.revenue)[0];
    const trendTotalOrders = trendData.reduce((sum, d) => sum + d.count, 0);

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
                deals: execOrders.length,
                deliveries: closed.length,
                revenue: formatIndianCurrency(rev),
                rawRevenue: rev
            };
        })
        .sort((a, b) => b.rawRevenue - a.rawRevenue)
        .slice(0, 5)
        .map((exec, idx) => ({ ...exec, rank: idx + 1 }));

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
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales Overview</h1>
                    <p className="page-subtitle">Pipeline & Revenue Dashboard</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 0 2px var(--success-bg)' }}></span> Live Data System
                    </span>
                </div>
            </div>

            {/* ===== KPI ROW ===== */}
            <div className="responsive-grid-6">
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="premium-card" style={{ position: 'relative', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '130px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.title}</div>
                            <div className="kpi-icon-3d" style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg, ${kpi.color}15, ${kpi.color}05)`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <kpi.icon size={18} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 6px 0', lineHeight: 1 }}>{kpi.value}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: kpi.trendType === 'down' ? 'var(--danger)' : 'var(--success)' }}>
                                {kpi.trendType === 'up' ? <ArrowUpRight size={14} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={14} style={{ marginRight: '4px' }}/>}
                                {kpi.trend} <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>vs last month</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== ROW 2: Charts and Quick Actions ===== */}
            <div className="responsive-grid-4-5-3">
                {/* Lead Sources */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Lead Sources</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {leadSourceData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1, minHeight: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                                                {leadSourceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '13px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{totalLeads}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Leads</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px', flexShrink: 0 }}>
                                    {leadSourceData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '4px', background: item.color }}></span>
                                            {item.name} ({item.percentage}%)
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                <Filter size={24} style={{ opacity: 0.5 }} />
                                <span style={{ fontWeight: 500 }}>No Lead Data Available</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={18} /> Revenue Trend</h3>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>6-Month Total</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)' }}>{formatIndianCurrency(trendTotalRevenue)}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', marginLeft: '-24px' }}>
                        {monthsWithRevenue >= 2 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} tickFormatter={formatYAxis} width={60} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} label={{ position: 'top', formatter: formatIndianCurrency, fill: 'var(--text-heading)', fontSize: 12, fontWeight: 600, dy: -5 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : monthsWithRevenue === 1 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 24px', height: '100%', justifyContent: 'center' }}>
                                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Revenue</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{formatIndianCurrency(thisMonthRevenue)}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Growth Trend</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: revGrowth >= 0 ? 'var(--success)' : 'var(--danger)' }}>{growthTrend}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                <TrendingUp size={24} style={{ opacity: 0.5 }} />
                                <span style={{ fontWeight: 500 }}>No Revenue Data</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions (App Launcher Style) */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 20px 0' }}>Sales Actions</h3>
                    <div className="responsive-grid-2" style={{ flex: 1, margin: 0, gap: '12px' }}>
                        {[
                            { path: '/crm/leads', name: 'Leads', icon: Filter, color: '#3b82f6' },
                            { path: '/crm/pipeline', name: 'Pipeline', icon: Layers, color: '#8b5cf6' },
                            { path: '/crm/customers', name: 'Customers', icon: Users, color: '#10b981' },
                            { path: '/sales/revenue', name: 'Revenue', icon: DollarSign, color: '#f59e0b' },
                            { path: '/sales/goals', name: 'Goals', icon: Target, color: '#ec4899' },
                            { path: '/quotations', name: 'Quotes', icon: FileText, color: '#64748b' }
                        ].map((link, idx) => (
                            <div onClick={() => navigate(link.path)} key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-heading)', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} className="quick-action-link ui-card">
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${link.color}15`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                    <link.icon size={18} />
                                </div>
                                {link.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== ROW 3: Top Executives (Full Width) ===== */}
            <div className="premium-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={18} /> Top Sales Executives</h3>
                </div>
                <div className="table-responsive">
                    {topExecutives.length > 0 ? (
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topExecutives.map((exec, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{exec.name}</td>
                                        <td>{exec.deliveries}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>{exec.revenue}</td>
                                        <td>
                                            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '12px', background: exec.rank === 1 ? 'var(--warning-bg)' : 'var(--bg-app)', color: exec.rank === 1 ? 'var(--warning)' : 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>
                                                #{exec.rank}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No Sales Performance Data Available</div>
                    )}
                </div>
            </div>

            
        </div>
    );
};

export default SalesDashboard;
