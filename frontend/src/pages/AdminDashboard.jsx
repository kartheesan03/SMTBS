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
    const activeCustomers = dashboard.totalCustomers || 0;

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
        <div className="main-content">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Business Overview</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Enterprise Resource Planning Dashboard</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span> Live Data
                    </span>
                </div>
            </div>

            {/* ===== KPI ROW ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="bento-card kpi-card-bento" style={{ position: 'relative', overflow: 'hidden', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.title}</div>
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${kpi.color}15`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <kpi.icon size={14} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1 }}>{kpi.value}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: kpi.title === 'Low Stock Items' ? (kpi.trendType === 'down' ? '#10b981' : '#ef4444') : (kpi.trendType === 'up' ? '#10b981' : '#ef4444') }}>
                            {kpi.trendType === 'up' ? <ArrowUpRight size={12} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={12} style={{ marginRight: '4px' }}/>}
                            {kpi.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== ROW 1: Material Overview (4) + Stock & Order (5) + Quick Actions (3) ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: '4fr 5fr 3fr', gap: '20px', marginBottom: '20px' }}>

                {/* Material Overview */}
                <div className="bento-card" style={{ borderRadius: '14px', display: 'flex', flexDirection: 'column', minHeight: '260px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><PieChartIcon size={16} /> Material Overview</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px 24px 24px', overflow: 'hidden' }}>
                        {inventoryData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1, minHeight: '160px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                            <Pie
                                                data={inventoryData}
                                                cx="50%" cy="50%"
                                                innerRadius={50} outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value" stroke="none"
                                            >
                                                {inventoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{totalMaterials}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', paddingTop: '12px', flexShrink: 0 }}>
                                    {inventoryData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No data</div>
                        )}
                    </div>
                </div>

                {/* Stock & Order Status */}
                <div className="bento-card" style={{ borderRadius: '14px', display: 'flex', flexDirection: 'column', minHeight: '260px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><BarChart2 size={16} /> Stock & Order Status</h3>
                    </div>
                    <div style={{ flex: 1, padding: '0 24px 24px 24px', overflow: 'hidden' }}>
                        {ordersStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ordersStatusData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {ordersStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No data</div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bento-card" style={{ borderRadius: '14px', padding: '18px', minHeight: '260px', overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', margin: '0 0 16px 0' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { path: '/materials', name: 'Material Tracking', icon: Package, color: '#3b82f6' },
                            { path: '/hrms', name: 'HR Management', icon: Users, color: '#8b5cf6' },
                            { path: '/erp', name: 'ERP Operations', icon: ShoppingCart, color: '#10b981' },
                            { path: '/crm', name: 'CRM Management', icon: Briefcase, color: '#f59e0b' },
                            { path: '/analytics', name: 'Reports & Analytics', icon: BarChart2, color: '#ec4899' },
                            { path: '/hrms', name: 'User Management', icon: Shield, color: '#64748b' }
                        ].map((link, idx) => (
                            <NavLink to={link.path} key={idx} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#0f172a', fontWeight: 500, fontSize: '13px', transition: 'all 0.2s' }} className="quick-action-link">
                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${link.color}15`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0 }}>
                                    <link.icon size={14} />
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
                <div className="bento-card" style={{ borderRadius: '14px', display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
                    <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><Users size={16} /> HR Overview</h3>
                    </div>
                    <div style={{ padding: '0 18px 18px 18px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
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
                <div className="bento-card" style={{ borderRadius: '14px', display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
                    <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><ShoppingCart size={16} /> ERP Overview</h3>
                    </div>
                    <div style={{ padding: '0 18px 18px 18px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
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
                <div className="bento-card" style={{ borderRadius: '14px', display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
                    <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><TrendingUp size={16} /> Revenue Quick Stats</h3>
                    </div>
                    <div style={{ padding: '0 18px 18px 18px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
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
            <div className="bento-card" style={{ borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Recent Activity</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                    {recentActivities.length > 0 ? (
                        recentActivities.slice(0, 8).map((act, i) => (
                            <div key={act.id || i} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
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

export default AdminDashboard;
