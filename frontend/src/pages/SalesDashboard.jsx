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
        <div className="unified-dashboard">
            {/* Header Row */}
            <div className="dashboard-header-row">
                <div className="welcome-area">
                    <div className="welcome-text-block">
                        <h1>Welcome to Sales Dashboard</h1>
                        <p className="subtitle">
                            <span className="role-text">Sales & CRM</span>
                            <span className="dot-sep">&bull;</span>
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </p>
                    </div>
                    
                    <div className="welcome-stats">
                        <div className="stat-pill blue">
                            <div className="stat-pill-header">
                                <Users size={16} /> Total Leads
                            </div>
                            <div className="stat-big-val">{totalLeads}</div>
                            <div className="stat-desc">Prospective Clients</div>
                        </div>
                        <div className="stat-pill green">
                            <div className="stat-pill-header">
                                <Target size={16} /> Achievement
                            </div>
                            <div className="stat-big-val">{targetAchievement}%</div>
                            <div className="stat-desc">Monthly Target</div>
                        </div>
                    </div>
                </div>

                <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', flex: 1, border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>Sales Actions</h3>
                        <div className="action-buttons">
                            <NavLink to="/crm/leads" style={{ textDecoration: 'none' }}>
                                <div className="qa-btn blue">
                                    <div className="qa-icon"><Filter size={18} /></div>
                                    <span>Manage Leads</span>
                                </div>
                            </NavLink>
                            <NavLink to="/sales/revenue" style={{ textDecoration: 'none' }}>
                                <div className="qa-btn green">
                                    <div className="qa-icon"><DollarSign size={18} /></div>
                                    <span>Record Sale</span>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Center - Workflow integration */}
            <div className="action-center-row">
                <h3 className="section-title">Sales Pipeline Center</h3>
                <div className="action-cards">
                    <NavLink to="/crm/pipeline" style={{ textDecoration: 'none' }}>
                        <div className="action-card ac-orange">
                            <div className="ac-icon"><Layers size={24} /></div>
                            <div className="ac-info">
                                <h4>{openOpportunities} Open Opportunities</h4>
                                <p>Deals in progress</p>
                            </div>
                        </div>
                    </NavLink>
                    <NavLink to="/crm/customers" style={{ textDecoration: 'none' }}>
                        <div className="action-card ac-blue">
                            <div className="ac-icon"><Users size={24} /></div>
                            <div className="ac-info">
                                <h4>{qualifiedLeads} Qualified Leads</h4>
                                <p>Ready to close</p>
                            </div>
                        </div>
                    </NavLink>
                    <div className="action-card ac-green">
                        <div className="ac-icon"><CheckCircle size={24} /></div>
                        <div className="ac-info">
                            <h4>{closedDeals} Closed Deals</h4>
                            <p>Successfully delivered</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards-row">
                <div className="summary-card card-blue">
                    <h3 className="sc-header-center">Revenue Status</h3>
                    <div className="donut-chart-container">
                        <DollarSign size={64} style={{ color: '#3b82f6', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">${(monthlyRevenue / 1000).toFixed(1)}k</div>
                            <div className="donut-label">This Month</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-orange">
                    <h3 className="sc-header-center">Growth Trend</h3>
                    <div className="donut-chart-container">
                        <TrendingUp size={64} style={{ color: '#f59e0b', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">{growthTrend}</div>
                            <div className="donut-label">vs Last Month</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-green">
                    <h3 className="sc-header-center">Top Executive</h3>
                    <div className="donut-chart-container">
                        <Award size={64} style={{ color: '#10b981', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total" style={{ fontSize: '20px' }}>
                                {topExecutives.length > 0 ? topExecutives[0].name.split(' ')[0] : 'N/A'}
                            </div>
                            <div className="donut-label">Highest Revenue</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-purple">
                    <h3 className="sc-header-center">Leaderboard</h3>
                    <div className="activity-list" style={{ marginTop: '16px' }}>
                        {topExecutives.length > 0 ? topExecutives.slice(0, 3).map((exec, i) => (
                            <div key={i} className="activity-item">
                                <div className="act-icon purple"><Award size={16} /></div>
                                <div className="act-content">
                                    <h4>{exec.name}</h4>
                                    <span>Rev: {exec.revenue}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="activity-item">
                                <div className="act-content"><span>No performance data</span></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default SalesDashboard;
