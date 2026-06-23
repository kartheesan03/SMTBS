import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { NavLink } from 'react-router-dom';
import { 
    Box, ShoppingCart, DollarSign, AlertCircle,
    TrendingUp, BarChart2, PieChart as PieChartIcon, Activity,
    ArrowUpRight, ArrowDownRight, Package, Truck, Clock, Users,
    Briefcase, FileText, Settings, Bell, Shield, LifeBuoy,
    ChevronRight, CheckCircle
} from 'lucide-react';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [materialsData, setMaterialsData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, matRes, ordRes] = await Promise.all([
                API.get('/dashboard/stats').catch(e => ({ data: {} })),
                API.get('/materials').catch(e => ({ data: [] })),
                API.get('/orders').catch(e => ({ data: [] }))
            ]);
            
            setDashboardData(dashRes.data || {});
            setMaterialsData(matRes.data || []);
            setOrdersData(ordRes.data || []);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
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
    const orders = ordersData || [];
    const materials = materialsData || [];
    
    const totalMaterials = materials.length;
    const openOrders = orders.filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status)).length;
    
    let totalRevenue = 0;
    if (charts.monthlyStats && charts.monthlyStats.length > 0) {
        totalRevenue = charts.monthlyStats.reduce((sum, month) => sum + (Number(month.revenue) || 0), 0);
    }

    const totalEmployees = dashboard.totalEmployees || dashboard.hrStats?.totalEmployees || 0;
    const activeCustomers = dashboard.activeCustomers || 0;

    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    materials.forEach(item => {
        if (item.quantity <= 0) outOfStockCount++;
        else if (item.quantity <= (item.lowStockThreshold || 10)) lowStockCount++;
        else inStockCount++;
    });

    const formatYAxis = (value) => {
        if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 !== 0 ? 1 : 0)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
        return `₹${value}`;
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'Recently';
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getRelativeTime = (isoString) => {
        if (!isoString) return 'Just now';
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const getInitials = (name) => {
        if (!name) return 'S';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const kpiCards = [
        { 
            title: 'Total Revenue', value: `₹${Number(totalRevenue || 0).toLocaleString('en-IN')}`, 
            icon: DollarSign, color: '#3b82f6', trend: '+12.5%', trendType: 'up'
        },
        { 
            title: 'Total Materials', value: totalMaterials || 0, 
            icon: Package, color: '#8b5cf6', trend: '+4.2%', trendType: 'up'
        },
        { 
            title: 'Open Orders', value: openOrders || 0, 
            icon: ShoppingCart, color: '#10b981', trend: '+8.1%', trendType: 'up'
        },
        { 
            title: 'Active Customers', value: activeCustomers || 0, 
            icon: Users, color: '#f59e0b', trend: '+15.3%', trendType: 'up'
        }
    ];

    let inventoryData = [
        { name: 'In Stock', value: inStockCount, color: '#10B981' },
        { name: 'Low Stock', value: lowStockCount, color: '#F59E0B' },
        { name: 'Out of Stock', value: outOfStockCount, color: '#EF4444' }
    ];

    const ordersStatusData = [
        { name: 'Delivered', count: 0, color: '#10B981' },
        { name: 'Pending', count: 0, color: '#F59E0B' },
        { name: 'Processing', count: 0, color: '#3B82F6' },
        { name: 'Cancelled', count: 0, color: '#EF4444' }
    ];

    if (orders.length > 0) {
        orders.forEach(o => {
            const statusName = (o.status || 'Pending').toLowerCase();
            const statusObj = ordersStatusData.find(s => s.name.toLowerCase() === statusName);
            if (statusObj) statusObj.count += 1;
            else ordersStatusData[1].count += 1;
        });
    }

    let recentActivities = dashboard.recentActivity || [];
    if (recentActivities.length === 0 && orders.length > 0) {
        recentActivities = [...orders].reverse().slice(0, 8).map(o => ({
            id: o._id,
            title: `Order ${o.orderNumber || o._id.substring(0,6)}`,
            description: `Status updated to ${o.status || 'Pending'}`,
            time: o.updatedAt || o.createdAt || new Date().toISOString(),
            type: 'order'
        }));
    }

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <div>
                    <h1>Enterprise Overview</h1>
                    <p>Live business metrics and operational status</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div className="status-badge">
                        <span className="pulse-dot"></span> System Operational
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Last Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* KPI ROW */}
            <div className="kpi-grid">
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="kpi-card" style={{ borderTop: `3px solid ${kpi.color}` }}>
                        <div className="kpi-header">
                            <span className="kpi-title">{kpi.title}</span>
                            <div className="icon-wrapper" style={{ color: kpi.color, backgroundColor: `${kpi.color}15` }}>
                                <kpi.icon size={28} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="kpi-body">
                            <h3>{kpi.value}</h3>
                            <div className={`trend-badge ${kpi.trendType === 'up' ? 'positive' : 'negative'}`}>
                                {kpi.trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {kpi.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN DASHBOARD CONTENT */}
            <div className="dashboard-grid">
                
                {/* Left Column: Charts */}
                <div className="charts-column">
                    <div className="chart-card">
                        <div className="card-header">
                            <div>
                                <h2>Inventory Health</h2>
                                <span className="last-updated" style={{ fontSize: '11px', color: 'var(--text-disabled)', display: 'block', marginTop: '4px' }}>Last updated: Just now</span>
                            </div>
                            <button className="icon-btn"><Activity size={16}/></button>
                        </div>
                        <div className="chart-body">
                            {inventoryData.length > 0 ? (
                                <div className="donut-container">
                                    <div className="donut-chart-wrapper">
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie
                                                    data={inventoryData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={80} outerRadius={105}
                                                    paddingAngle={4}
                                                    dataKey="value" stroke="none"
                                                >
                                                    {inventoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip cursor={false} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="donut-center">
                                            <div className="donut-value">{totalMaterials}</div>
                                            <div className="donut-label">Total Items</div>
                                        </div>
                                    </div>
                                    <div className="chart-legend">
                                        {inventoryData.map((item, idx) => {
                                            const percentage = totalMaterials > 0 ? Math.round((item.value / totalMaterials) * 100) : 0;
                                            return (
                                                <div key={idx} className="legend-item">
                                                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                                    {item.name}
                                                    <span className="legend-value">{item.value} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>({percentage}%)</span></span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">No inventory data available</div>
                            )}
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="card-header">
                            <div>
                                <h2>Order Fulfillment Pipeline</h2>
                                <span className="last-updated" style={{ fontSize: '11px', color: 'var(--text-disabled)', display: 'block', marginTop: '4px' }}>Last updated: Just now</span>
                            </div>
                            <button className="icon-btn"><BarChart2 size={16}/></button>
                        </div>
                        <div className="chart-body">
                            {ordersStatusData.length > 0 && ordersStatusData.some(d => d.count > 0) ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={ordersStatusData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barSize={36}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {ordersStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state" style={{ height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
                                    <BarChart2 size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                    <span>No active orders in the pipeline</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & App Launcher */}
                <div className="stats-column">
                    
                    <div className="app-launcher-card">
                        <div className="card-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="launcher-grid">
                            {[
                                { path: '/materials', name: 'Inventory', icon: Package, color: '#3b82f6' },
                                { path: '/hrms', name: 'HRMS', icon: Users, color: '#8b5cf6' },
                                { path: '/erp', name: 'Orders', icon: ShoppingCart, color: '#10b981' },
                                { path: '/analytics', name: 'Reports', icon: FileText, color: '#f59e0b' }
                            ].map((link, idx) => (
                                <NavLink to={link.path} key={idx} className="launcher-btn">
                                    <div className="launcher-icon" style={{ color: link.color, backgroundColor: `${link.color}15` }}>
                                        <link.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <span>{link.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div className="stat-list-card">
                        <div className="card-header">
                            <h2>HR & Operations Overview</h2>
                        </div>
                        <div className="stat-list">
                            <div className="stat-row">
                                <div className="stat-label-container">
                                    <Users size={16} color="#64748b" />
                                    <span className="stat-label">Total Employees</span>
                                </div>
                                <span className="stat-value">{dashboard.hrStats?.totalEmployees || 0}</span>
                            </div>
                            <div className="stat-row">
                                <div className="stat-label-container">
                                    <CheckCircle size={16} color="#10b981" />
                                    <span className="stat-label">Present Today</span>
                                </div>
                                <span className="stat-value success">{dashboard.hrStats?.presentToday || 0}</span>
                            </div>
                            <div className="stat-row">
                                <div className="stat-label-container">
                                    <Clock size={16} color="#f59e0b" />
                                    <span className="stat-label">On Leave</span>
                                </div>
                                <span className="stat-value warning">{dashboard.hrStats?.onLeave || 0}</span>
                            </div>
                            <div className="stat-row">
                                <div className="stat-label-container">
                                    <DollarSign size={16} color="#3b82f6" />
                                    <span className="stat-label">Avg Order Value</span>
                                </div>
                                <span className="stat-value">{formatYAxis(orders.length ? totalRevenue / orders.length : 0)}</span>
                            </div>
                            <div className="stat-row">
                                <div className="stat-label-container">
                                    <Briefcase size={16} color="#8b5cf6" />
                                    <span className="stat-label">Active Projects</span>
                                </div>
                                <span className="stat-value primary">{dashboard.managerStats?.activeProjects || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="activity-card">
                        <div className="card-header">
                            <h2>Recent Activity</h2>
                            <button className="text-btn">View All</button>
                        </div>
                        <div className="activity-list">
                            {recentActivities.slice(0, 4).map((act, i) => (
                                <div key={act.id || i} className="activity-item">
                                    <div className="activity-avatar" style={{ 
                                        backgroundColor: act.type === 'order' ? '#10b98115' : act.type === 'material' ? '#3b82f615' : '#f59e0b15',
                                        color: act.type === 'order' ? '#10b981' : act.type === 'material' ? '#3b82f6' : '#f59e0b',
                                        border: `1px solid ${act.type === 'order' ? '#10b98130' : act.type === 'material' ? '#3b82f630' : '#f59e0b30'}`
                                    }}>
                                        {getInitials(act.userName || act.title)}
                                    </div>
                                    <div className="activity-content">
                                        <h4>{act.title}</h4>
                                        <p>{act.description}</p>
                                    </div>
                                    <div className="activity-time">{getRelativeTime(act.time)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .admin-dashboard {
                    padding: 32px 40px;
                    background-color: #f8fafc;
                    min-height: calc(100vh - 64px);
                    font-family: 'Inter', -apple-system, sans-serif;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .page-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                    letter-spacing: -0.02em;
                }

                .page-header p {
                    font-size: 15px;
                    color: #64748b;
                    margin: 0;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #334155;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .status-badge:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #059669;
                    border-radius: 50%;
                    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2);
                }

                /* KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-3);
                    margin-bottom: var(--space-3);
                }

                .kpi-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    padding: var(--space-3);
                    box-shadow: var(--shadow-sm);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .kpi-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .kpi-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .icon-wrapper {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .kpi-body {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    gap: 8px;
                }

                .kpi-body h3 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.02em;
                    white-space: nowrap;
                }

                .donut-chart-wrapper {
                    position: relative;
                    flex: 1;
                }

                .trend-badge {
                    flex-shrink: 0;
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .trend-badge.positive {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }

                .trend-badge.negative {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                /* Dashboard Main Grid */
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: var(--space-3);
                }

                .charts-column {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .stats-column {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                /* Cards General */
                .chart-card, .app-launcher-card, .stat-list-card, .activity-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    padding: var(--space-3);
                    box-shadow: var(--shadow-sm);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-3);
                }

                .card-header h2 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0;
                }

                .icon-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                }

                .icon-btn:hover {
                    background: #f1f5f9;
                    color: #475569;
                }

                .text-btn {
                    background: transparent;
                    border: none;
                    color: #3b82f6;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .text-btn:hover {
                    text-decoration: underline;
                }

                /* Donut Chart Inner Styles */
                .donut-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .donut-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    pointer-events: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .donut-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1;
                }

                .donut-label {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                    margin-top: 4px;
                }

                .chart-legend {
                    min-width: 160px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 16px;
                    padding-left: 24px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    color: #475569;
                    font-weight: 500;
                }

                .legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 3px;
                    margin-right: 12px;
                }

                .legend-value {
                    margin-left: auto;
                    font-weight: 600;
                    color: #0f172a;
                }

                /* App Launcher */
                .launcher-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-2);
                }

                .launcher-btn {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border: 1px solid #e2e8f0;
                    border-radius: var(--radius-sm);
                    text-decoration: none;
                    color: var(--text-heading);
                    font-weight: 600;
                    font-size: 14px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                }

                .launcher-btn:hover {
                    transform: translateY(-2px);
                    background: #ffffff;
                    border-color: #cbd5e1;
                    box-shadow: var(--shadow-md);
                }

                .launcher-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Stat List */
                .stat-list {
                    display: flex;
                    flex-direction: column;
                }

                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .stat-row:last-child {
                    border-bottom: none;
                }

                .stat-label-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .stat-label {
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                }

                .stat-value {
                    font-size: 15px;
                    font-weight: 600;
                    color: #0f172a;
                }

                .stat-value.success { color: #10b981; }
                .stat-value.warning { color: #f59e0b; }
                .stat-value.primary { color: #3b82f6; }

                /* Activity List */
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                }

                .activity-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .activity-content h4 {
                    margin: 0 0 4px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #0f172a;
                }

                .activity-content p {
                    margin: 0;
                    font-size: 13px;
                    color: #64748b;
                }

                .activity-time {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 500;
                    white-space: nowrap;
                    margin-left: auto;
                }

                .empty-state {
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 500;
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    .kpi-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .donut-container {
                        flex-direction: column;
                        gap: 24px;
                    }
                    .chart-legend {
                        padding-left: 0;
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }

                @media (max-width: 768px) {
                    .kpi-grid {
                        grid-template-columns: 1fr;
                    }
                    .admin-dashboard {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
