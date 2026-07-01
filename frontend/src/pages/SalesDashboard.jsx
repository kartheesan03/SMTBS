import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import API from '../api/axios';
import {
    Users, Search, Bell, Moon, Target, ShoppingBag, Award,
    Briefcase, Activity, FileText, CheckCircle, ListTodo,
    Menu, Calendar, Clock, LogOut, Settings as SettingsIcon, User as UserIcon, DollarSign, TrendingUp,
    ArrowUpRight, ArrowDownRight, Filter, Layers
} from 'lucide-react';
import {
    EmptyState, SkeletonCard,
    TopWelcomeBar, PremiumKPICard, TimelineWidget,
    QuickActionsGrid
} from '../components/AdminDashboard/DashboardWidgets';
import { SalesAreaChart, InventoryStatusDonut } from '../components/AdminDashboard/AnalyticsCharts';
import CommandCenter from '../components/CommandCenter';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDKPICard } from './AdminDashboard';

const SalesDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);

    const displayName = user?.name || user?.user?.name || 'Sales Rep';
    const displayRole = user?.role || user?.user?.role || 'Sales';
    const displayEmail = user?.email || user?.user?.email || 'sales@smtbms.com';

    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [customersData, setCustomersData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [leadsData, setLeadsData] = useState([]);
    const [tasksData, setTasksData] = useState([]);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.erp-profile-menu-container')) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [dashRes, custRes, ordRes, leadRes, taskRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/customers').catch(e => ({ data: [] })),
                    API.get('/orders').catch(e => ({ data: [] })),
                    API.get('/leads').catch(e => ({ data: [] })),
                    API.get('/tasks').catch(e => ({ data: [] }))
                ]);
                setDashboardData(dashRes.data || {});
                setCustomersData(custRes.data || []);
                setOrdersData(ordRes.data || []);
                setLeadsData(leadRes.data || []);
                setTasksData(taskRes.data || []);
                setError(null);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleDarkMode = () => {
        const root = document.documentElement;
        if (root.getAttribute('data-theme') === 'dark') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', 'dark');
        }
    };

    if (loading) {
        return (
            <div className="erp-dashboard-container">
                <div className="erp-main-content">
                    <div className="erp-summary-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="erp-dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <EmptyState icon={Activity} title="Error Loading Data" message={error} />
            </div>
        );
    }

    const dashboard = dashboardData || {};
    const totalCustomers = customersData.length;
    const totalOrders = ordersData.length;
    
    // Filter only SALES orders (not purchase)
    const salesOrders = ordersData.filter(o => {
        const t = String(o.orderType || '').toLowerCase();
        return t.includes('sales') || t === '';
    });
    const completedSalesOrders = salesOrders.filter(o => o.status === 'Delivered' || o.status === 'Paid' || o.status === 'Completed');
    const totalSales = completedSalesOrders.length;
    
    // Revenue from completed sales orders only
    const revenue = dashboard.totalRevenue || completedSalesOrders
        .reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);

    // This month's revenue
    const now = new Date();
    const thisMonthSales = completedSalesOrders.filter(o => {
        const d = new Date(o.orderDate || o.createdAt);
        return !isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthRevenue = thisMonthSales.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);

    // Last month's revenue for growth
    const lastMonthSales = completedSalesOrders.filter(o => {
        const d = new Date(o.orderDate || o.createdAt);
        const lastMonth = (now.getMonth() - 1 + 12) % 12;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return !isNaN(d) && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });
    const lastMonthRevenue = lastMonthSales.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);

    const activeLeads = leadsData.filter(l => l.status !== 'Converted' && l.status !== 'Lost').length;
    const convertedLeads = leadsData.filter(l => l.status === 'Converted').length;
    const lostLeads = leadsData.filter(l => l.status === 'Lost').length;
    const totalLeads = leadsData.length;
    
    let completedTasksCount = 0;
    let pendingTasksCount = 0;
    
    tasksData.forEach(task => {
        if (task.status === 'Completed' || task.status === 'Done') {
            completedTasksCount++;
        } else {
            pendingTasksCount++;
        }
    });

    // Conversion rate from real data
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    
    // Target achieved — this month vs last month
    const targetAchieved = lastMonthRevenue > 0 
        ? Math.min(Math.round((thisMonthRevenue / lastMonthRevenue) * 100), 100) 
        : (thisMonthRevenue > 0 ? 100 : 0);

    // Revenue growth from real data
    const revenueGrowth = lastMonthRevenue > 0 
        ? parseFloat(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1))
        : (thisMonthRevenue > 0 ? 100 : 0);

    // Pending orders count
    const pendingOrders = salesOrders.filter(o => !['Delivered', 'Completed', 'Cancelled', 'Paid'].includes(o.status)).length;

    // Lead source data from real leads
    const leadSources = leadsData.reduce((acc, lead) => {
        const source = lead.source || 'Direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {});
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const leadSourceData = Object.keys(leadSources).map((key, index) => ({
        name: key,
        value: leadSources[key],
        percentage: totalLeads > 0 ? Math.round((leadSources[key] / totalLeads) * 100) : 0,
        color: colors[index % colors.length]
    }));

    // Recent orders from real data, sorted by date
    const recentOrdersData = [...salesOrders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
        .map(o => ({
            id: o._id,
            text: `${o.orderNumber || 'Order'} — ${formatINR(o.totalAmount || 0)} (${o.status})`,
            time: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            color: (o.status === 'Paid' || o.status === 'Delivered' || o.status === 'Completed') ? '#10b981' : '#3b82f6'
        }));

    function formatINR(num) {
        if (!num) return '₹0';
        return '₹' + Number(num).toLocaleString('en-IN');
    }

    const formatIndianCurrency = formatINR;

    // Monthly stats from backend for chart
    const monthlyChartData = (dashboard.charts?.monthlyStats || []).map(m => ({
        name: m.name,
        revenue: m.revenue || 0,
        orders: m.sales || 0
    }));

    const formatYAxis = (tickItem) => {
        if (tickItem >= 10000000) return `₹${(tickItem / 10000000).toFixed(1)}Cr`;
        if (tickItem >= 100000) return `₹${(tickItem / 100000).toFixed(1)}L`;
        if (tickItem >= 1000) return `₹${(tickItem / 1000).toFixed(0)}k`;
        return `₹${tickItem}`;
    };
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '6px', fontSize: '14px' }}>{label}</div>
                    {payload.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }}></span>
                            <span style={{ color: '#64748b', fontSize: '13px' }}>{p.name}:</span>
                            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>{p.name === 'Revenue' ? formatIndianCurrency(p.value) : p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Hero Banner */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-greeting">
                            {displayName} <span role="img" aria-label="wave">👋</span>
                        </div>
                        <div className="rd-subtitle">
                            {displayRole} • <span className="rd-badge-id">{displayEmail}</span> • Status: Online
                        </div>
                        
                        <div className="rd-hero-actions">
                            <button className="rd-btn-primary" onClick={() => navigate('/crm/leads')}><Filter size={18}/> View Leads</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/analytics')}><DollarSign size={18}/> Revenue</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/crm/customers')}><Users size={18}/> Customers</button>
                        </div>
                        
                        <div className="rd-hero-footer">
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Total Revenue</span>
                                <span className="rd-footer-val">{formatINR(revenue)}</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Customers</span>
                                <span className="rd-footer-val">{totalCustomers}</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Pending Orders</span>
                                <span className="rd-footer-val">{pendingOrders}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rd-hero-right">
                        <div className="rd-circle-progress" style={{'--p': `${conversionRate}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{conversionRate}%</span>
                                <span className="rd-circle-label">Conversion</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{'--p': `${targetAchieved}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{targetAchieved}%</span>
                                <span className="rd-circle-label">Target</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="rd-kpi-row">
                    <RDKPICard title="Total Revenue" value={formatINR(revenue)} trendValue={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`} icon={DollarSign} color="green" subLabel="All Time" bottomVal={`This Month: ${formatINR(thisMonthRevenue)}`} />
                    <RDKPICard title="Sales Orders" value={salesOrders.length} trendValue={`${totalSales} done`} icon={ShoppingBag} color="blue" subLabel="Total" bottomVal={`${pendingOrders} pending`} />
                    <RDKPICard title="Active Leads" value={activeLeads} trendValue={`${totalLeads} total`} icon={Target} color="orange" subLabel="Current" bottomVal={`${convertedLeads} converted`} />
                    <RDKPICard title="Conversion Rate" value={`${conversionRate}%`} trendValue={`${convertedLeads}/${totalLeads}`} icon={TrendingUp} color="purple" subLabel="Overall" bottomVal={`${lostLeads} lost`} />
                </div>

                {/* Middle Section */}
                <div className="rd-middle-row">
                    {/* Monthly Revenue & Orders Bar Chart */}
                    <div className="rd-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="rd-card-title">Monthly Revenue & Orders</div>
                        <div style={{flex: 1, minHeight: 250, marginTop: 16}}>
                            {monthlyChartData.some(m => m.revenue > 0 || m.orders > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={formatYAxis} width={55} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={30} />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59,130,246,0.05)'}} />
                                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '12px', fontSize: 12, fontWeight: 500 }} />
                                        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                                        <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: '8px'}}>
                                    <TrendingUp size={32} color="#cbd5e1" />
                                    <span>Revenue data will appear as orders are created</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rd-card">
                        <div className="rd-card-title">Quick Actions</div>
                        <div className="rd-action-stack">
                            <div className="rd-action-btn blue" onClick={() => navigate('/crm/leads')}><span className="rd-action-text">Manage Leads</span> <span>→</span></div>
                            <div className="rd-action-btn purple" onClick={() => navigate('/crm/pipeline')}><span className="rd-action-text">Sales Pipeline</span> <span>→</span></div>
                            <div className="rd-action-btn green" onClick={() => navigate('/crm')}><span className="rd-action-text">Customers</span> <span>→</span></div>
                            <div className="rd-action-btn orange" onClick={() => navigate('/orders')}><span className="rd-action-text">Orders</span> <span>→</span></div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="rd-card">
                        <div className="rd-card-title">Recent Orders</div>
                        <div className="rd-feed">
                            {recentOrdersData.length > 0 ? (
                                recentOrdersData.map((order, idx) => (
                                    <div className="rd-feed-item" key={order.id || idx} style={{cursor: 'pointer'}} onClick={() => navigate(`/orders/${order.id}`)}>
                                        <div className="rd-feed-icon" style={{background: `${order.color}15`, color: order.color}}>
                                            <ShoppingBag size={16}/>
                                        </div>
                                        <div className="rd-feed-content">
                                            <div className="rd-feed-text" style={{fontSize: '12px'}}>{order.text}</div>
                                            <div className="rd-feed-time">{order.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8'}}>No recent orders</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isCommandCenterOpen && <CommandCenter onClose={() => setIsCommandCenterOpen(false)} />}
        </div>
    );
};

export default SalesDashboard;
