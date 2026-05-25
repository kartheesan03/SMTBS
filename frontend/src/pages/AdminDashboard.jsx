import React, { useEffect, useState, useContext, useCallback } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
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

import DashboardFeatures from '../components/Dashboard/DashboardFeatures';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchVal, setSearchVal] = useState('');

    const fetchAdminStats = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/dashboard/stats');
            setData(data);
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
    const totalMaterials = data?.stats?.totalMaterials ?? 1254;
    const lowStock = data?.stats?.lowStockCount ?? 23;
    const totalEmployees = data?.stats?.totalEmployees ?? 356;
    const openOrders = data?.stats?.pendingOrders ?? 89;
    const activeCustomers = data?.stats?.totalCustomers ?? 682;
    const totalRevenue = data?.stats?.revenue ?? 47500000; // ₹4.75 Cr

    // Donut Chart Data
    const materialOverviewData = [
        { name: 'In Stock', value: 750, percentage: '59.8%', color: '#2563eb' },
        { name: 'In Transit', value: 230, percentage: '18.3%', color: '#10b981' },
        { name: 'Issued', value: 180, percentage: '14.3%', color: '#f59e0b' },
        { name: 'Returned', value: 94, percentage: '7.5%', color: '#ef4444' },
    ];

    // Bar Chart Data
    const stockStatusData = [
        { name: 'Raw Materials', value: 620, color: '#2563eb' },
        { name: 'Finished Goods', value: 320, color: '#10b981' },
        { name: 'Packaging', value: 180, color: '#f59e0b' },
        { name: 'Others', value: 134, color: '#ef4444' },
    ];

    // Line Chart Data for Revenue Overview
    const revenueOverviewData = [
        { name: 'May 21', value: 1.5 },
        { name: 'May 28', value: 2.2 },
        { name: 'Jun 04', value: 2.9 },
        { name: 'Jun 11', value: 3.8 },
        { name: 'Jun 18', value: 4.75 },
    ];

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
                        <div className="notification-bell">
                            <Bell size={20} />
                            <span className="bell-badge">5</span>
                        </div>
                        <div className="user-profile-menu">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=eff6ff&color=2563eb`} alt="Profile" />
                            <span className="profile-name">Admin</span>
                            <span className="dropdown-arrow">▾</span>
                        </div>
                    </div>
                </header>

                {/* Sub-Header Row: Date range picker */}
                <div className="subheader-row">
                    <div className="date-picker-box">
                        <Calendar size={16} />
                        <span>May 21, 2024 - Jun 21, 2024</span>
                        <span className="caret">▾</span>
                    </div>
                </div>

                {/* 6 Metric Stat Cards */}
                <section className="metrics-grid">
                    {/* Stat Card 1 */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper blue-icon">
                            <Package size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Total Materials</span>
                            <span className="stat-value">{totalMaterials.toLocaleString()}</span>
                            <span className="stat-trend trend-up">
                                <span className="arrow">▲</span> +8.5% from last month
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper orange-icon">
                            <AlertTriangle size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Low Stock items</span>
                            <span className="stat-value">{lowStock}</span>
                            <span className="stat-trend trend-down">
                                <span className="arrow">▼</span> -12.3% from last month
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="stat-card">
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
                    <div className="stat-card">
                        <div className="stat-icon-wrapper purple-icon">
                            <ShoppingCart size={22} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Open Orders</span>
                            <span className="stat-value">{openOrders}</span>
                            <span className="stat-trend trend-up">
                                <span className="arrow">▲</span> +3.1% from last month
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 5 */}
                    <div className="stat-card">
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
                    <div className="stat-card">
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
                                    <span className="donut-count">{totalMaterials.toLocaleString()}</span>
                                    <span className="donut-label">Total</span>
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
                            <span className="view-all-link">View All</span>
                        </div>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon blue-act">
                                    <Package size={14} />
                                </div>
                                <div className="activity-details">
                                    <p className="activity-text">Material <strong>MRN-1001</strong> received</p>
                                    <span className="activity-time">10 mins ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon green-act">
                                    <CheckCircle2 size={14} />
                                </div>
                                <div className="activity-details">
                                    <p className="activity-text">Employee <strong>John Doe</strong> check-in</p>
                                    <span className="activity-time">25 mins ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon orange-act">
                                    <FileText size={14} />
                                </div>
                                <div className="activity-details">
                                    <p className="activity-text">PO <strong>#PO-2024-125</strong> created</p>
                                    <span className="activity-time">1 hour ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon purple-act">
                                    <UserPlus size={14} />
                                </div>
                                <div className="activity-details">
                                    <p className="activity-text">New customer <strong>Acme Corp</strong> added</p>
                                    <span className="activity-time">2 hours ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon emerald-act">
                                    <DollarSign size={14} />
                                </div>
                                <div className="activity-details">
                                    <p className="activity-text">Invoice <strong>INV-2024-542</strong> paid</p>
                                    <span className="activity-time">3 hours ago</span>
                                </div>
                            </div>
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
                                    <span className="hr-stat-num">356</span>
                                </div>
                            </div>
                            <div className="hr-stat-pill bg-green">
                                <span className="hr-stat-icon">✅</span>
                                <div className="hr-stat-info">
                                    <span className="hr-stat-label">Present Today</span>
                                    <span className="hr-stat-num">289</span>
                                </div>
                            </div>
                            <div className="hr-stat-pill bg-orange">
                                <span className="hr-stat-icon">🌴</span>
                                <div className="hr-stat-info">
                                    <span className="hr-stat-label">On Leave</span>
                                    <span className="hr-stat-num">34</span>
                                </div>
                            </div>
                            <div className="hr-stat-pill bg-purple">
                                <span className="hr-stat-icon">🆕</span>
                                <div className="hr-stat-info">
                                    <span className="hr-stat-label">New Joiners</span>
                                    <span className="hr-stat-num">12</span>
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
                                    <div className="preview-metric"><span className="p-num">1,254</span><span className="p-lbl">Total</span></div>
                                    <div className="preview-metric"><span className="p-num">750</span><span className="p-lbl">Stock</span></div>
                                    <div className="preview-metric"><span className="p-num">230</span><span className="p-lbl">Transit</span></div>
                                    <div className="preview-metric text-red"><span className="p-num">23</span><span className="p-lbl">Low</span></div>
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
                                    <div className="preview-metric"><span className="p-num">356</span><span className="p-lbl">Total</span></div>
                                    <div className="preview-metric"><span className="p-num">289</span><span className="p-lbl">Present</span></div>
                                    <div className="preview-metric"><span className="p-num">34</span><span className="p-lbl">Leave</span></div>
                                    <div className="preview-metric"><span className="p-num">12</span><span className="p-lbl">Joiners</span></div>
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
                                    <div className="preview-metric"><span className="p-num">89</span><span className="p-lbl">Orders</span></div>
                                    <div className="preview-metric"><span className="p-num">45</span><span className="p-lbl">Vendors</span></div>
                                    <div className="preview-metric"><span className="p-num">18</span><span className="p-lbl">Invoices</span></div>
                                    <div className="preview-metric"><span className="p-num">₹1.25 Cr</span><span className="p-lbl">Expenses</span></div>
                                </div>
                                <div className="preview-mock-table">
                                    <div className="mock-row header-row">
                                        <span>PO Num</span><span>Vendor</span><span>Status</span>
                                    </div>
                                    <div className="mock-row">
                                        <span>PO-2024-126</span><span>ABC Traders</span><span className="mock-badge green-badge">Approved</span>
                                    </div>
                                    <div className="mock-row">
                                        <span>PO-2024-125</span><span>Global Supplies</span><span className="mock-badge blue-badge">Received</span>
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

            {/* Sidebar Features Column (Right side) */}
            <aside className="workspace-features-sidebar">
                <DashboardFeatures />
            </aside>

            <style jsx="true">{`
                .admin-workspace {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    background-color: var(--dash-bg);
                    min-height: 100vh;
                    color: var(--dash-text-main);
                }
                
                .workspace-main-content {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-width: 100%;
                    overflow-x: hidden;
                }
                
                .workspace-features-sidebar {
                    padding: 24px;
                    background-color: var(--dash-bg);
                    border-left: 1px solid var(--dash-border);
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    overflow-y: auto;
                }
                
                /* Header Styling */
                .workspace-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 5px;
                }
                
                .header-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }
                
                .header-subtitle {
                    font-size: 13px;
                    color: var(--dash-text-muted);
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
                    left: 12px;
                    color: #94a3b8;
                }
                
                .search-box input {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 9px 12px 9px 36px;
                    font-size: 13px;
                    width: 210px;
                    color: #1e293b;
                    box-shadow: none;
                    transition: width 0.2s ease;
                }
                
                .search-box input:focus {
                    width: 250px;
                    border-color: #3b82f6;
                    background: #ffffff;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .notification-bell {
                    position: relative;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 38px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    transition: background 0.2s;
                }
                
                .notification-bell:hover {
                    background: #f8fafc;
                }
                
                .bell-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ef4444;
                    color: #ffffff;
                    font-size: 10px;
                    font-weight: 700;
                    width: 17px;
                    height: 17px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .user-profile-menu {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 12px 4px 4px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    cursor: pointer;
                }
                
                .user-profile-menu img {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                }
                
                .profile-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #1e293b;
                }
                
                .dropdown-arrow {
                    font-size: 11px;
                    color: #64748b;
                }
                
                .subheader-row {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 4px;
                }
                
                .date-picker-box {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                }
                
                .date-picker-box .caret {
                    font-size: 10px;
                    color: #94a3b8;
                }
                
                /* Metrics Stat Cards Layout */
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                }
                
                .stat-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: var(--dash-shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--dash-shadow);
                }
                
                .stat-icon-wrapper {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .blue-icon { background-color: #eff6ff; color: #2563eb; }
                .orange-icon { background-color: #fffbeb; color: #f59e0b; }
                .green-icon { background-color: #f0fdf4; color: #16a34a; }
                .purple-icon { background-color: #f5f3ff; color: #7c3aed; }
                .teal-icon { background-color: #f0fdfa; color: #0d9488; }
                .yellow-icon { background-color: #fffbeb; color: #d97706; }
                
                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .stat-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--dash-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                
                .stat-value {
                    font-size: 22px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.1;
                }
                
                .stat-trend {
                    font-size: 10px;
                    font-weight: 700;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }
                
                .trend-up { color: #10b981; }
                .trend-down { color: #ef4444; }
                .stat-trend .arrow { font-size: 8px; }
                
                /* Chart Rows Layout */
                .charts-row-1 {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 1fr;
                    gap: 20px;
                }
                
                .chart-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .card-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 16px 0;
                }
                
                /* Material Overview (Donut Chart Layout) */
                .donut-chart-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
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
                    font-size: 22px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                }
                
                .donut-label {
                    font-size: 11px;
                    color: var(--dash-text-muted);
                    font-weight: 500;
                    margin-top: 2px;
                }
                
                .donut-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex: 1;
                }
                
                .legend-row {
                    display: flex;
                    align-items: center;
                    font-size: 11px;
                }
                
                .legend-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    margin-right: 8px;
                    flex-shrink: 0;
                }
                
                .legend-name {
                    color: #475569;
                    font-weight: 600;
                    flex: 1;
                }
                
                .legend-value {
                    color: #0f172a;
                    font-weight: 700;
                    text-align: right;
                }
                
                /* Recent Activity Custom List */
                .card-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                
                .view-all-link {
                    font-size: 11px;
                    color: #2563eb;
                    font-weight: 700;
                    cursor: pointer;
                }
                
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .activity-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .blue-act { background-color: #eff6ff; color: #2563eb; }
                .green-act { background-color: #f0fdf4; color: #16a34a; }
                .orange-act { background-color: #fffbeb; color: #f59e0b; }
                .purple-act { background-color: #f5f3ff; color: #7c3aed; }
                .emerald-act { background-color: #ecfdf5; color: #10b981; }
                
                .activity-details {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .activity-text {
                    font-size: 12px;
                    color: #334155;
                    margin: 0;
                    line-height: 1.4;
                }
                
                .activity-text strong {
                    color: #0f172a;
                    font-weight: 700;
                }
                
                .activity-time {
                    font-size: 10px;
                    color: #94a3b8;
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
                    gap: 12px;
                    margin-bottom: 16px;
                }
                
                .hr-stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 10px;
                    border: 1px solid #f1f5f9;
                }
                
                .bg-blue { background-color: #eff6ff; }
                .bg-green { background-color: #f0fdf4; }
                .bg-orange { background-color: #fffbeb; }
                .bg-purple { background-color: #f5f3ff; }
                
                .hr-stat-icon {
                    font-size: 18px;
                }
                
                .hr-stat-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .hr-stat-label {
                    font-size: 10px;
                    color: #64748b;
                    font-weight: 600;
                }
                
                .hr-stat-num {
                    font-size: 15px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 1px;
                }
                
                .view-details-btn {
                    width: 100%;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    font-weight: 700;
                    font-size: 12px;
                    padding: 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .view-details-btn:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                
                /* Sales Pipeline (Custom Funnel Chart) Styling */
                .funnel-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 10px 0;
                }
                
                .funnel-stage {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 11px;
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
                .stage-leads .funnel-bg { background-color: #0284c7; } /* Ocean Blue */
                
                .stage-qualified { width: 90%; }
                .stage-qualified .funnel-bg { background-color: #0ea5e9; } /* Cyan Blue */
                
                .stage-proposal { width: 80%; }
                .stage-proposal .funnel-bg { background-color: #eab308; } /* Yellow */
                
                .stage-negotiation { width: 70%; }
                .stage-negotiation .funnel-bg { background-color: #f97316; } /* Orange */
                
                .stage-won { width: 60%; }
                .stage-won .funnel-bg { background-color: #10b981; } /* Emerald */
                
                /* Revenue Overview Card styling */
                .revenue-dropdown {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748b;
                    cursor: pointer;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 4px 8px;
                    border-radius: 6px;
                }
                
                .revenue-chart-wrapper {
                    margin-top: 10px;
                }
                
                /* Bottom Previews Grid Container */
                .preview-grid-container {
                    margin-top: 10px;
                }
                
                .section-title {
                    font-size: 15px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 16px 0;
                }
                
                .previews-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .preview-box {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 16px;
                    cursor: pointer;
                    box-shadow: var(--dash-shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    height: 220px;
                    position: relative;
                }
                
                .preview-box:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--dash-shadow-lg);
                    border-color: #cbd5e1;
                }
                
                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #1e293b;
                }
                
                .preview-title {
                    font-size: 13px;
                    font-weight: 700;
                }
                
                .preview-body {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    flex: 1;
                    overflow: hidden;
                }
                
                .preview-metrics {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 4px;
                    background: #f8fafc;
                    padding: 8px;
                    border-radius: 8px;
                }
                
                .preview-metric {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .p-num {
                    font-size: 11px;
                    font-weight: 800;
                    color: #0f172a;
                }
                
                .p-lbl {
                    font-size: 8px;
                    color: #64748b;
                    font-weight: 600;
                    margin-top: 1px;
                }
                
                .text-red .p-num {
                    color: #ef4444;
                }
                
                /* Preview Mock Visual elements */
                .preview-mock-table {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-size: 8px;
                }
                
                .mock-row {
                    display: grid;
                    grid-template-columns: 1.5fr 1.5fr 1fr 1fr;
                    gap: 4px;
                    padding: 4px 0;
                    border-bottom: 1px solid #f1f5f9;
                    color: #475569;
                }
                
                .mock-row.header-row {
                    font-weight: 700;
                    color: #94a3b8;
                    border-bottom-width: 2px;
                }
                
                .mock-badge {
                    font-size: 7px;
                    font-weight: 700;
                    padding: 1px 4px;
                    border-radius: 4px;
                    width: fit-content;
                }
                
                .green-badge { background-color: #ecfdf5; color: #10b981; }
                .blue-badge { background-color: #eff6ff; color: #2563eb; }
                
                .preview-mock-charts {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 100%;
                }
                
                .mock-donut-preview {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 6px solid #2563eb;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .inner-donut {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #ffffff;
                }
                
                .mock-list-preview {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-size: 8px;
                    color: #64748b;
                }
                
                .mock-list-row {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .mock-funnel {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    width: 44px;
                    align-items: center;
                }
                
                .funnel-layer {
                    height: 8px;
                    border-radius: 2px;
                }
                
                .funnel-layer.l1 { width: 34px; background-color: #2563eb; }
                .funnel-layer.l2 { width: 24px; background-color: #eab308; }
                .funnel-layer.l3 { width: 14px; background-color: #10b981; }
                
                .preview-label {
                    background: #2563eb;
                    color: #ffffff;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    padding: 4px 10px;
                    border-radius: 0 0 16px 16px;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    text-align: center;
                    display: none;
                }
                
                .preview-box:hover .preview-label {
                    display: block;
                }
                
                .dash-loading-wrapper {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                }
                
                .dash-spinner {
                    width: 44px;
                    height: 44px;
                    border: 3px solid rgba(37, 99, 235, 0.1);
                    border-top: 3px solid #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 1400px) {
                    .admin-workspace {
                        grid-template-columns: 1fr;
                    }
                    .workspace-features-sidebar {
                        height: auto;
                        border-left: none;
                        border-top: 1px solid var(--dash-border);
                        position: relative;
                    }
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
