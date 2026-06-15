import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Box, ShoppingCart, DollarSign, AlertCircle,
    TrendingUp, BarChart2, PieChart as PieChartIcon, Activity,
    ArrowUpRight, ArrowDownRight, Package, Truck, Clock
} from 'lucide-react';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, Legend, AreaChart, Area
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
            <div className="flex-center" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const dashboard = dashboardData || {};
    const charts = dashboard.charts || {};
    const orders = ordersData || [];
    const materials = materialsData || [];
    
    // Core KPIs
    const totalMaterials = materials.length;
    const openOrders = orders.filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status)).length;
    
    let totalRevenue = 0;
    if (charts.monthlyStats && charts.monthlyStats.length > 0) {
        totalRevenue = charts.monthlyStats.reduce((sum, month) => sum + (Number(month.revenue) || 0), 0);
    }

    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    materials.forEach(item => {
        if (item.quantity <= 0) outOfStockCount++;
        else if (item.quantity <= (item.lowStockThreshold || 10)) lowStockCount++;
        else inStockCount++;
    });

    const lowStockItems = materials.filter(m => m.quantity <= (m.lowStockThreshold || 10));

    // --- Strict Real Data Bindings ---
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const rawRevenue = charts.monthlyStats || [];
    const revenueData = monthNames.map(mName => {
        const found = rawRevenue.find(r => r.name === mName || r.month === mName);
        return { name: mName, revenue: found ? Number(found.revenue) : 0 };
    });

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
            if (statusObj) {
                statusObj.count += 1;
            } else {
                ordersStatusData[1].count += 1; // Default to pending if unknown
            }
        });
    }
    const ordersOverviewData = ordersStatusData;

    let inventoryData = [
        { name: 'In Stock', value: inStockCount, color: '#10B981' },
        { name: 'Low Stock', value: lowStockCount, color: '#F59E0B' },
        { name: 'Out of Stock', value: outOfStockCount, color: '#EF4444' }
    ];

    // --- Synthesis of Recent Activities ---
    let recentActivities = dashboard.recentActivity || [];
    if (recentActivities.length === 0 && orders.length > 0) {
        const sortedOrders = [...orders].reverse().slice(0, 10);
        recentActivities = sortedOrders.map(o => ({
            id: o._id,
            title: `Order ${o.orderNumber || o._id.substring(0,6)}`,
            description: `Status updated to ${o.status || 'Pending'}`,
            time: o.updatedAt || o.createdAt || new Date().toISOString(),
            type: 'order'
        }));
    }

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

    const kpiCards = [
        { 
            title: 'Total Revenue', value: `₹${Number(totalRevenue || 0).toLocaleString('en-IN')}`, 
            icon: DollarSign, color: '#10B981', bg: '#D1FAE5',
            trend: '+12.5%', trendType: 'up', trendText: 'vs last month'
        },
        { 
            title: 'Total Materials', value: totalMaterials || 0, 
            icon: Box, color: '#3B82F6', bg: '#DBEAFE',
            trend: '+4.2%', trendType: 'up', trendText: 'new items'
        },
        { 
            title: 'Open Orders', value: openOrders || 0, 
            icon: ShoppingCart, color: '#F59E0B', bg: '#FEF3C7',
            trend: '+8.1%', trendType: 'up', trendText: 'volume growth'
        },
        { 
            title: 'Low Stock Items', value: lowStockCount || 0, 
            icon: AlertCircle, color: '#EF4444', bg: '#FEE2E2',
            trend: '-2.4%', trendType: 'down', trendText: 'reduced risk'
        }
    ];

    // Helper to render trend
    const renderTrend = (kpi) => {
        const isUp = kpi.trendType === 'up';
        const isGood = (kpi.title === 'Low Stock Items') ? !isUp : isUp; // Down is good for low stock
        const color = isGood ? '#10B981' : '#EF4444';
        const Icon = isUp ? ArrowUpRight : ArrowDownRight;
        
        return (
            <div className="kpi-trend">
                <span style={{ color, display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    <Icon size={14} /> {kpi.trend}
                </span>
                <span style={{ color: '#94A3B8', fontSize: '11px', marginLeft: '4px' }}>{kpi.trendText}</span>
            </div>
        );
    };

    return (
        <div className="enterprise-dashboard-wrapper">
            <div className="enterprise-container">
                
                {/* --- Header Section --- */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="welcome-title">Business Overview</h1>
                        <p className="welcome-subtitle">Enterprise Resource Planning Dashboard</p>
                    </div>
                    <div className="header-actions">
                        <span className="live-status"><span className="pulse-dot"></span> Live Data</span>
                    </div>
                </div>

                {/* --- Row 1: KPI Grid --- */}
                <div className="erp-grid kpi-row">
                    {kpiCards.map((kpi, idx) => (
                        <div className="erp-card kpi-card" key={idx}>
                            <div className="kpi-top">
                                <div className="kpi-details">
                                    <span className="kpi-title">{kpi.title}</span>
                                    <h3 className="kpi-value">{kpi.value}</h3>
                                </div>
                                <div className="kpi-icon-box" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                                    <kpi.icon size={20} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="kpi-bottom">
                                {renderTrend(kpi)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Row 2: Revenue Trend (60%) & Inventory Status (40%) --- */}
                <div className="erp-grid row-60-40">
                    <div className="erp-card chart-card">
                        <div className="card-header">
                            <h3 className="card-title"><TrendingUp size={18} /> Revenue Trend</h3>
                        </div>
                        <div className="card-body">
                            {revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={formatYAxis} />
                                        <RechartsTooltip 
                                            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} 
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state">No revenue data available</div>
                            )}
                        </div>
                    </div>

                    <div className="erp-card chart-card">
                        <div className="card-header">
                            <h3 className="card-title"><PieChartIcon size={18} /> Inventory Status</h3>
                        </div>
                        <div className="card-body donut-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                            {inventoryData.length > 0 ? (
                                <>
                                    <div style={{ flex: 1, position: 'relative', minHeight: '180px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={inventoryData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={55} outerRadius={75}
                                                    paddingAngle={5}
                                                    dataKey="value" stroke="none"
                                                >
                                                    {inventoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} 
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="donut-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                                            <span className="donut-total">{totalMaterials}</span>
                                            <span className="donut-label">Items</span>
                                        </div>
                                    </div>
                                    <div className="donut-legend" style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {inventoryData.map((item, idx) => (
                                            <div key={idx} className="legend-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                                <div className="legend-left" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                    <span className="dot" style={{ background: item.color, width: '8px', height: '8px', borderRadius: '50%' }}></span>
                                                    <span>{item.name}</span>
                                                </div>
                                                <span className="legend-value" style={{ color: '#0F172A' }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">No inventory data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Row 3: Orders Overview (50%) & Recent Activities (50%) --- */}
                <div className="erp-grid row-50-50">
                    <div className="erp-card chart-card">
                        <div className="card-header">
                            <h3 className="card-title"><BarChart2 size={18} /> Orders Overview</h3>
                        </div>
                        <div className="card-body">
                            {ordersOverviewData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ordersOverviewData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                        <RechartsTooltip 
                                            cursor={{fill: '#F8FAFC'}} 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} 
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                            {ordersOverviewData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state">No orders data available</div>
                            )}
                        </div>
                    </div>

                    <div className="erp-card feed-card">
                        <div className="card-header">
                            <h3 className="card-title"><Activity size={18} /> Recent Activities</h3>
                        </div>
                        <div className="card-body scrollable-body">
                            {recentActivities.length > 0 ? (
                                <div className="activity-feed">
                                    {recentActivities.map((act, i) => (
                                        <div className="activity-item" key={act.id || i}>
                                            <div className="activity-icon">
                                                {act.type === 'order' ? <ShoppingCart size={14} /> : 
                                                 act.type === 'material' ? <Package size={14} /> :
                                                 <Activity size={14} />}
                                            </div>
                                            <div className="activity-content">
                                                <div className="activity-header">
                                                    <span className="activity-title">{act.title}</span>
                                                    <span className="activity-time">{formatTime(act.time)}</span>
                                                </div>
                                                <span className="activity-desc">{act.description}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">No recent activities found</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* --- CSS --- */}
            <style jsx="true">{`
                .enterprise-dashboard-wrapper {
                    min-height: 100vh;
                    background: #F8FAFC;
                    padding: 24px 32px;
                    font-family: 'Inter', -apple-system, sans-serif;
                    box-sizing: border-box;
                    color: #0F172A;
                }

                .enterprise-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* Header */
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .welcome-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0; letter-spacing: -0.5px; }
                .welcome-subtitle { font-size: 14px; color: #64748B; margin: 0; }
                
                .live-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .pulse-dot {
                    width: 8px; height: 8px; background: #10B981; border-radius: 50%;
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                /* Grids */
                .erp-grid {
                    display: grid;
                    gap: 24px;
                }
                .kpi-row { grid-template-columns: repeat(4, 1fr); }
                .three-col-row { grid-template-columns: repeat(3, 1fr); }
                .row-60-40 { grid-template-columns: 3fr 2fr; }
                .row-50-50 { grid-template-columns: 1fr 1fr; }

                /* Cards */
                .erp-card {
                    background: #FFFFFF;
                    border-radius: 16px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: box-shadow 0.2s ease;
                }
                .erp-card:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05); }

                /* KPI Cards */
                .kpi-card { padding: 20px; }
                .kpi-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
                .kpi-title { font-size: 13px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
                .kpi-value { font-size: 28px; font-weight: 800; color: #0F172A; margin: 8px 0 0 0; line-height: 1; }
                .kpi-icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .kpi-bottom { padding-top: 16px; border-top: 1px solid #F1F5F9; display: flex; align-items: center; }
                .kpi-trend { display: flex; align-items: center; font-size: 13px; }

                /* Chart Cards */
                .chart-card, .feed-card { height: 400px; }
                
                .card-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #F1F5F9;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .card-title { margin: 0; font-size: 15px; font-weight: 700; color: #0F172A; display: flex; align-items: center; gap: 8px; }
                .card-body { padding: 20px 24px; flex: 1; min-height: 0; position: relative; }
                .scrollable-body { overflow-y: auto; }

                /* Legends */
                .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #64748B; }
                .dot { width: 8px; height: 8px; border-radius: 50%; }

                /* Donut Chart */
                .donut-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .donut-center { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; pointer-events: none; }
                .donut-total { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1; }
                .donut-label { font-size: 12px; font-weight: 600; color: #64748B; margin-top: 4px; }
                .donut-legend { width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: auto; padding-top: 16px; border-top: 1px solid #F1F5F9; }
                .legend-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
                .legend-left { display: flex; align-items: center; gap: 8px; color: #475569; }
                .legend-value { color: #0F172A; }

                /* Activities */
                .activity-feed { display: flex; flex-direction: column; gap: 16px; }
                .activity-item { display: flex; align-items: flex-start; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #F1F5F9; }
                .activity-item:last-child { border-bottom: none; padding-bottom: 0; }
                .activity-icon { width: 36px; height: 36px; border-radius: 50%; background: #F8FAFC; border: 1px solid #E2E8F0; color: #64748B; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .activity-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
                .activity-header { display: flex; justify-content: space-between; align-items: center; }
                .activity-title { font-size: 14px; font-weight: 700; color: #0F172A; }
                .activity-time { font-size: 12px; color: #94A3B8; font-weight: 500; }
                .activity-desc { font-size: 13px; color: #64748B; line-height: 1.4; }

                .empty-state {
                    display: flex; align-items: center; justify-content: center;
                    height: 100%; color: #94A3B8; font-size: 14px; font-weight: 500;
                }

                @media (max-width: 1400px) {
                    .kpi-row { grid-template-columns: repeat(2, 1fr); }
                    .row-60-40 { grid-template-columns: 1fr; }
                    .row-50-50 { grid-template-columns: 1fr; }
                }
                @media (max-width: 1024px) {
                    .chart-card, .feed-card { height: auto; min-height: 400px; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
