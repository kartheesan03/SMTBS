import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Box, ShoppingCart, DollarSign, 
    TrendingUp, Activity, Calendar, Clock, AlertCircle,
    FileText, UserCheck, Inbox, CheckSquare, Bell,
    Briefcase, ArrowUpRight, ArrowDownRight, Layers, BarChart2, Zap, Search, ChevronDown
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
            { name: 'Jan', revenue: 4000, expenses: 2400 },
            { name: 'Feb', revenue: 3000, expenses: 1398 },
            { name: 'Mar', revenue: 2000, expenses: 9800 },
            { name: 'Apr', revenue: 2780, expenses: 3908 },
            { name: 'May', revenue: 1890, expenses: 4800 },
            { name: 'Jun', revenue: 2390, expenses: 3800 },
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

                {/* --- Top KPI Cards --- */}
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

                {/* --- Charts Grid --- */}
                <div className="charts-grid">
                    
                    {/* Revenue Overview Line Chart */}
                    <div className="bento-card span-8">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={18} /> Revenue Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Material Overview Donut Chart */}
                    <div className="bento-card span-4">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Layers size={18} /> Material Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={materialOverviewData}
                                        cx="50%" cy="50%"
                                        innerRadius={65} outerRadius={95}
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
                            <div className="chart-legend">
                                {materialOverviewData.map(item => (
                                    <div key={item.name} className="legend-item">
                                        <span className="dot" style={{ background: item.color }}></span>
                                        <span className="text">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stock Status Bar Chart */}
                    <div className="bento-card span-4">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><BarChart2 size={18} /> Stock Status</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stockStatusData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                        {stockStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sales Pipeline Funnel (Bar) */}
                    <div className="bento-card span-4">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><TrendingUp size={18} /> Sales Pipeline</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={salesPipelineData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                                        {salesPipelineData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* HR Overview Summary */}
                    <div className="bento-card span-4 hr-summary-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><UserCheck size={18} /> HR Overview</div>
                        </div>
                        <div className="bento-card-body">
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
                            <button className="action-btn-outline" style={{width: '100%', marginTop: '16px'}}>View HRMS Dashboard</button>
                        </div>
                    </div>

                </div>

                {/* --- Bottom Preview Cards --- */}
                <h3 className="section-title">Module Previews</h3>
                <div className="preview-cards-grid">
                    <div className="preview-card">
                        <div className="preview-icon"><Box size={24} /></div>
                        <h4>Material Tracking</h4>
                        <p>Manage raw materials, stock thresholds, and suppliers.</p>
                    </div>
                    <div className="preview-card">
                        <div className="preview-icon"><Users size={24} /></div>
                        <h4>HRMS Overview</h4>
                        <p>Track attendance, manage payroll, and employee leaves.</p>
                    </div>
                    <div className="preview-card">
                        <div className="preview-icon"><ShoppingCart size={24} /></div>
                        <h4>ERP Operations</h4>
                        <p>Process sales and purchase orders, generate invoices.</p>
                    </div>
                    <div className="preview-card">
                        <div className="preview-icon"><Briefcase size={24} /></div>
                        <h4>CRM Overview</h4>
                        <p>Manage customer relationships, leads, and contacts.</p>
                    </div>
                </div>

            </div>

            {/* --- Right Panel: Admin Dashboard Features --- */}
            <div className="admin-side-panel">
                <div className="side-panel-header">
                    <h3>Admin Features</h3>
                    <span className="badge">Pro</span>
                </div>
                
                <div className="side-panel-content">
                    
                    {/* Quick Actions */}
                    <div className="feature-block">
                        <h4 className="block-title">Quick Actions</h4>
                        <div className="action-list">
                            <button className="action-item"><Users size={16} /> Add Employee</button>
                            <button className="action-item"><Box size={16} /> Add Material</button>
                            <button className="action-item"><ShoppingCart size={16} /> Create Order</button>
                            <button className="action-item"><FileText size={16} /> Generate Report</button>
                        </div>
                    </div>

                    {/* Recent Activity Timeline */}
                    <div className="feature-block">
                        <h4 className="block-title">Recent Activity</h4>
                        <div className="timeline">
                            {recentActivities.map((activity, i) => (
                                <div className="timeline-item" key={activity.id || i}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <p>{activity.text}</p>
                                        <span>{activity.time ? new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="feature-block">
                        <h4 className="block-title">System Health</h4>
                        <div className="health-card">
                            <div className="health-row">
                                <span>API Status</span>
                                <span className="status-badge green">Operational</span>
                            </div>
                            <div className="health-row">
                                <span>Database</span>
                                <span className="status-badge green">Connected</span>
                            </div>
                            <div className="health-row">
                                <span>Last Backup</span>
                                <span className="status-text">2 hours ago</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Embedded CSS --- */}
            <style jsx="true">{`
                .admin-dashboard-layout {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .admin-main-content {
                    padding: 30px;
                    height: 100vh;
                    overflow-y: auto;
                }

                .header-section {
                    margin-bottom: 24px;
                }
                .page-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }
                .page-subtitle {
                    font-size: 15px;
                    color: #64748b;
                    margin: 0;
                }

                /* KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid #f1f5f9;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
                }
                .kpi-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-info {
                    flex: 1;
                }
                .kpi-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 4px;
                }
                .kpi-value {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                /* Charts Grid */
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .bento-card {
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .span-8 { grid-column: span 8; }
                .span-4 { grid-column: span 4; }
                
                .bento-card-header {
                    padding: 20px 24px 0;
                }
                .bento-card-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .bento-card-body {
                    padding: 24px;
                    flex: 1;
                }

                .chart-legend {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-top: 16px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .legend-item .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .legend-item .text {
                    font-size: 13px;
                    color: #475569;
                    font-weight: 500;
                }

                .hr-summary-card .bento-card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .hr-stat-row {
                    display: flex;
                    justify-content: space-between;
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                }
                .stat-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                }
                .stat-value {
                    font-size: 20px;
                    font-weight: 800;
                    margin: 4px 0 0 0;
                    color: #0f172a;
                }
                .text-success { color: #10b981; }
                .text-warning { color: #f59e0b; }
                .text-primary { color: #3b82f6; }

                .action-btn-outline {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #0f172a;
                    padding: 12px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn-outline:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                /* Bottom Preview Cards */
                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 16px 0;
                }
                .preview-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .preview-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid #f1f5f9;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .preview-card:hover {
                    border-color: #cbd5e1;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }
                .preview-icon {
                    width: 48px;
                    height: 48px;
                    background: #f8fafc;
                    color: #3b82f6;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                }
                .preview-card h4 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .preview-card p {
                    margin: 0;
                    font-size: 13px;
                    color: #64748b;
                    line-height: 1.5;
                }

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
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .side-panel-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .badge {
                    background: #3b82f6;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 12px;
                }

                .side-panel-content {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .block-title {
                    margin: 0 0 16px 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .action-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .action-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    color: #334155;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                .action-item:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .action-item svg {
                    color: #64748b;
                }

                .timeline {
                    position: relative;
                    padding-left: 14px;
                    border-left: 2px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .timeline-item {
                    position: relative;
                }
                .timeline-dot {
                    position: absolute;
                    left: -21px;
                    top: 2px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 3px solid #3b82f6;
                }
                .timeline-content p {
                    margin: 0 0 4px 0;
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                    line-height: 1.4;
                }
                .timeline-content span {
                    font-size: 12px;
                    color: #94a3b8;
                }

                .health-card {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .health-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 700;
                }
                .status-badge.green {
                    background: #dcfce7;
                    color: #16a34a;
                }
                .status-text {
                    font-size: 12px;
                    color: #64748b;
                    font-weight: 500;
                }

                @media (max-width: 1400px) {
                    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                    .charts-grid { display: flex; flex-direction: column; }
                    .preview-cards-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 1024px) {
                    .admin-dashboard-layout {
                        grid-template-columns: 1fr;
                    }
                    .admin-side-panel {
                        display: none;
                    }
                }
                @media (max-width: 768px) {
                    .kpi-grid { grid-template-columns: 1fr; }
                    .preview-cards-grid { grid-template-columns: 1fr; }
                    .admin-main-content { padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
