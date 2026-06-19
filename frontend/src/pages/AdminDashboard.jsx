import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { NavLink } from 'react-router-dom';
import { 
    Box, ShoppingCart, DollarSign, AlertCircle,
    TrendingUp, BarChart2, PieChart as PieChartIcon, Activity,
    ArrowUpRight, ArrowDownRight, Package, Truck, Clock, Users,
    Briefcase, FileText, Settings, Bell, Shield, LifeBuoy
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
            <div className="flex-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
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

    const kpiCards = [
        { 
            title: 'Total Revenue', value: `₹${Number(totalRevenue || 0).toLocaleString('en-IN')}`, 
            icon: DollarSign, color: '#10B981', trend: '+12.5%', trendType: 'up'
        },
        { 
            title: 'Total Materials', value: totalMaterials || 0, 
            icon: Package, color: '#3B82F6', trend: '+4.2%', trendType: 'up'
        },
        { 
            title: 'Open Orders', value: openOrders || 0, 
            icon: ShoppingCart, color: '#F59E0B', trend: '+8.1%', trendType: 'up'
        },
        { 
            title: 'Active Customers', value: activeCustomers || 0, 
            icon: Users, color: '#6366F1', trend: '+15.3%', trendType: 'up'
        },
        { 
            title: 'Total Employees', value: totalEmployees || 0, 
            icon: Briefcase, color: '#8B5CF6', trend: '+2.1%', trendType: 'up'
        },
        { 
            title: 'Low Stock Items', value: lowStockCount || 0, 
            icon: AlertCircle, color: '#EF4444', trend: '-2.4%', trendType: 'down'
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
        <div className="module-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Business Overview</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Enterprise Resource Planning Dashboard</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 0 2px var(--success-bg)' }}></span> Live Data System
                    </span>
                </div>
            </div>

            {/* ===== KPI ROW ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="dashboard-card-3d" style={{ position: 'relative', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '110px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.title}</div>
                            <div style={{ color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <kpi.icon size={16} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)', margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>{kpi.value}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 700, color: kpi.title === 'Low Stock Items' ? (kpi.trendType === 'down' ? 'var(--success)' : 'var(--danger)') : (kpi.trendType === 'up' ? 'var(--success)' : 'var(--danger)'), padding: '4px 6px', background: kpi.title === 'Low Stock Items' ? (kpi.trendType === 'down' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)') : (kpi.trendType === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'), borderRadius: '4px' }}>
                                {kpi.trendType === 'up' ? <ArrowUpRight size={12} style={{ marginRight: '2px' }}/> : <ArrowDownRight size={12} style={{ marginRight: '2px' }}/>}
                                {kpi.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== ROW 1: Material Overview (4) + Stock & Order (5) + Quick Actions (3) ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: '4fr 5fr 3fr', gap: '24px', marginBottom: '24px' }}>

                {/* Material Overview */}
                <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><PieChartIcon size={18} /> Material Overview</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {inventoryData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1, minHeight: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={inventoryData}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={85}
                                                paddingAngle={2}
                                                dataKey="value" stroke="none"
                                            >
                                                {inventoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '13px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{totalMaterials}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Total</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', paddingTop: '16px', flexShrink: 0 }}>
                                    {inventoryData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color, flexShrink: 0 }}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No data available</div>
                        )}
                    </div>
                </div>

                {/* Stock & Order Status */}
                <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={18} /> Stock & Order Status</h3>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', marginLeft: '-24px' }}>
                        {ordersStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ordersStatusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} />
                                    <RechartsTooltip cursor={{fill: 'var(--bg-hover)'}} formatter={(value) => [value, 'Orders']} contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '13px' }} labelStyle={{ color: 'var(--text-heading)', marginBottom: '4px', textTransform: 'capitalize' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {ordersStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No data available</div>
                        )}
                    </div>
                </div>

                {/* App Launcher */}
                <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={16} /> Application Launcher</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', flex: 1, alignContent: 'start' }}>
                        {[
                            { path: '/materials', name: 'Materials', icon: Package, color: '#3b82f6' },
                            { path: '/hrms', name: 'HRMS', icon: Users, color: '#8b5cf6' },
                            { path: '/erp', name: 'ERP', icon: ShoppingCart, color: '#10b981' },
                            { path: '/crm', name: 'CRM', icon: Briefcase, color: '#f59e0b' },
                            { path: '/analytics', name: 'Analytics', icon: BarChart2, color: '#ec4899' },
                            { path: '/settings', name: 'Settings', icon: Settings, color: '#64748b' }
                        ].map((link, idx) => (
                            <NavLink to={link.path} key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-heading)', fontWeight: 600, fontSize: '12px', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', aspectRatio: '1/1' }} className="quick-action-link dashboard-card-3d">
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${link.color}10`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                    <link.icon size={20} strokeWidth={2.5} />
                                </div>
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== ROW 2: HR Overview (4) + ERP Overview (4) + Revenue Quick Stats (4) ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>

                {/* HR Overview */}
                <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '240px' }}>
                    <div style={{ paddingBottom: '16px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><Users size={16} /> HR Overview</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Total Employees</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{dashboard.hrStats?.totalEmployees || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Present Today</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{dashboard.hrStats?.presentToday || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>On Leave</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>{dashboard.hrStats?.onLeave || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>New Joiners</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>{dashboard.hrStats?.newJoiners || 0}</span>
                        </div>
                    </div>
                </div>

                {/* ERP Overview */}
                <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '240px' }}>
                    <div style={{ paddingBottom: '16px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><ShoppingCart size={16} /> ERP Overview</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Open Orders</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{openOrders}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Low Stock</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>{lowStockCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Out of Stock</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>{outOfStockCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Active Projects</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>{dashboard.managerStats?.activeProjects || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Revenue Quick Stats */}
                <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '240px' }}>
                    <div style={{ paddingBottom: '16px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><TrendingUp size={16} /> Revenue Quick Stats</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>YTD Revenue</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{formatYAxis(totalRevenue)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Avg Order Value</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{formatYAxis(orders.length ? totalRevenue / orders.length : 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Total Orders</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{orders.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Customer Count</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>{activeCustomers}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== ROW 3: Recent Activity (Full Width) ===== */}
            <div className="dashboard-card-3d" style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Recent Activity</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                    {recentActivities.length > 0 ? (
                        recentActivities.slice(0, 8).map((act, i) => (
                            <div key={act.id || i} className="activity-card-3d" style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {act.type === 'order' ? <ShoppingCart size={14} /> : 
                                     act.type === 'material' ? <Package size={14} /> :
                                     <Activity size={14} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 4px 0', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.description}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{formatTime(act.time)}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>No recent activity</div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
