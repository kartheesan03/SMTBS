import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Box, ShoppingCart, DollarSign, 
    TrendingUp, Activity, AlertCircle,
    UserCheck, Bell, Briefcase, Layers, BarChart2
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [materialsData, setMaterialsData] = useState([]);
    const [customersData, setCustomersData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, matRes, custRes, ordRes, empRes] = await Promise.all([
                API.get('/dashboard/stats').catch(e => ({ data: {} })),
                API.get('/materials').catch(e => ({ data: [] })),
                API.get('/customers').catch(e => ({ data: [] })),
                API.get('/orders').catch(e => ({ data: [] })),
                API.get('/employees').catch(e => ({ data: [] }))
            ]);
            
            setDashboardData(dashRes.data || {});
            setMaterialsData(matRes.data || []);
            setCustomersData(Array.isArray(custRes.data) ? custRes.data : []);
            setOrdersData(ordRes.data || []);
            
            const emps = Array.isArray(empRes.data) ? empRes.data : (empRes.data?.employees || []);
            console.log("Employee count:", emps.length);
            setEmployeesData(emps);
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
            <div className="flex-center" style={{ height: '80vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const dashboard = dashboardData || {};
    const hrStats = dashboard.hrStats || {};
    const charts = dashboard.charts || {};
    const tables = dashboard.tables || {};

    // --- Data Preparation ---
    const customers = customersData || [];
    const orders = ordersData || [];
    const employees = employeesData || [];
    
    const totalEmployees = employees.length;
    const openOrders = orders.filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status)).length;
    const activeCustomers = customers.length;
    
    const normalizeOrderType = (type) => {
        if (!type) return '';
        const t = String(type).toUpperCase();
        if (t.includes('SALES')) return 'SALES';
        if (t.includes('PURCHASE')) return 'PURCHASE';
        return t;
    };

    const revenueData = charts.monthlyStats && charts.monthlyStats.length > 0 
        ? charts.monthlyStats 
        : [];

    const totalRevenue = revenueData.reduce((sum, month) => sum + (Number(month.revenue) || 0), 0);

    // Dynamic Material Status Calculation
    const materials = materialsData || [];
    const totalMaterials = materials.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    materials.forEach(item => {
        if (item.quantity === 0) {
            outOfStockCount++;
        } else if (item.quantity <= (item.lowStockThreshold || 0)) {
            lowStockCount++;
        } else {
            inStockCount++;
        }
    });

    const lowStockKpiCount = lowStockCount + outOfStockCount;

    console.log("--- ADMIN DASHBOARD DATA LOGS ---");
    console.log("customers.length:", customers.length);
    console.log("materials.length:", totalMaterials);
    console.log("orders.length:", orders.length);
    console.log("employees.length:", employees.length);
    console.log("dashboard totalEmployees:", totalEmployees);

    // Charts Data

    const materialGroups = materials.reduce((acc, m) => {
        const cat = m.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});
    const defaultColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e'];
    const materialOverviewData = Object.keys(materialGroups).length > 0
        ? Object.keys(materialGroups).map((key, i) => ({ name: key, value: materialGroups[key], color: defaultColors[i % defaultColors.length] }))
        : [];

    const stockStatusData = [
        { name: 'In Stock', count: inStockCount, fill: '#10b981' },
        { name: 'Low Stock', count: lowStockCount, fill: '#f59e0b' },
        { name: 'Out of Stock', count: outOfStockCount, fill: '#ef4444' },
    ];

    const orderStatuses = orders.reduce((acc, o) => {
        const status = o.status || 'Pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    const salesPipelineData = Object.keys(orderStatuses).length > 0
        ? Object.keys(orderStatuses).map((key, i) => ({ stage: key, value: orderStatuses[key], fill: defaultColors[i % defaultColors.length] }))
        : [];

    const recentActivities = tables.recentActivity || [];

    return (
        <div className="admin-dashboard-layout">
            <div className="admin-main-content">

                <div className="header-section">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Enterprise Command Center</p>
                </div>

                {/* --- Top KPI Cards (STRICTLY One Horizontal Row of 6) --- */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Box size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Materials</span>
                            <h3 className="kpi-value">{totalMaterials.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><AlertCircle size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Low Stock Items</span>
                            <h3 className="kpi-value">{lowStockKpiCount}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Users size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Employees</span>
                            <h3 className="kpi-value">{totalEmployees.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfeff', color: '#0891b2' }}><ShoppingCart size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Open Orders</span>
                            <h3 className="kpi-value">{openOrders.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><Briefcase size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Active Customers</span>
                            <h3 className="kpi-value">{activeCustomers}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Revenue</span>
                            <h3 className="kpi-value">₹{Number(totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                        </div>
                    </div>
                </div>

                {/* --- Grid Row 1 (3 Columns) --- */}
                <div className="charts-grid-3">
                    
                    {/* Material Overview Donut Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Layers size={16} /> Material Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {materialOverviewData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                    <Pie
                                        data={materialOverviewData}
                                        cx="50%" cy="50%"
                                        innerRadius={45} outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value" stroke="none"
                                    >
                                        {materialOverviewData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>No materials available</span>
                            )}
                        </div>
                    </div>

                    {/* Stock Status Bar Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><BarChart2 size={16} /> Stock Status</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stockStatusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                                        {stockStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity Panel */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={16} /> Recent Activity</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px', overflowY: 'auto' }}>
                            {recentActivities.length > 0 ? (
                                <div className="timeline">
                                    {recentActivities.map((activity, i) => (
                                        <div className="timeline-item" key={activity.id || i}>
                                            <div className="timeline-dot" style={{ borderColor: '#3b82f6' }}></div>
                                            <div className="timeline-content">
                                                <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: 600, color: '#334155' }}>{activity.text}</p>
                                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{activity.time ? new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px' }}>No recent activity</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* --- Grid Row 2 (3 Columns) --- */}
                <div className="charts-grid-3">
                    
                    {/* HR Overview Summary */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><UserCheck size={16} /> HR Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '220px' }}>
                            <div className="hr-stat-row">
                                <div>
                                    <span className="stat-label">Present Today</span>
                                    <h4 className="stat-value text-success">{hrStats.presentToday || 0}</h4>
                                </div>
                                <div>
                                    <span className="stat-label">On Leave</span>
                                    <h4 className="stat-value text-warning">{hrStats.onLeave || 0}</h4>
                                </div>
                            </div>
                            <div className="hr-stat-row">
                                <div>
                                    <span className="stat-label">Pending Payroll</span>
                                    <h4 className="stat-value text-primary">{dashboard.stats?.pendingSalaries || 0}</h4>
                                </div>
                                <div>
                                    <span className="stat-label">Open Roles</span>
                                    <h4 className="stat-value">0</h4>
                                </div>
                            </div>
                            <button className="action-btn-outline" style={{width: '100%', marginTop: 'auto', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'transparent', color: '#3b82f6', fontWeight: 600, fontSize: '12px', cursor: 'pointer'}}>View HRMS</button>
                        </div>
                    </div>

                    {/* Sales Pipeline Funnel Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><TrendingUp size={16} /> Sales Pipeline</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {salesPipelineData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={salesPipelineData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                        {salesPipelineData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>No orders found</span>
                            )}
                        </div>
                    </div>

                    {/* Revenue Overview Line Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={16} /> Revenue Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={1} dot={{ r: 1, strokeWidth: 1 }} activeDot={{ r: 1 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>No revenue data available</span>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* --- Embedded CSS --- */}
            <style jsx="true">{`
                .admin-dashboard-layout {
                    display: block;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .admin-main-content {
                    padding: 20px 24px;
                    height: 100vh;
                    overflow-y: auto;
                }

                .header-section { margin-bottom: 16px; }
                .page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0; }
                .page-subtitle { font-size: 13px; color: #64748b; margin: 0; }

                /* KPI Grid (STRICTLY 1 Horizontal Row of 6) */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .kpi-card {
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                }
                .kpi-icon-wrapper {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-label { display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 2px; }
                .kpi-value { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }

                /* Charts Grid Rows */
                .charts-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .bento-card {
                    background: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .bento-card-header { padding: 12px 14px 0; }
                .bento-card-title { font-size: 13px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px; }
                .bento-card-body { padding: 14px; flex: 1; }

                /* Timeline */
                .timeline { position: relative; padding-left: 12px; border-left: 2px solid #e2e8f0; display: flex; flex-direction: column; gap: 12px; }
                .timeline-item { position: relative; }
                .timeline-dot { position: absolute; left: -19px; top: 2px; width: 10px; height: 10px; border-radius: 50%; background: #ffffff; border: 2px solid #3b82f6; }

                /* HR Overview */
                .hr-stat-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; }
                .stat-label { font-size: 11px; color: #64748b; font-weight: 600; display: block; margin-bottom: 2px; }
                .stat-value { font-size: 16px; font-weight: 800; margin: 0; color: #0f172a; }
                .text-success { color: #10b981; }
                .text-warning { color: #f59e0b; }
                .text-primary { color: #3b82f6; }
                .action-btn-outline:hover { background: #eff6ff !important; }

                /* Prevent collapsing of 6 columns to ensure horizontal row layout on most screens */
                @media (max-width: 768px) {
                    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
                    .charts-grid-3 { grid-template-columns: 1fr; }
                    .admin-main-content { padding: 16px; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
