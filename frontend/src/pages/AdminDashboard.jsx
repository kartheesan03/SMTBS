import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Box, ShoppingCart, DollarSign, 
    TrendingUp, Activity, Calendar, Clock, AlertCircle,
    FileText, UserCheck, Inbox, CheckSquare, Bell,
    Briefcase, ArrowUpRight, ArrowDownRight, Layers, BarChart2, Zap, Search, ChevronDown, CheckCircle, Shield
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';

const AdminDashboard = () => {
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

    const stats = dashboardData.stats || {};
    const hrStats = dashboardData.hrStats || {};
    const charts = dashboardData.charts || {};
    const tables = dashboardData.tables || {};

    // --- Data Preparation ---
    const totalMaterials = dashboardData.totalMaterials || 0;
    const lowStockCount = (tables.lowStock || []).length || 2;
    const totalEmployees = dashboardData.totalEmployees || 0;
    const openOrders = dashboardData.openOrders || 0;
    const activeCustomers = 42; // Simulated
    const totalRevenue = dashboardData.totalRevenue || 0;

    // Charts Data
    const revenueData = charts.monthlyStats && charts.monthlyStats.length > 0 
        ? charts.monthlyStats 
        : [
            { name: 'Jan', revenue: 4000 },
            { name: 'Feb', revenue: 3000 },
            { name: 'Mar', revenue: 2000 },
            { name: 'Apr', revenue: 2780 },
            { name: 'May', revenue: 1890 },
            { name: 'Jun', revenue: 2390 },
        ];

    const materialOverviewData = [
        { name: 'Raw Materials', value: 45, color: '#3b82f6' },
        { name: 'Finished Goods', value: 30, color: '#8b5cf6' },
        { name: 'Packaging', value: 15, color: '#10b981' },
        { name: 'Consumables', value: 10, color: '#f59e0b' },
    ];

    const stockStatusData = [
        { name: 'In Stock', count: 85, fill: '#10b981' },
        { name: 'Low Stock', count: lowStockCount, fill: '#f59e0b' },
        { name: 'Out of Stock', count: 3, fill: '#ef4444' },
    ];

    const salesPipelineData = [
        { stage: 'Leads', value: 120, fill: '#e2e8f0' },
        { stage: 'Qualified', value: 80, fill: '#94a3b8' },
        { stage: 'Proposals', value: 50, fill: '#64748b' },
        { stage: 'Negotiation', value: 30, fill: '#475569' },
        { stage: 'Closed Won', value: 15, fill: '#3b82f6' },
    ];

    const recentActivities = tables.recentActivity || [
        { id: 1, text: 'New employee onboarded', time: new Date(Date.now() - 3600000) },
        { id: 2, text: 'Order #1024 delivered', time: new Date(Date.now() - 7200000) },
        { id: 3, text: 'Invoice #INV-22 paid', time: new Date(Date.now() - 86400000) },
    ];

    const rightPanelFeatures = [
        { title: 'Centralized Overview', icon: <Layers size={18} /> },
        { title: 'Material Tracking', icon: <Box size={18} /> },
        { title: 'HR Management', icon: <Users size={18} /> },
        { title: 'ERP Operations', icon: <Briefcase size={18} /> },
        { title: 'CRM Management', icon: <ShoppingCart size={18} /> },
        { title: 'Reports & Analytics', icon: <BarChart2 size={18} /> },
        { title: 'User & Role Management', icon: <UserCheck size={18} /> },
        { title: 'System Management', icon: <Shield size={18} /> },
        { title: 'Notifications & Alerts', icon: <Bell size={18} /> }
    ];

    return (
        <div className="admin-dashboard-layout">
            <div className="admin-main-content">
                {/* --- Top Nav Bar --- */}
                <div className="top-nav-bar">
                    <div className="search-bar">
                        <Search size={18} color="#94a3b8" />
                        <input type="text" placeholder="Search anything..." />
                    </div>
                    <div className="nav-actions">
                        <div className="date-filter">
                            <Calendar size={16} />
                            <span>This Month</span>
                            <ChevronDown size={14} />
                        </div>
                        <button className="icon-btn notification-btn">
                            <Bell size={20} />
                            <span className="notif-badge"></span>
                        </button>
                        <div className="profile-dropdown">
                            <div className="avatar">A</div>
                            <div className="profile-info">
                                <span className="p-name">Admin User</span>
                                <span className="p-role">Super Admin</span>
                            </div>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>

                <div className="header-section">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Enterprise Command Center</p>
                </div>

                {/* --- Top KPI Cards (One Horizontal Row) --- */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Box size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Materials</span>
                            <h3 className="kpi-value">{totalMaterials.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><AlertCircle size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Low Stock Items</span>
                            <h3 className="kpi-value">{lowStockCount}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Users size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Employees</span>
                            <h3 className="kpi-value">{totalEmployees.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfeff', color: '#0891b2' }}><ShoppingCart size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Open Orders</span>
                            <h3 className="kpi-value">{openOrders.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><Briefcase size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Active Customers</span>
                            <h3 className="kpi-value">{activeCustomers}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Revenue</span>
                            <h3 className="kpi-value">${Number(totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                        </div>
                    </div>
                </div>

                {/* --- Grid Row 1 (3 Columns) --- */}
                <div className="charts-grid-3">
                    
                    {/* Material Overview Donut Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Layers size={18} /> Material Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '260px', display: 'flex', flexDirection: 'column' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={materialOverviewData}
                                        cx="50%" cy="50%"
                                        innerRadius={50} outerRadius={80}
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
                            <div className="chart-legend" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                {materialOverviewData.map(item => (
                                    <div key={item.name} className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                        <span className="text" style={{ fontSize: '11px', color: '#64748b' }}>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stock Status Bar Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><BarChart2 size={18} /> Stock Status</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '260px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stockStatusData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={30}>
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
                            <div className="bento-card-title"><Activity size={18} /> Recent Activity</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '260px', overflowY: 'auto', padding: '20px' }}>
                            <div className="timeline">
                                {recentActivities.map((activity, i) => (
                                    <div className="timeline-item" key={activity.id || i}>
                                        <div className="timeline-dot" style={{ borderColor: '#3b82f6' }}></div>
                                        <div className="timeline-content">
                                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#334155' }}>{activity.text}</p>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{activity.time ? new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- Grid Row 2 (3 Columns) --- */}
                <div className="charts-grid-3">
                    
                    {/* HR Overview Summary */}
                    <div className="bento-card hr-summary-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><UserCheck size={18} /> HR Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                    <h4 className="stat-value text-primary">2</h4>
                                </div>
                                <div>
                                    <span className="stat-label">Open Roles</span>
                                    <h4 className="stat-value">5</h4>
                                </div>
                            </div>
                            <button className="action-btn-outline" style={{width: '100%', marginTop: 'auto', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent', color: '#3b82f6', fontWeight: 600, cursor: 'pointer'}}>View HRMS</button>
                        </div>
                    </div>

                    {/* Sales Pipeline Funnel Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><TrendingUp size={18} /> Sales Pipeline</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '260px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={salesPipelineData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                                        {salesPipelineData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue Overview Line Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={18} /> Revenue Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '260px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

            </div>

            {/* --- Right Panel: Admin Dashboard Features --- */}
            <div className="admin-side-panel">
                <div className="side-panel-header">
                    <h3>ADMIN DASHBOARD FEATURES</h3>
                </div>
                
                <div className="side-panel-content">
                    <div className="features-list">
                        {rightPanelFeatures.map((feature, idx) => (
                            <div className="feature-item" key={idx}>
                                <div className="feature-icon">{feature.icon}</div>
                                <span className="feature-text">{feature.title}</span>
                                <ChevronDown size={14} className="feature-chevron" style={{ transform: 'rotate(-90deg)' }}/>
                            </div>
                        ))}
                    </div>

                    {/* Bottom illustration or extra block if needed to match height */}
                    <div style={{ marginTop: 'auto', background: '#eff6ff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ background: '#3b82f6', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <Shield size={20} />
                        </div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1e40af' }}>System Status</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#60a5fa' }}>All systems operational and securely encrypted.</p>
                    </div>
                </div>
            </div>

            {/* --- Embedded CSS --- */}
            <style jsx="true">{`
                .admin-dashboard-layout {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .admin-main-content {
                    padding: 30px;
                    height: 100vh;
                    overflow-y: auto;
                }

                /* Top Nav Bar */
                .top-nav-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-bottom: 24px;
                    margin-bottom: 24px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .search-bar {
                    display: flex; align-items: center; gap: 10px;
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
                    padding: 10px 16px; width: 320px;
                }
                .search-bar input { border: none; outline: none; width: 100%; font-size: 14px; color: #0f172a; }
                .search-bar input::placeholder { color: #94a3b8; }
                .nav-actions { display: flex; align-items: center; gap: 20px; }
                .date-filter {
                    display: flex; align-items: center; gap: 8px; cursor: pointer;
                    background: #ffffff; border: 1px solid #e2e8f0; padding: 8px 14px;
                    border-radius: 8px; font-size: 13px; font-weight: 600; color: #334155;
                }
                .icon-btn {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 50%;
                    width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #64748b; position: relative;
                }
                .notification-btn .notif-badge {
                    position: absolute; top: 8px; right: 8px; width: 8px; height: 8px;
                    background: #ef4444; border-radius: 50%; border: 2px solid #fff;
                }
                .profile-dropdown {
                    display: flex; align-items: center; gap: 12px; cursor: pointer;
                }
                .avatar {
                    width: 40px; height: 40px; border-radius: 50%; background: #1e293b;
                    color: white; display: flex; align-items: center; justify-content: center;
                    font-weight: bold; font-size: 16px;
                }
                .profile-info { display: flex; flex-direction: column; }
                .p-name { font-size: 14px; font-weight: 700; color: #0f172a; }
                .p-role { font-size: 12px; color: #64748b; }

                .header-section { margin-bottom: 24px; }
                .page-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
                .page-subtitle { font-size: 15px; color: #64748b; margin: 0; }

                /* KPI Grid (1 Horizontal Row of 6) */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                    border: 1px solid #f1f5f9;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }
                .kpi-icon-wrapper {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-info { flex: 1; }
                .kpi-label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px; }
                .kpi-value { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }

                /* Charts Grid Rows */
                .charts-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .bento-card {
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .bento-card-header { padding: 16px 20px 0; }
                .bento-card-title { font-size: 15px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
                .bento-card-body { padding: 20px; flex: 1; }

                /* Timeline */
                .timeline { position: relative; padding-left: 14px; border-left: 2px solid #e2e8f0; display: flex; flex-direction: column; gap: 16px; }
                .timeline-item { position: relative; }
                .timeline-dot { position: absolute; left: -21px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #ffffff; border: 3px solid #3b82f6; }

                /* HR Overview */
                .hr-stat-row { display: flex; justify-content: space-between; margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
                .stat-label { font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px; }
                .stat-value { font-size: 18px; font-weight: 800; margin: 0; color: #0f172a; }
                .text-success { color: #10b981; }
                .text-warning { color: #f59e0b; }
                .text-primary { color: #3b82f6; }
                .action-btn-outline:hover { background: #eff6ff !important; }

                /* --- Right Panel --- */
                .admin-side-panel {
                    background: #ffffff;
                    border-left: 1px solid #e2e8f0;
                    height: 100vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                .side-panel-header {
                    padding: 24px 24px 20px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .side-panel-header h3 { margin: 0; font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
                
                .side-panel-content { padding: 24px; display: flex; flex-direction: column; flex: 1; }
                .features-list { display: flex; flex-direction: column; gap: 8px; }
                .feature-item {
                    display: flex; align-items: center; padding: 14px 16px;
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
                    cursor: pointer; transition: all 0.2s;
                }
                .feature-item:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateX(2px); }
                .feature-icon { color: #3b82f6; margin-right: 12px; display: flex; align-items: center; }
                .feature-text { font-size: 14px; font-weight: 600; color: #334155; flex: 1; }
                .feature-chevron { color: #94a3b8; }

                @media (max-width: 1400px) {
                    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
                    .charts-grid-3 { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 1024px) {
                    .admin-dashboard-layout { grid-template-columns: 1fr; }
                    .admin-side-panel { display: none; }
                }
                @media (max-width: 768px) {
                    .kpi-grid { grid-template-columns: 1fr 1fr; }
                    .charts-grid-3 { grid-template-columns: 1fr; }
                    .dashboard-main-content { padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
