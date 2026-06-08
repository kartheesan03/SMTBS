import React, { useEffect, useState, useContext, useCallback } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { 
    Users, Package, AlertTriangle, Briefcase, Calendar, DollarSign, 
    ShoppingCart, Bell, Search, ChevronRight, Activity, Globe,
    ArrowUpRight, ArrowDownRight, FolderSync, ShieldAlert,
    Inbox, FileText, CheckCircle2, UserPlus, Clock
} from 'lucide-react';



const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const { unreadCount, notifications } = useContext(NotificationContext);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchVal, setSearchVal] = useState('');

    const getDynamicRange = () => {
        const today = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonthName = monthNames[today.getMonth()];
        const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 21);
        const nextMonthName = monthNames[nextMonthDate.getMonth()];
        const nextMonthYear = nextMonthDate.getFullYear();
        return `${currentMonthName} 21, ${today.getFullYear()} - ${nextMonthName} 21, ${nextMonthYear}`;
    };

    const [dateRange, setDateRange] = useState(getDynamicRange());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchAdminStats = useCallback(async () => {
        try {
            setLoading(true);
            const [dashRes, erpRes] = await Promise.all([
                API.get('/dashboard/stats'),
                API.get('/erp/stats')
            ]);
            setData({ ...dashRes.data, erpStats: erpRes.data });
        } catch (error) {
            console.error("Error fetching dashboard statistics", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminStats();
    }, [fetchAdminStats]);

    if (loading) {
        return (
            <div className="dash-loading-wrapper">
                <div className="dash-spinner"></div>
                <p>Synchronizing Business Intelligence...</p>
            </div>
        );
    }

    // Reference Mockup Data or Live Data
    const materialStats = data?.materialStats || {};
    const totalMaterials = data?.totalMaterials ?? materialStats.totalMaterialTypes ?? 0;
    const totalStockQuantity = data?.totalStockQuantity ?? materialStats.totalStockQuantity ?? 0;
    const lowStock = data?.lowStockItems ?? materialStats.lowStockCount ?? 0;
    const inTransitCount = materialStats.inTransitCount ?? 0;

    const totalEmployees = data?.totalEmployees ?? data?.stats?.totalEmployees ?? 0;
    const openOrders = data?.openOrders ?? data?.erpStats?.openOrders ?? 0;
    const activeCustomers = data?.activeCustomers ?? data?.stats?.totalCustomers ?? 0;
    const totalRevenue = data?.totalRevenue ?? data?.stats?.revenue ?? 0;

    const hrStats = data?.hrStats || {};
    const hrTotalEmployees = hrStats.totalEmployees ?? totalEmployees;
    const hrPresentToday = hrStats.presentToday ?? 0;
    const hrOnLeave = hrStats.onLeave ?? 0;
    const hrNewJoiners = hrStats.newJoiners ?? 0;

    // Donut Chart Data
    const materialOverviewData = [
        { name: 'In Stock', value: totalStockQuantity, percentage: '59.8%', color: '#2563eb' },
        { name: 'In Transit', value: inTransitCount, percentage: '18.3%', color: '#10b981' },
        { name: 'Issued', value: 0, percentage: '14.3%', color: '#f59e0b' },
        { name: 'Returned', value: 0, percentage: '7.5%', color: '#ef4444' },
    ];

    // Bar Chart Data
    const stockStatusData = [
        { name: 'Raw Materials', value: 620, color: '#2563eb' },
        { name: 'Finished Goods', value: 320, color: '#10b981' },
        { name: 'Packaging', value: 180, color: '#f59e0b' },
        { name: 'Others', value: 134, color: '#ef4444' },
    ];

    // Line Chart Data for Revenue Overview
    const getRevenueChartData = () => {
        const values = [1.5, 2.2, 2.9, 3.8, 4.75];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dataList = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (28 - i * 7));
            const dayStr = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
            const label = `${monthNames[d.getMonth()]} ${dayStr}`;
            dataList.push({ name: label, value: values[i] });
        }
        return dataList;
    };
    const revenueOverviewData = getRevenueChartData();

    return (
        <div className="admin-workspace">
            {/* Top Workspace Grid */}
            <div className="workspace-main-content">
                {/* Header */}
                <header className="workspace-header">
                    <div className="header-left">
                        <h1 className="header-title">Dashboard</h1>
                        <p className="header-subtitle">Welcome back, Admin! Here's what's happening today.</p>
                    </div>
                    <div className="header-right">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search (Ctrl + /)" 
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                            />
                        </div>
                        <div className="notification-bell" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }} title="View Notifications">
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
                        </div>
                        <div className="user-profile-menu" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }} title="Account Settings">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=eff6ff&color=2563eb`} alt="Profile" />
                            <span className="profile-name">Admin</span>
                            <span className="dropdown-arrow">▾</span>
                        </div>
                    </div>
                </header>

                {/* Sub-Header Row: Date range picker */}
                <div className="subheader-row" style={{ position: 'relative' }}>
                    <div className="date-picker-box" onClick={() => setShowDatePicker(!showDatePicker)}>
                        <Calendar size={16} />
                        <span>{dateRange}</span>
                        <span className="caret">▾</span>
                    </div>
                    {showDatePicker && (
                        <div className="date-dropdown glass-card" style={{
                            position: 'absolute',
                            top: '40px',
                            right: '0',
                            zIndex: 1000,
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '10px',
                            padding: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                        }}>
                            {['Last 7 Days', 'Last 30 Days', 'This Month', getDynamicRange()].map((d) => (
                                <div
                                    key={d}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: dateRange === d ? '#3b82f6' : '#94a3b8',
                                        background: dateRange === d ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                        transition: '0.2s'
                                    }}
                                    onMouseEnter={(e) => { if (dateRange !== d) e.target.style.color = '#fff'; }}
                                    onMouseLeave={(e) => { if (dateRange !== d) e.target.style.color = '#94a3b8'; }}
                                    onClick={() => {
                                        setDateRange(d);
                                        setShowDatePicker(false);
                                    }}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 6 Metric Stat Cards */}
                <section className="metrics-grid">
                    {/* Stat Card 1 */}
                    <div className="stat-card" onClick={() => navigate('/materials')} style={{ cursor: 'pointer' }} title="Open Material Tracking">
                        <div className="stat-icon-wrapper blue-icon">
                            <Package size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total Material Types</span>
                            <span className="stat-value">{totalMaterials.toLocaleString()}</span>
                            <span className="stat-trend trend-up">
                                <span className="arrow">▲</span> +8.5% from last month
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="stat-card" onClick={() => navigate('/materials')} style={{ cursor: 'pointer' }} title="Open Material Low Stock Logs">
                        <div className="stat-icon-wrapper orange-icon">
                            <AlertTriangle size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Low Stock Items</span>
                            <span className="stat-value">{lowStock}</span>
                            <span className="stat-trend trend-down">
                                <span className="arrow">▼</span> -12.3% from last month
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="stat-card" onClick={() => navigate('/hrms')} style={{ cursor: 'pointer' }} title="Open HRMS Employee Directory">
                        <div className="stat-icon-wrapper green-icon">
                            <Users size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total Employees</span>
                            <span className="stat-value">{totalEmployees}</span>
                            <span className="stat-trend trend-up">
                                <span className="arrow">▲</span> +5.2% from last month
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="stat-card" onClick={() => navigate('/erp')} style={{ cursor: 'pointer' }} title="Open ERP Orders Section">
                        <div className="stat-icon-wrapper purple-icon">
                            <ShoppingCart size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label" title="Includes both Sales & Purchase orders">Open Orders (All)</span>
                            <span className="stat-value">{openOrders}</span>
                            <span className="stat-trend trend-up">
                                <span className="arrow">▲</span> +3.1% from last month
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 5 */}
                    <div className="stat-card" onClick={() => navigate('/customers')} style={{ cursor: 'pointer' }} title="Open CRM Customers Directory">
                        <div className="stat-icon-wrapper teal-icon">
                            <Globe size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Active Customers</span>
                            <span className="stat-value">{activeCustomers}</span>
                            <span className="stat-trend trend-up">
                                <span className="arrow">▲</span> +7.4% from last month
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 6 */}
                    <div className="stat-card" onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }} title="Open Sales & Revenue Analytics">
                        <div className="stat-icon-wrapper yellow-icon">
                            <DollarSign size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total Revenue</span>
                            <span className="stat-value">₹4.75 Cr</span>
                            <span className="stat-trend trend-up">
                                <span className="arrow">▲</span> +11.6% from last month
                            </span>
                        </div>
                    </div>
                </section>

                {/* Grid Section: Row 1 Charts */}
                <section className="charts-row-1">
                    {/* Material Overview (Donut Chart) */}
                    <div className="chart-card card-material-overview">
                        <h3 className="card-title">Material Overview</h3>
                        <div className="donut-chart-container">
                            <div className="donut-wrapper">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie 
                                            data={materialOverviewData} 
                                            innerRadius={65} 
                                            outerRadius={85} 
                                            paddingAngle={3} 
                                            dataKey="value"
                                        >
                                            {materialOverviewData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="donut-center-label">
                                    <span className="donut-count">{totalStockQuantity.toLocaleString()}</span>
                                    <span className="donut-label">Total Stock Quantity</span>
                                </div>
                            </div>
                            <div className="donut-legend">
                                {materialOverviewData.map((item, idx) => (
                                    <div key={idx} className="legend-row">
                                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                        <span className="legend-name">{item.name}</span>
                                        <span className="legend-value">{item.value} ({item.percentage})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stock Status (Bar Chart) */}
                    <div className="chart-card card-stock-status">
                        <h3 className="card-title">Stock Status</h3>
                        <div className="stock-chart-wrapper">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={stockStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} axisLine={false} />
                                    <YAxis fontSize={11} stroke="#64748b" tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {stockStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity List */}
                    <div className="chart-card card-recent-activity">
                        <div className="card-header-flex">
                            <h3 className="card-title">Recent Activity</h3>
                            <span className="view-all-link" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>View All</span>
                        </div>
                        <div className="activity-list">
                            {(notifications || []).length > 0 ? (
                                (notifications || []).slice(0, 5).map((activity) => (
                                    <div key={activity._id || activity.id} className="activity-item">
                                        <div className={`activity-icon ${activity.type === 'success' ? 'green-act' : activity.type === 'warning' ? 'orange-act' : 'blue-act'}`}>
                                            {activity.category === 'hr' ? <UserPlus size={14} /> :
                                             activity.category === 'order' ? <Package size={14} /> :
                                             activity.category === 'stock' ? <AlertTriangle size={14} /> :
                                             <Activity size={14} />}
                                        </div>
                                        <div className="activity-details">
                                            <p className="activity-text">{activity.title || activity.message}</p>
                                            <span className="activity-time">{new Date(activity.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted" style={{ padding: '10px 0' }}>No recent activity.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Grid Section: Row 2 Charts & Overview */}
                <section className="charts-row-2">
                    {/* HR Overview */}
                    <div className="chart-card card-hr-overview">
                        <h3 className="card-title">HR Overview</h3>
                        <div className="hr-overview-stats">
                            <div className="hr-stat-pill bg-blue">
                                <span className="hr-stat-icon">👥</span>
                                <div className="hr-stat-info">
                                    <span className="hr-stat-label">Total Employees</span>
                                    <span className="hr-stat-num">{hrTotalEmployees}</span>
                                </div>
                            </div>
                            <div className="hr-stat-pill bg-green">
                                <span className="hr-stat-icon">✅</span>
                                <div className="hr-stat-info">
                                    <span className="hr-stat-label">Present Today</span>
                                    <span className="hr-stat-num">{hrPresentToday}</span>
                                </div>
                            </div>
                            <div className="hr-stat-pill bg-orange">
                                <span className="hr-stat-icon">🌴</span>
                                <div className="hr-stat-info">
                                    <span className="hr-stat-label">On Leave</span>
                                    <span className="hr-stat-num">{hrOnLeave}</span>
                                </div>
                            </div>
                            <div className="hr-stat-pill bg-purple">
                                <span className="hr-stat-icon">🆕</span>
                                <div className="hr-stat-info">
                                    <span className="hr-stat-label">New Joiners</span>
                                    <span className="hr-stat-num">{hrNewJoiners}</span>
                                </div>
                            </div>
                        </div>
                        <button className="view-details-btn" onClick={() => navigate('/hrms')}>View Details</button>
                    </div>

                    {/* Sales Pipeline Funnel */}
                    <div className="chart-card card-sales-pipeline">
                        <h3 className="card-title">Sales Pipeline</h3>
                        <div className="funnel-container">
                            <div className="funnel-stage stage-leads">
                                <span className="funnel-bg"></span>
                                <span className="stage-name">Leads</span>
                                <span className="stage-value">620</span>
                            </div>
                            <div className="funnel-stage stage-qualified">
                                <span className="funnel-bg"></span>
                                <span className="stage-name">Qualified</span>
                                <span className="stage-value">320</span>
                            </div>
                            <div className="funnel-stage stage-proposal">
                                <span className="funnel-bg"></span>
                                <span className="stage-name">Proposal</span>
                                <span className="stage-value">180</span>
                            </div>
                            <div className="funnel-stage stage-negotiation">
                                <span className="funnel-bg"></span>
                                <span className="stage-name">Negotiation</span>
                                <span className="stage-value">89</span>
                            </div>
                            <div className="funnel-stage stage-won">
                                <span className="funnel-bg"></span>
                                <span className="stage-name">Won</span>
                                <span className="stage-value">45</span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Overview (Line chart) */}
                    <div className="chart-card card-revenue-overview">
                        <div className="card-header-flex">
                            <h3 className="card-title">Revenue Overview</h3>
                            <div className="revenue-dropdown">
                                <span>This Month</span>
                                <span className="caret">▾</span>
                            </div>
                        </div>
                        <div className="revenue-chart-wrapper">
                            <ResponsiveContainer width="100%" height={210}>
                                <LineChart data={revenueOverviewData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} axisLine={false} />
                                    <YAxis fontSize={11} stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                                    <Tooltip formatter={(v) => [`₹${v} Cr`, 'Revenue']} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#ffffff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* Previews Bottom Section Grid */}
                <section className="preview-grid-container">
                    <h3 className="section-title">Module Dashboards Preview</h3>
                    <div className="previews-row">
                        {/* Preview 1: Material Tracking */}
                        <div className="preview-box" onClick={() => navigate('/materials')}>
                            <div className="preview-header">
                                <span className="preview-title">Material Tracking</span>
                                <ChevronRight size={16} />
                            </div>
                            <div className="preview-body">
                                <div className="preview-metrics">
                                    <div className="preview-metric"><span className="p-num">{totalMaterials}</span><span className="p-lbl">Types</span></div>
                                    <div className="preview-metric"><span className="p-num">{totalStockQuantity}</span><span className="p-lbl">Stock</span></div>
                                    <div className="preview-metric"><span className="p-num">{inTransitCount}</span><span className="p-lbl">Transit</span></div>
                                    <div className="preview-metric text-red"><span className="p-num">{lowStock}</span><span className="p-lbl">Low</span></div>
                                </div>
                                <div className="preview-mock-table">
                                    <div className="mock-row header-row">
                                        <span>MRN ID</span><span>Material</span><span>Qty</span><span>Status</span>
                                    </div>
                                    <div className="mock-row">
                                        <span>MRN-1001</span><span>Steel Rod</span><span>1000kg</span><span className="mock-badge green-badge">In Stock</span>
                                    </div>
                                    <div className="mock-row">
                                        <span>MRN-1002</span><span>Cement</span><span>500 bags</span><span className="mock-badge blue-badge">Transit</span>
                                    </div>
                                </div>
                            </div>
                            <div className="preview-label">MATERIAL TRACKING</div>
                        </div>

                        {/* Preview 2: HRMS */}
                        <div className="preview-box" onClick={() => navigate('/hrms')}>
                            <div className="preview-header">
                                <span className="preview-title">HR Dashboard</span>
                                <ChevronRight size={16} />
                            </div>
                            <div className="preview-body">
                                <div className="preview-metrics">
                                    <div className="preview-metric"><span className="p-num">{hrTotalEmployees}</span><span className="p-lbl">Total</span></div>
                                    <div className="preview-metric"><span className="p-num">{hrPresentToday}</span><span className="p-lbl">Present</span></div>
                                    <div className="preview-metric"><span className="p-num">{hrOnLeave}</span><span className="p-lbl">Leave</span></div>
                                    <div className="preview-metric"><span className="p-num">{hrNewJoiners}</span><span className="p-lbl">Joiners</span></div>
                                </div>
                                <div className="preview-mock-charts">
                                    <div className="mock-donut-preview">
                                        <div className="inner-donut"></div>
                                    </div>
                                    <div className="mock-list-preview">
                                        <div className="mock-list-row">👨‍💻 John Doe (Soft. Eng)</div>
                                        <div className="mock-list-row">👩‍💼 Jane Smith (HR Exec)</div>
                                    </div>
                                </div>
                            </div>
                            <div className="preview-label">HRMS OVERVIEW</div>
                        </div>

                        {/* Preview 3: ERP Overview */}
                        <div className="preview-box" onClick={() => navigate('/erp')}>
                            <div className="preview-header">
                                <span className="preview-title">ERP Dashboard</span>
                                <ChevronRight size={16} />
                            </div>
                            <div className="preview-body">
                                <div className="preview-metrics">
                                    <div className="preview-metric"><span className="p-num">{openOrders}</span><span className="p-lbl">Orders</span></div>
                                    <div className="preview-metric"><span className="p-num">{data?.erpStats?.totalPurchaseOrders || 0}</span><span className="p-lbl">Vendors</span></div>
                                    <div className="preview-metric"><span className="p-num">{data?.erpStats?.pendingInvoices || 0}</span><span className="p-lbl">Invoices</span></div>
                                    <div className="preview-metric"><span className="p-num">{data?.erpStats?.totalExpenses || 0}</span><span className="p-lbl">Expenses</span></div>
                                </div>
                                <div className="preview-mock-table">
                                    <div className="mock-row header-row">
                                        <span>PO Num</span><span>Vendor</span><span>Status</span>
                                    </div>
                                    <div className="mock-row">
                                        <span>PO-{new Date().getFullYear()}-126</span><span>ABC Traders</span><span className="mock-badge green-badge">Approved</span>
                                    </div>
                                    <div className="mock-row">
                                        <span>PO-{new Date().getFullYear()}-125</span><span>Global Supplies</span><span className="mock-badge blue-badge">Received</span>
                                    </div>
                                </div>
                            </div>
                            <div className="preview-label">ERP OVERVIEW</div>
                        </div>

                        {/* Preview 4: CRM Overview */}
                        <div className="preview-box" onClick={() => navigate('/crm')}>
                            <div className="preview-header">
                                <span className="preview-title">CRM Dashboard</span>
                                <ChevronRight size={16} />
                            </div>
                            <div className="preview-body">
                                <div className="preview-metrics">
                                    <div className="preview-metric"><span className="p-num">620</span><span className="p-lbl">Leads</span></div>
                                    <div className="preview-metric"><span className="p-num">320</span><span className="p-lbl">Qualified</span></div>
                                    <div className="preview-metric"><span className="p-num">180</span><span className="p-lbl">Deals</span></div>
                                    <div className="preview-metric"><span className="p-num">45</span><span className="p-lbl">Won</span></div>
                                </div>
                                <div className="preview-mock-charts">
                                    <div className="mock-funnel">
                                        <div className="funnel-layer l1"></div>
                                        <div className="funnel-layer l2"></div>
                                        <div className="funnel-layer l3"></div>
                                    </div>
                                    <div className="mock-list-preview">
                                        <div className="mock-list-row">📞 Website Lead (10m ago)</div>
                                        <div className="mock-list-row">🤝 Acme Meeting (1h ago)</div>
                                    </div>
                                </div>
                            </div>
                            <div className="preview-label">CRM OVERVIEW</div>
                        </div>
                    </div>
                </section>
            </div>



            <style jsx="true">{`
                .admin-workspace {
                    display: flex;
                    flex-direction: column;
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    color: var(--text-primary);
                }
                
                .workspace-main-content {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    max-width: 100%;
                    overflow-x: hidden;
                }
                
                /* Header Styling */
                .workspace-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .header-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 6px 0;
                    letter-spacing: -0.3px;
                }
                
                .header-subtitle {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin: 0;
                }
                
                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .search-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .search-icon {
                    position: absolute;
                    left: 14px;
                    color: var(--text-muted);
                }
                
                .search-box input {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    padding: 10px 14px 10px 40px;
                    font-size: 14px;
                    width: 240px;
                    color: var(--text-primary);
                    box-shadow: var(--shadow-xs);
                    transition: all 0.25s ease;
                }
                
                .search-box input:focus {
                    width: 280px;
                    border-color: var(--primary);
                    background: var(--bg-card);
                    box-shadow: var(--shadow-focus);
                }
                
                .notification-bell {
                    position: relative;
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 42px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    transition: all 0.2s;
                    box-shadow: var(--shadow-xs);
                }
                
                .notification-bell:hover {
                    background: var(--bg-hover);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-sm);
                }
                
                .bell-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--danger);
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
                }
                
                .user-profile-menu {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 14px 6px 6px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    cursor: pointer;
                    box-shadow: var(--shadow-xs);
                    transition: all 0.2s ease;
                }
                
                .user-profile-menu:hover {
                    background: var(--bg-hover);
                    box-shadow: var(--shadow-sm);
                }
                
                .user-profile-menu img {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-sm, 8px);
                }
                
                .profile-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .dropdown-arrow {
                    font-size: 12px;
                    color: var(--text-muted);
                }
                
                .subheader-row {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 8px;
                }
                
                .date-picker-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 16px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    cursor: pointer;
                    box-shadow: var(--shadow-xs);
                    transition: all 0.2s;
                }
                
                .date-picker-box:hover {
                    border-color: var(--border-hover);
                    background: var(--bg-hover);
                }
                
                .date-picker-box .caret {
                    font-size: 11px;
                    color: var(--text-muted);
                }
                
                /* Metrics Stat Cards Layout */
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 20px;
                }
                
                .stat-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.25s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--border-hover);
                }
                
                .stat-icon-wrapper {
                    width: 42px;
                    height: 42px;
                    border-radius: var(--radius-md, 12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.25s ease;
                }
                
                .stat-card:hover .stat-icon-wrapper {
                    transform: scale(1.05);
                }
                
                .blue-icon { background-color: var(--primary-50); color: var(--primary); }
                .orange-icon { background-color: var(--warning-light); color: var(--warning); }
                .green-icon { background-color: var(--success-light); color: var(--success); }
                .purple-icon { background-color: #f5f3ff; color: #8b5cf6; }
                .teal-icon { background-color: #f0fdfa; color: #14b8a6; }
                .yellow-icon { background-color: #fefce8; color: #eab308; }
                
                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .stat-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                
                .stat-value {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1.1;
                }
                
                .stat-trend {
                    font-size: 11px;
                    font-weight: 600;
                    margin-top: 6px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .trend-up { color: var(--success); }
                .trend-down { color: var(--danger); }
                .stat-trend .arrow { font-size: 9px; }
                
                /* Chart Rows Layout */
                .charts-row-1 {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 1fr;
                    gap: 20px;
                }
                
                .chart-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                }
                
                .card-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 20px 0;
                }
                
                /* Material Overview (Donut Chart Layout) */
                .donut-chart-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }
                
                .donut-wrapper {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    flex-shrink: 0;
                }
                
                .donut-center-label {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .donut-count {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                }
                
                .donut-label {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 500;
                    margin-top: 4px;
                }
                
                .donut-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    flex: 1;
                }
                
                .legend-row {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                }
                
                .legend-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 10px;
                    flex-shrink: 0;
                }
                
                .legend-name {
                    color: var(--text-secondary);
                    font-weight: 600;
                    flex: 1;
                }
                
                .legend-value {
                    color: var(--text-primary);
                    font-weight: 700;
                    text-align: right;
                }
                
                /* Recent Activity Custom List */
                .card-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .view-all-link {
                    font-size: 12px;
                    color: var(--primary);
                    font-weight: 700;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: background 0.2s;
                }
                .view-all-link:hover {
                    background: var(--primary-light);
                }
                
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                
                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    padding: 8px;
                    border-radius: var(--radius-md, 12px);
                    transition: background 0.2s;
                }
                .activity-item:hover {
                    background: var(--bg-hover);
                }
                
                .activity-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-sm, 8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .blue-act { background-color: var(--primary-50); color: var(--primary); }
                .green-act { background-color: var(--success-light); color: var(--success); }
                .orange-act { background-color: var(--warning-light); color: var(--warning); }
                .purple-act { background-color: #f5f3ff; color: #8b5cf6; }
                .emerald-act { background-color: #ecfdf5; color: #10b981; }
                
                .activity-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .activity-text {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 0;
                    line-height: 1.4;
                }
                
                .activity-text strong {
                    color: var(--text-primary);
                    font-weight: 700;
                }
                
                .activity-time {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                
                /* Chart Row 2 Layout */
                .charts-row-2 {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 1fr;
                    gap: 20px;
                }
                
                /* HR Overview Widget styling */
                .hr-overview-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 20px;
                }
                
                .hr-stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px;
                    border-radius: var(--radius-md, 12px);
                    border: 1px solid var(--border);
                    background: var(--bg-card);
                }
                
                .bg-blue { background-color: var(--primary-50); }
                .bg-green { background-color: var(--success-light); }
                .bg-orange { background-color: var(--warning-light); }
                .bg-purple { background-color: #f5f3ff; }
                
                .hr-stat-icon {
                    font-size: 20px;
                }
                
                .hr-stat-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .hr-stat-label {
                    font-size: 11px;
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                
                .hr-stat-num {
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-top: 2px;
                }
                
                .view-details-btn {
                    width: 100%;
                    background: var(--bg-hover);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    font-weight: 700;
                    font-size: 13px;
                    padding: 12px;
                    border-radius: var(--radius-md, 12px);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .view-details-btn:hover {
                    background: var(--border);
                    color: var(--text-primary);
                }
                
                /* Sales Pipeline (Custom Funnel Chart) Styling */
                .funnel-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 12px 0;
                }
                
                .funnel-stage {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 16px;
                    border-radius: var(--radius-sm, 8px);
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 700;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }
                
                .funnel-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.9;
                    z-index: 1;
                }
                
                .stage-name, .stage-value {
                    position: relative;
                    z-index: 2;
                }
                
                .stage-leads { width: 100%; }
                .stage-leads .funnel-bg { background-color: var(--primary); }
                
                .stage-qualified { width: 90%; }
                .stage-qualified .funnel-bg { background-color: #3b82f6; }
                
                .stage-proposal { width: 80%; }
                .stage-proposal .funnel-bg { background-color: #eab308; } 
                
                .stage-negotiation { width: 70%; }
                .stage-negotiation .funnel-bg { background-color: #f97316; } 
                
                .stage-won { width: 60%; }
                .stage-won .funnel-bg { background-color: var(--success); } 
                
                /* Revenue Overview Card styling */
                .revenue-dropdown {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    cursor: pointer;
                    background: var(--bg-hover);
                    border: 1px solid var(--border);
                    padding: 6px 10px;
                    border-radius: var(--radius-sm, 8px);
                    transition: all 0.2s;
                }
                
                .revenue-dropdown:hover {
                    background: var(--border);
                }
                
                .revenue-chart-wrapper {
                    margin-top: 16px;
                }
                
                /* Bottom Previews Grid Container */
                .preview-grid-container {
                    margin-top: 16px;
                }
                
                .section-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 20px 0;
                }
                
                .previews-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .preview-box {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 20px;
                    cursor: pointer;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.25s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    height: 240px;
                    position: relative;
                    overflow: hidden;
                }
                
                .preview-box:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--primary-100);
                }
                
                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--text-primary);
                }
                
                .preview-title {
                    font-size: 14px;
                    font-weight: 700;
                }
                
                .preview-body {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    flex: 1;
                    overflow: hidden;
                }
                
                .preview-metrics {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 6px;
                    background: var(--bg-body);
                    padding: 10px;
                    border-radius: var(--radius-md, 12px);
                }
                
                .preview-metric {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .p-num {
                    font-size: 12px;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                
                .p-lbl {
                    font-size: 9px;
                    color: var(--text-muted);
                    font-weight: 600;
                    margin-top: 2px;
                    text-transform: uppercase;
                }
                
                .text-red .p-num {
                    color: var(--danger);
                }
                
                /* Preview Mock Visual elements */
                .preview-mock-table {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    font-size: 9px;
                }
                
                .mock-row {
                    display: grid;
                    grid-template-columns: 1.5fr 1.5fr 1fr 1fr;
                    gap: 6px;
                    padding: 6px 0;
                    border-bottom: 1px solid var(--border);
                    color: var(--text-secondary);
                }
                
                .mock-row.header-row {
                    font-weight: 700;
                    color: var(--text-muted);
                    border-bottom-width: 2px;
                    text-transform: uppercase;
                }
                
                .mock-badge {
                    font-size: 8px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                    width: fit-content;
                }
                
                .green-badge { background-color: var(--success-light); color: var(--success); }
                .blue-badge { background-color: var(--primary-50); color: var(--primary); }
                
                .preview-mock-charts {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    height: 100%;
                }
                
                .mock-donut-preview {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 6px solid var(--primary);
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .inner-donut {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--bg-card);
                }
                
                .mock-list-preview {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    font-size: 10px;
                    color: var(--text-muted);
                }
                
                .mock-list-row {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .mock-funnel {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    width: 48px;
                    align-items: center;
                }
                
                .funnel-layer {
                    height: 8px;
                    border-radius: 2px;
                }
                
                .funnel-layer.l1 { width: 38px; background-color: var(--primary); }
                .funnel-layer.l2 { width: 28px; background-color: #eab308; }
                .funnel-layer.l3 { width: 18px; background-color: var(--success); }
                
                .preview-label {
                    background: var(--primary);
                    color: #ffffff;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    padding: 6px 12px;
                    border-radius: 0 0 16px 16px;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    text-align: center;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.25s ease;
                }
                
                .preview-box:hover .preview-label {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .dash-loading-wrapper {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    color: var(--text-muted);
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .dash-spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid var(--primary-100);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 1200px) {
                    .metrics-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    .charts-row-1, .charts-row-2 {
                        grid-template-columns: 1fr;
                    }
                    .previews-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .workspace-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    .header-right {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .search-box {
                        flex: 1;
                    }
                    .search-box input {
                        width: 100%;
                    }
                    .search-box input:focus {
                        width: 100%;
                    }
                    .metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .previews-row {
                        grid-template-columns: 1fr;
                    }
                }
                
                @media (max-width: 480px) {
                    .metrics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
