import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Download, FileText, BarChart2, PieChart as PieChartIcon,
    Calendar, Filter, TrendingUp, Package, Users, ShoppingCart,
    RefreshCw, CheckCircle, X, ChevronDown, AlertTriangle
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChart, setActiveChart] = useState('revenue');
    const [dateRange, setDateRange] = useState('30');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCustomReport, setShowCustomReport] = useState(false);
    const [customReport, setCustomReport] = useState({ type: '', format: 'PDF', from: '', to: '' });
    const [downloading, setDownloading] = useState(null);
    const [toast, setToast] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');

    const getFormattedDateRange = () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - Number(dateRange));
        
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const startStr = startDate.toLocaleDateString('en-US', options);
        const endStr = endDate.toLocaleDateString('en-US', options);
        
        return `${startStr} - ${endStr}`;
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await API.get('/dashboard/stats');
            setStats(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
            showToast(err.response?.data?.message || err.message || 'Error loading dashboard statistics', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (reportName, format) => {
        setDownloading(reportName);
        try {
            const doc = new jsPDF();
            const now = new Date().toISOString().split('T')[0];

            doc.setFontSize(18);
            doc.text(`SMTBMS - ${reportName}`, 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

            if (reportName === 'Monthly Revenue Report') {
                const rows = (stats?.charts?.monthlyStats || []).map(m => [m.name, m.revenue || 0, m.sales || 0]);
                autoTable(doc, {
                    startY: 40,
                    head: [['Month', 'Revenue (₹)', 'Orders']],
                    body: rows,
                });
            } else if (reportName === 'Inventory Usage Summary') {
                const rows = (stats?.tables?.lowStock || []).map(m => [m.name, m.sku, m.quantity, m.unit, m.status || 'Low Stock']);
                autoTable(doc, {
                    startY: 40,
                    head: [['Material Name', 'SKU', 'Quantity', 'Unit', 'Status']],
                    body: rows,
                });
            } else if (reportName === 'Employee Performance Metrics') {
                autoTable(doc, {
                    startY: 40,
                    head: [['Metric', 'Value']],
                    body: [
                        ['Total Employees', stats?.stats?.totalEmployees || 0],
                        ['Report Date', now]
                    ],
                });
            } else if (reportName === 'Vendor Procurement Log') {
                const rows = (stats?.tables?.recentOrders || []).map(o => [
                    o.orderNumber || 'N/A', o.orderType || 'N/A', o.vendor?.name || 'Unassigned',
                    o.totalAmount || 0, o.status || 'Pending'
                ]);
                autoTable(doc, {
                    startY: 40,
                    head: [['Order#', 'Order Type', 'Vendor', 'Amount', 'Status']],
                    body: rows,
                });
            }

            doc.save(`${reportName.replace(/\s+/g, '-').toLowerCase()}-${now}.pdf`);
            showToast(`✅ ${reportName} downloaded successfully!`);
        } catch (err) {
            console.error(err);
            showToast('❌ Download failed. Try again.', 'error');
        } finally {
            setDownloading(null);
        }
    };

    const handleCustomReport = async () => {
        if (!customReport.type) return showToast('Please select a report type.', 'error');
        if (!customReport.from || !customReport.to) return showToast('Please select both Date From and Date To.', 'error');
        
        const parseDate = (dStr) => {
            if (!dStr) return new Date();
            if (dStr.includes('-')) {
                const parts = dStr.split('-');
                if (parts[0].length === 2) {
                    // Assuming DD-MM-YYYY
                    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
            }
            return new Date(dStr);
        };

        const fromDate = parseDate(customReport.from);
        const toDate = parseDate(customReport.to);
        
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return showToast('Invalid date format provided.', 'error');
        }

        if (fromDate > toDate) {
            return showToast('Date From cannot be greater than Date To.', 'error');
        }

        const toDateEnd = new Date(toDate.getTime() + 86400000); // include the end date fully

        setDownloading('Custom Report');
        try {
            let data = [];
            let head = [];
            let rows = [];

            const getArrayData = (response) => {
                if (Array.isArray(response.data)) return response.data;
                if (response.data && Array.isArray(response.data.data)) return response.data.data;
                return [];
            };

            if (customReport.type === 'Revenue Summary' || customReport.type === 'Order History') {
                const res = await API.get('/orders');
                const allData = getArrayData(res);
                data = allData.filter(d => new Date(d.createdAt) >= fromDate && new Date(d.createdAt) <= toDateEnd);
                
                if (customReport.type === 'Revenue Summary') {
                    const salesOrders = data.filter(o => o.orderType === 'sales' && o.status !== 'Cancelled');
                    head = [['Order#', 'Date', 'Customer', 'Amount', 'Status']];
                    rows = salesOrders.map(o => [o.orderNumber, new Date(o.createdAt).toLocaleDateString(), o.customer?.name || 'Unassigned', `₹${o.totalAmount}`, o.status]);
                } else {
                    const hasSales = data.some(o => o.orderType === 'sales');
                    const hasPurchase = data.some(o => o.orderType === 'purchase');
                    const customerVendorHeader = (hasSales && hasPurchase) ? 'Customer / Vendor' : (hasPurchase ? 'Vendor' : 'Customer');

                    head = [['Order#', 'Type', 'Date', customerVendorHeader, 'Amount', 'Status']];
                    rows = data.map(o => [o.orderNumber, o.orderType || 'sales', new Date(o.createdAt).toLocaleDateString(), o.orderType === 'purchase' ? (o.vendor?.name || 'Unassigned') : (o.customer?.name || 'Unassigned'), `₹${o.totalAmount}`, o.status]);
                }
            } else if (customReport.type === 'Inventory Report') {
                const res = await API.get('/materials');
                const allData = getArrayData(res);
                data = allData;
                head = [['Name', 'SKU', 'Category', 'Quantity', 'Price']];
                rows = data.map(m => [m.name, m.sku, m.category, m.quantity, `₹${m.price}`]);
            } else if (customReport.type === 'Customer Report') {
                const res = await API.get('/customers');
                const allData = getArrayData(res);
                data = allData.filter(d => new Date(d.createdAt) >= fromDate && new Date(d.createdAt) <= toDateEnd);
                head = [['Name', 'Email', 'Phone', 'Company', 'Status']];
                rows = data.map(c => [c.name, c.email, c.phone, c.company || 'N/A', c.status || 'Active']);
            } else if (customReport.type === 'Vendor Report') {
                const res = await API.get('/vendors');
                const allData = getArrayData(res);
                data = allData.filter(d => new Date(d.createdAt) >= fromDate && new Date(d.createdAt) <= toDateEnd);
                head = [['Name', 'Category', 'Contact Person', 'Email', 'Status']];
                rows = data.map(v => [v.name, v.category, v.contactPerson || 'N/A', v.email, v.status || 'Active']);
            } else {
                throw new Error("Invalid Report Type selected.");
            }

            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text(`SMTBMS - ${customReport.type}`, 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
            doc.text(`Date Range: ${customReport.from} to ${customReport.to}`, 14, 36);
            
            if (rows.length === 0) {
                doc.setFontSize(14);
                doc.setTextColor(200, 0, 0);
                doc.text("No records found in this date range.", 14, 50);
            } else {
                autoTable(doc, {
                    startY: 42,
                    head: head,
                    body: rows,
                });
            }

            doc.save(`${customReport.type.replace(/\s+/g, '-').toLowerCase()}_${customReport.from}_${customReport.to}.pdf`);
            showToast(`✅ Custom report generated!`);
            setShowCustomReport(false);
            setCustomReport({ type: '', format: 'PDF', from: '', to: '' });
        } catch (err) {
            console.error('Report Generation Error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred.';
            showToast(`❌ Failed to generate report: ${errorMsg}`, 'error');
        } finally {
            setDownloading(null);
        }
    };

    const reports = [
        { name: 'Monthly Revenue Report', schedule: 'Daily', format: 'PDF', icon: <TrendingUp color="#6366f1" size={22} />, color: '#6366f1' },
        { name: 'Inventory Usage Summary', schedule: 'Weekly', format: 'PDF', icon: <Package color="#14b8a6" size={22} />, color: '#14b8a6' },
        { name: 'Employee Performance Metrics', schedule: 'Monthly', format: 'PDF', icon: <Users color="#f59e0b" size={22} />, color: '#f59e0b' },
        { name: 'Vendor Procurement Log', schedule: 'Custom', format: 'PDF', icon: <ShoppingCart color="#ec4899" size={22} />, color: '#ec4899' },
    ];

    const rawChartData = stats?.charts?.monthlyStats || [];
    
    // Ensure 6 months data for the graph
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        if (m < 0) m += 12;
        const mName = monthNames[m];
        
        const existingData = rawChartData.find(d => d.name === mName || d.name?.includes(mName));
        chartData.push({
            name: mName,
            revenue: existingData ? Number(existingData.revenue) : 0,
            sales: existingData ? Number(existingData.sales) : 0,
        });
    }

    const categoryData = stats?.charts?.categoryData || [];
    const chartRevenueSum = rawChartData.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0) || 0;

    // Summary Analytics Data
    const totalOrdersCount = rawChartData.reduce((sum, m) => sum + (Number(m.sales) || 0), 0) || 0;
    const avgMonthlyRevenue = rawChartData.length > 0 ? (chartRevenueSum / rawChartData.length) : 0;
    const highestRevenueMonth = rawChartData.length > 0 
        ? rawChartData.reduce((max, current) => (Number(current.revenue) > Number(max.revenue) ? current : max), { revenue: 0, name: 'N/A' }) 
        : { revenue: 0, name: 'N/A' };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    const formatLakhs = (val) => {
        if (val === 0) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1).replace('.0', '')}L`;
        return `₹${val.toLocaleString('en-IN')}`;
    };

    const kpis = [
        { label: 'Total Orders', value: stats?.stats?.totalOrders ?? '—', icon: <ShoppingCart size={18} />, color: '#f59e0b' },
        { label: 'Sales Orders', value: stats?.stats?.totalSalesOrders ?? '—', icon: <ShoppingCart size={18} />, color: '#10b981' },
        { label: 'Purchase Orders', value: stats?.stats?.totalPurchaseOrders ?? '—', icon: <ShoppingCart size={18} />, color: '#3b82f6' },
        { label: 'Total Revenue', value: `₹${chartRevenueSum.toLocaleString('en-IN')}`, icon: <TrendingUp size={18} />, color: '#10b981' },
        { label: 'Purchase Cost', value: `₹${(stats?.stats?.purchaseCost || 0).toLocaleString('en-IN')}`, icon: <TrendingUp size={18} />, color: '#ef4444' },
    ];

    return (
        <div className="page-container">

            {/* Toast */}
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="report-header">
                <div>
                    <h1 className="title-gradient">Reports & Analytics</h1>
                    <p className="text-muted">Generate and download comprehensive system audits and data insights.</p>
                </div>
                <div className="header-actions">
                    <div className="date-range-wrapper">
                        <button className="btn-date-picker flex-center gap-10" onClick={() => setShowDatePicker(!showDatePicker)}>
                            <Calendar size={16} className="calendar-picker-icon" />
                            <span className="date-range-text">{getFormattedDateRange()}</span>
                            <ChevronDown size={14} className="arrow-down-icon" />
                        </button>
                        {showDatePicker && (
                            <div className="date-dropdown glass-card">
                                {['7', '30', '90', '365'].map(d => (
                                    <div
                                        key={d}
                                        className={`date-option ${dateRange === d ? 'active' : ''}`}
                                        onClick={() => { setDateRange(d); setShowDatePicker(false); showToast(`Viewing last ${d} days`); }}
                                    >
                                        Last {d} Days
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="btn-primary flex-center gap-10" onClick={() => setShowCustomReport(true)}>
                        <FileText size={16} /> Generate Custom Report
                    </button>
                </div>
            </header>

            {/* KPI Row */}
            <div className="kpi-row">
                {kpis.map((kpi, i) => (
                    <div key={i} className="glass-card kpi-card">
                        <div className="kpi-icon" style={{ background: kpi.color + '22', color: kpi.color }}>{kpi.icon}</div>
                        <div>
                            <p className="kpi-label">{kpi.label}</p>
                            <h3 className="kpi-value">{loading ? '...' : kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Cards */}
            <div className="reports-grid">
                {reports.map((report, i) => (
                    <div key={i} className="glass-card report-card">
                        <div className="report-icon-box" style={{ background: report.color + '22' }}>{report.icon}</div>
                        <div className="report-info">
                            <h3>{report.name}</h3>
                            <p>Schedule: <strong>{report.schedule}</strong> · Format: <strong>{report.format}</strong></p>
                        </div>
                        <button
                            className={`download-btn-circle ${downloading === report.name ? 'spinning' : ''}`}
                            style={{ background: report.color }}
                            onClick={() => handleDownload(report.name, report.format)}
                            title={`Download ${report.name}`}
                            disabled={!!downloading}
                        >
                            {downloading === report.name
                                ? <RefreshCw size={18} className="spin-icon" />
                                : <Download size={18} />}
                        </button>
                    </div>
                ))}
            </div>

            {/* Deep Data Insights - BI Dashboard */}
            <div className="analytics-section mt-30">
                <div className="analytics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Business Intelligence Dashboard</h3>
                    <div className="analytics-controls" style={{ display: 'flex', gap: '12px' }}>
                        <div className="filter-wrapper" style={{ position: 'relative' }}>
                            <button className="filter-btn flex-center gap-10" onClick={() => setShowFilters(!showFilters)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                                <Filter size={14} /> Filters
                            </button>
                            {showFilters && (
                                <div className="filter-dropdown glass-card" style={{ position: 'absolute', right: 0, top: '40px', zIndex: 10, padding: '12px', minWidth: '180px' }}>
                                    <p className="filter-label" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px' }}>Category</p>
                                    {['All', 'Chemicals', 'Consumables', 'Construction', 'Electrical', 'Electronics', 'Metals', 'Plastics', 'Plumbing', 'Raw Material', 'Sheet Metal', 'Structural Steel'].map(cat => (
                                        <div
                                            key={cat}
                                            className={`filter-option ${filterCategory === cat ? 'active' : ''}`}
                                            onClick={() => { setFilterCategory(cat); setShowFilters(false); }}
                                            style={{ padding: '6px 10px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', background: filterCategory === cat ? 'var(--primary-50)' : 'transparent', color: filterCategory === cat ? 'var(--primary)' : 'var(--text-primary)' }}
                                        >
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="refresh-btn" onClick={fetchStats} title="Refresh data" style={{ padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="chart-loading" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <RefreshCw size={30} className="spin-icon" style={{ marginBottom: '10px' }} />
                        <p className="text-muted">Loading analytics data...</p>
                    </div>
                ) : error || !stats ? (
                    <div className="chart-empty glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <AlertTriangle size={60} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
                        <p className="text-muted" style={{ color: '#ef4444', fontWeight: 600 }}>Failed to load analytics data</p>
                        <p className="text-muted" style={{ fontSize: '13px', maxWidth: '380px', margin: '10px auto' }}>{error || 'Unable to connect to the server.'}</p>
                        <button className="btn-primary mt-10" onClick={fetchStats}>Retry Connection</button>
                    </div>
                ) : rawChartData.length === 0 ? (
                    <div className="chart-empty glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <BarChart2 size={60} color="#334155" style={{ margin: '0 auto 16px auto' }} />
                        <p className="text-muted">No order data yet. Create orders to see analytics here.</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                            <div className="premium-card" style={{ padding: '20px', borderRadius: '12px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Total Revenue</p>
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>{formatCurrency(chartRevenueSum)}</h3>
                            </div>
                            <div className="premium-card" style={{ padding: '20px', borderRadius: '12px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Avg Monthly Revenue</p>
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#6366f1' }}>{formatCurrency(avgMonthlyRevenue)}</h3>
                            </div>
                            <div className="premium-card" style={{ padding: '20px', borderRadius: '12px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Highest Revenue Month</p>
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f59e0b' }}>{highestRevenueMonth.name}</h3>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatCurrency(highestRevenueMonth.revenue)}</span>
                            </div>
                            <div className="premium-card" style={{ padding: '20px', borderRadius: '12px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Total Orders</p>
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#3b82f6' }}>{totalOrdersCount}</h3>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            {/* Revenue Trend Area Chart */}
                            <div className="premium-card" style={{ padding: '20px', borderRadius: '12px', gridColumn: '1 / -1' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Revenue Trend</h4>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="revGradBI" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatLakhs} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', fontWeight: '600' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#revGradBI)" name="Revenue" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Orders Trend Line Chart */}
                            <div className="premium-card" style={{ padding: '20px', borderRadius: '12px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Monthly Orders</h4>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', fontWeight: '600' }} />
                                            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Orders" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Inventory Usage Donut Chart */}
                            <div className="premium-card" style={{ padding: '20px', borderRadius: '12px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Inventory by Category</h4>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]}
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {(categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', fontWeight: '600' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Custom Report Modal */}
            {showCustomReport && (
                <div className="modal-overlay">
                    <div className="glass-card modal-box animate-pop">
                        <div className="modal-head">
                            <h3>Generate Custom Report</h3>
                            <button className="close-x" onClick={() => setShowCustomReport(false)}>✕</button>
                        </div>
                        <div className="form-group">
                            <label>Report Type</label>
                            <select value={customReport.type} onChange={e => setCustomReport({ ...customReport, type: e.target.value })}>
                                <option value="">Select report type...</option>
                                <option value="Revenue Summary">Revenue Summary</option>
                                <option value="Inventory Report">Inventory Report</option>
                                <option value="Order History">Order History</option>
                                <option value="Customer Report">Customer Report</option>
                                <option value="Vendor Report">Vendor Report</option>
                            </select>
                        </div>
                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Date From</label>
                                <input type="date" value={customReport.from} onChange={e => setCustomReport({ ...customReport, from: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Date To</label>
                                <input type="date" value={customReport.to} onChange={e => setCustomReport({ ...customReport, to: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-foot">
                            <button className="btn-cancel" onClick={() => setShowCustomReport(false)}>Cancel</button>
                            <button className="btn-primary flex-center gap-10" onClick={handleCustomReport}>
                                <Download size={16} /> Download Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                /* Analytics Metric Cards */
                .analytics-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                
                /* Toast */
                .toast-notification {
                    position: fixed; top: 20px; right: 20px; z-index: 9999;
                    display: flex; align-items: center; gap: 10px;
                    padding: 14px 22px; border-radius: var(--radius-md, 12px); font-size: 14px; font-weight: 600;
                    animation: slideInRight 0.3s ease;
                }
                .toast-notification.success { background: var(--success-light); border: 1px solid var(--success); color: var(--success); }
                .toast-notification.error { background: var(--danger-light); border: 1px solid var(--danger); color: var(--danger); }
                @keyframes slideInRight { from { opacity:0; transform: translateX(50px); } to { opacity:1; transform: translateX(0); } }

                /* Header */
                .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; gap: 20px; }
                .title-gradient { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
                .text-muted { font-size: 14px; color: var(--text-muted); margin: 0; }
                .header-actions { display: flex; gap: 12px; align-items: center; }

                /* Date Range Picker */
                .date-range-wrapper { position: relative; }
                .btn-date-picker {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    padding: 10px 18px;
                    border-radius: var(--radius-full, 9999px);
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: var(--shadow-sm);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    transition: all 0.2s ease;
                }
                .btn-date-picker:hover {
                    background: var(--bg-hover);
                    border-color: var(--border-hover);
                    transform: translateY(-0.5px);
                }
                .calendar-picker-icon {
                    color: var(--text-secondary);
                    margin-right: 6px;
                }
                .date-range-text {
                    color: var(--text-primary);
                    font-weight: 700;
                    margin-right: 6px;
                }
                .arrow-down-icon {
                    color: var(--text-muted);
                }
                
                .date-dropdown { 
                    position: absolute; 
                    top: 45px; 
                    right: 0; 
                    z-index: 100; 
                    min-width: 160px; 
                    padding: 8px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    box-shadow: var(--shadow-md);
                }
                .date-option { padding: 10px 15px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-secondary); transition: 0.2s; }
                .date-option:hover, .date-option.active { background: var(--primary-50); color: var(--primary); }

                /* Buttons */
                .btn-primary {
                    background: var(--primary) !important;
                    color: white !important;
                    padding: 10px 20px;
                    border-radius: var(--radius-full, 9999px);
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.15);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-transform: none;
                    letter-spacing: normal;
                    border: none;
                }
                .btn-primary:hover {
                    background: #1d4ed8 !important;
                    transform: translateY(-0.5px);
                    box-shadow: 0 6px 12px -1px rgba(37, 99, 235, 0.25);
                }

                /* KPI Cards */
                .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                .kpi-card { 
                    background: var(--bg-card) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: var(--radius-lg, 16px) !important;
                    display: flex; 
                    align-items: center; 
                    gap: 15px; 
                    padding: 20px; 
                    box-shadow: var(--shadow-sm) !important;
                    position: relative;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md) !important; }
                .kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .kpi-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 2px 0; }
                .kpi-value { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0; }

                /* Report Cards */
                .reports-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                .report-card { 
                    background: var(--bg-card) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: var(--radius-lg, 16px) !important;
                    display: flex; 
                    align-items: center; 
                    gap: 20px; 
                    padding: 24px; 
                    transition: all 0.2s ease; 
                    box-shadow: var(--shadow-sm) !important;
                }
                .report-card:hover { border-color: var(--primary) !important; transform: translateY(-2px); box-shadow: var(--shadow-md) !important; }
                .report-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .report-info { flex: 1; }
                .report-info h3 { font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
                .report-info p { font-size: 13px; color: var(--text-muted); margin: 0; }
                .download-btn-circle { width: 44px; height: 44px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; cursor: pointer; border: none; }
                .download-btn-circle:hover { transform: scale(1.05); opacity: 0.9; }
                .download-btn-circle:disabled { opacity: 0.6; cursor: not-allowed; }

                /* Analytics Section */
                .analytics-section { 
                    background: var(--bg-card) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: var(--radius-lg, 16px) !important;
                    padding: 28px; 
                    box-shadow: var(--shadow-sm) !important;
                }
                .analytics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
                .analytics-header h3 { font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0; }
                .analytics-controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
                
                .chart-tabs { 
                    display: flex; 
                    background: var(--bg-body); 
                    border-radius: 10px; 
                    padding: 4px; 
                    border: 1px solid var(--border); 
                    overflow-x: auto; 
                    -webkit-overflow-scrolling: touch; 
                }
                .chart-tab { 
                    padding: 8px 18px; 
                    border-radius: 8px; 
                    font-size: 13px; 
                    font-weight: 700; 
                    color: var(--text-secondary); 
                    transition: 0.2s; 
                    white-space: nowrap; 
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }
                .chart-tab.active { background: var(--primary); color: white; }
                .chart-tab:hover:not(.active) { color: var(--text-primary); }
                
                .chart-container { height: 340px; width: 100%; }
                .chart-loading, .chart-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; }

                /* Filters & Refresh */
                .filter-wrapper { position: relative; }
                .filter-btn { 
                    padding: 10px 16px; 
                    background: var(--bg-card); 
                    border: 1px solid var(--border); 
                    border-radius: 8px; 
                    color: var(--text-secondary); 
                    font-size: 13px; 
                    font-weight: 700; 
                    cursor: pointer; 
                    transition: all 0.2s ease;
                }
                .filter-btn:hover {
                    background: var(--bg-hover);
                    border-color: var(--border-hover);
                }
                .filter-dropdown { 
                    position: absolute; 
                    top: 45px; 
                    right: 0; 
                    z-index: 100; 
                    min-width: 160px; 
                    padding: 8px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    box-shadow: var(--shadow-md);
                }
                .filter-label { font-size: 11px; color: var(--text-muted); padding: 6px 15px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0; }
                .filter-option { padding: 10px 15px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-secondary); transition: 0.2s; }
                .filter-option:hover, .filter-option.active { background: var(--primary-50); color: var(--primary); }
                
                .refresh-btn { 
                    width: 40px; 
                    height: 40px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    background: var(--bg-card); 
                    border: 1px solid var(--border); 
                    border-radius: 8px; 
                    color: var(--text-secondary); 
                    cursor: pointer; 
                    transition: 0.2s; 
                    flex-shrink: 0; 
                }
                .refresh-btn:hover { color: var(--primary); border-color: var(--primary); background: var(--primary-50); }

                /* Custom Report Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                
                .modal-box { 
                    width: 100%; 
                    max-width: 550px; 
                    padding: 32px; 
                    max-height: 90vh; 
                    overflow-y: auto; 
                    background: var(--bg-card) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: var(--radius-lg, 16px) !important;
                    box-shadow: var(--shadow-lg) !important;
                }
                .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
                .modal-head h3 { font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0; }
                .close-x { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; padding: 4px; border-radius: 6px; transition: background 0.2s; }
                .close-x:hover { background: var(--bg-hover); color: var(--text-primary); }
                
                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .form-group input, .form-group select { 
                    padding: 12px 16px; 
                    background: var(--bg-body) !important; 
                    border: 1px solid var(--border) !important; 
                    border-radius: 8px !important; 
                    color: var(--text-primary) !important; 
                    font-size: 14px !important; 
                    width: 100% !important; 
                    outline: none;
                    transition: border-color 0.2s;
                    box-shadow: none !important;
                }
                .form-group input:focus, .form-group select:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px var(--primary-50) !important;
                }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group select option { 
                    background: var(--bg-body) !important; 
                    color: var(--text-primary) !important; 
                }
                
                .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .modal-foot { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; border-top: 1px solid var(--border); padding-top: 24px; }
                
                .btn-cancel { 
                    background: var(--bg-body); 
                    color: var(--text-secondary); 
                    border: 1px solid var(--border); 
                    padding: 12px 24px; 
                    border-radius: 8px; 
                    font-weight: 700; 
                    font-size: 14px;
                    cursor: pointer; 
                    transition: all 0.2s ease;
                }
                .btn-cancel:hover {
                    background: var(--bg-hover);
                    border-color: var(--border-hover);
                    color: var(--text-primary);
                }

                .mt-30 { margin-top: 30px; }
                .mt-10 { margin-top: 10px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                /* Spinner & Animation */
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: scale(1); } }

                @media (max-width: 1100px) { 
                    .kpi-row { grid-template-columns: 1fr 1fr; } 
                    .reports-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .page-container { padding: 16px 12px; }
                    .report-header { flex-direction: column; align-items: flex-start; }
                    .header-actions { width: 100%; flex-direction: column; }
                    .header-actions button, .date-range-wrapper { width: 100%; }
                    .header-actions button { justify-content: center; }
                    .kpi-row { grid-template-columns: 1fr; }
                    .analytics-header { flex-direction: column; align-items: flex-start; }
                    .chart-tabs { width: 100%; }
                    .form-row-2 { grid-template-columns: 1fr; }
                    .modal-foot { flex-direction: column; }
                    .modal-foot button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Reports;
