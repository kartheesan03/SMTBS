import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import {
    Download, FileText, BarChart2, PieChart as PieChartIcon,
    Calendar, Filter, TrendingUp, Package, Users, ShoppingCart,
    RefreshCw, CheckCircle, X, ChevronDown
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeChart, setActiveChart] = useState('revenue');
    const [dateRange, setDateRange] = useState('30');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCustomReport, setShowCustomReport] = useState(false);
    const [customReport, setCustomReport] = useState({ type: '', format: 'PDF', from: '', to: '' });
    const [downloading, setDownloading] = useState(null);
    const [toast, setToast] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/dashboard/stats');
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Generate CSV content from data
    const generateCSV = (headers, rows) => {
        const csvRows = [headers.join(','), ...rows.map(r => r.join(','))];
        return csvRows.join('\n');
    };

    // Trigger a browser download
    const triggerDownload = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownload = async (reportName, format) => {
        setDownloading(reportName);
        try {
            let content = '';
            let filename = '';
            const now = new Date().toISOString().split('T')[0];

            if (reportName === 'Monthly Revenue Report') {
                const rows = (stats?.charts?.monthlyStats || []).map(m => [m.name, m.revenue || 0, m.sales || 0]);
                content = generateCSV(['Month', 'Revenue ($)', 'Orders'], rows);
                filename = `revenue-report-${now}.csv`;
            } else if (reportName === 'Inventory Usage Summary') {
                const rows = (stats?.tables?.lowStock || []).map(m => [m.name, m.sku, m.quantity, m.unit, m.status || 'Low Stock']);
                content = generateCSV(['Material Name', 'SKU', 'Quantity', 'Unit', 'Status'], rows);
                filename = `inventory-report-${now}.csv`;
            } else if (reportName === 'Employee Performance Metrics') {
                content = generateCSV(
                    ['Metric', 'Value'],
                    [['Total Employees', stats?.stats?.totalEmployees || 0], ['Report Date', now]]
                );
                filename = `employee-report-${now}.csv`;
            } else if (reportName === 'Vendor Procurement Log') {
                const rows = (stats?.tables?.recentOrders || []).map(o => [
                    o.orderNumber || 'N/A', o.customer?.name || 'Walk-in',
                    o.totalAmount || 0, o.status || 'Pending'
                ]);
                content = generateCSV(['Order#', 'Customer', 'Amount', 'Status'], rows);
                filename = `vendor-procurement-${now}.csv`;
            }

            triggerDownload(content, filename, 'text/csv');
            showToast(`✅ ${reportName} downloaded successfully!`);
        } catch (err) {
            showToast('❌ Download failed. Try again.', 'error');
        } finally {
            setDownloading(null);
        }
    };

    const handleCustomReport = () => {
        if (!customReport.type) return showToast('Please select a report type.', 'error');
        const content = generateCSV(
            ['Report Type', 'Date From', 'Date To', 'Generated At'],
            [[customReport.type, customReport.from || 'N/A', customReport.to || 'N/A', new Date().toLocaleString()]]
        );
        const now = new Date().toISOString().split('T')[0];
        triggerDownload(content, `custom-report-${customReport.type.toLowerCase().replace(/\s+/g, '-')}-${now}.csv`, 'text/csv');
        showToast(`✅ Custom report generated!`);
        setShowCustomReport(false);
        setCustomReport({ type: '', format: 'PDF', from: '', to: '' });
    };

    const reports = [
        { name: 'Monthly Revenue Report', schedule: 'Daily', format: 'CSV', icon: <TrendingUp color="#6366f1" size={22} />, color: '#6366f1' },
        { name: 'Inventory Usage Summary', schedule: 'Weekly', format: 'CSV', icon: <Package color="#14b8a6" size={22} />, color: '#14b8a6' },
        { name: 'Employee Performance Metrics', schedule: 'Monthly', format: 'CSV', icon: <Users color="#f59e0b" size={22} />, color: '#f59e0b' },
        { name: 'Vendor Procurement Log', schedule: 'Custom', format: 'CSV', icon: <ShoppingCart color="#ec4899" size={22} />, color: '#ec4899' },
    ];

    const chartData = stats?.charts?.monthlyStats || [];
    const categoryData = stats?.charts?.categoryData || [];

    // KPI Cards from live data
    const kpis = [
        { label: 'Total Materials', value: stats?.stats?.totalMaterials ?? '—', icon: <Package size={18} />, color: '#6366f1' },
        { label: 'Total Employees', value: stats?.stats?.totalEmployees ?? '—', icon: <Users size={18} />, color: '#14b8a6' },
        { label: 'Total Orders', value: stats?.stats?.totalOrders ?? '—', icon: <ShoppingCart size={18} />, color: '#f59e0b' },
        { label: 'Total Revenue', value: `$${(stats?.stats?.revenue || 0).toLocaleString()}`, icon: <TrendingUp size={18} />, color: '#10b981' },
    ];

    return (
        <div className="reports-container">

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
                        <button className="btn-secondary flex-center gap-10" onClick={() => setShowDatePicker(!showDatePicker)}>
                            <Calendar size={16} />
                            Last {dateRange} Days
                            <ChevronDown size={14} />
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

            {/* Deep Data Insights */}
            <div className="glass-card analytics-section mt-30">
                <div className="analytics-header">
                    <h3>Deep Data Insights</h3>
                    <div className="analytics-controls">
                        <div className="chart-tabs">
                            {['revenue', 'orders', 'inventory'].map(tab => (
                                <button
                                    key={tab}
                                    className={`chart-tab ${activeChart === tab ? 'active' : ''}`}
                                    onClick={() => setActiveChart(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="filter-wrapper">
                            <button className="filter-btn flex-center gap-10" onClick={() => setShowFilters(!showFilters)}>
                                <Filter size={14} /> Filters
                            </button>
                            {showFilters && (
                                <div className="filter-dropdown glass-card">
                                    <p className="filter-label">Category</p>
                                    {['All', 'Metals', 'Plastics', 'Electronics', 'Raw Material'].map(cat => (
                                        <div
                                            key={cat}
                                            className={`filter-option ${filterCategory === cat ? 'active' : ''}`}
                                            onClick={() => { setFilterCategory(cat); setShowFilters(false); }}
                                        >
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="refresh-btn" onClick={fetchStats} title="Refresh data">
                            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                        </button>
                    </div>
                </div>

                <div className="chart-container">
                    {loading ? (
                        <div className="chart-loading">
                            <RefreshCw size={30} className="spin-icon" />
                            <p className="text-muted">Loading analytics data...</p>
                        </div>
                    ) : chartData.length === 0 && activeChart !== 'inventory' ? (
                        <div className="chart-empty">
                            <BarChart2 size={60} color="#334155" />
                            <p className="text-muted">No order data yet. Create orders to see analytics here.</p>
                        </div>
                    ) : activeChart === 'revenue' ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '10px', border: '1px solid #334155', color: '#fff' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#revGrad)" name="Revenue ($)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : activeChart === 'orders' ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '10px', border: '1px solid #334155', color: '#fff' }} />
                                <Bar dataKey="sales" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]}
                                    innerRadius={80}
                                    outerRadius={130}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {(categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '10px', border: '1px solid #334155', color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
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
                                <option value="Employee Report">Employee Report</option>
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
                .reports-container { padding: 30px; position: relative; }

                /* Toast */
                .toast-notification {
                    position: fixed; top: 20px; right: 20px; z-index: 9999;
                    display: flex; align-items: center; gap: 10px;
                    padding: 14px 22px; border-radius: 12px; font-size: 14px; font-weight: 600;
                    animation: slideInRight 0.3s ease;
                }
                .toast-notification.success { background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; }
                .toast-notification.error { background: rgba(239,68,68,0.15); border: 1px solid #ef4444; color: #ef4444; }
                @keyframes slideInRight { from { opacity:0; transform: translateX(50px); } to { opacity:1; transform: translateX(0); } }

                /* Header */
                .report-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; gap: 20px; }
                .header-actions { display: flex; gap: 12px; align-items: center; }

                /* Date Range Picker */
                .date-range-wrapper { position: relative; }
                .date-dropdown { position: absolute; top: 45px; right: 0; z-index: 100; min-width: 160px; padding: 8px; }
                .date-option { padding: 10px 15px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: 0.2s; }
                .date-option:hover, .date-option.active { background: rgba(99,102,241,0.15); color: var(--primary); }

                /* KPI Row */
                .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 25px; }
                .kpi-card { display: flex; align-items: center; gap: 15px; padding: 20px; }
                .kpi-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .kpi-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
                .kpi-value { font-size: 22px; font-weight: 700; }

                /* Report Cards */
                .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .report-card { display: flex; align-items: center; gap: 20px; padding: 22px; transition: 0.3s; }
                .report-card:hover { border-color: var(--primary); transform: translateY(-3px); }
                .report-icon-box { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .report-info { flex: 1; }
                .report-info h3 { font-size: 15px; margin-bottom: 5px; }
                .report-info p { font-size: 12px; color: var(--text-muted); }
                .download-btn-circle { width: 45px; height: 45px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; transition: 0.3s; flex-shrink: 0; }
                .download-btn-circle:hover { transform: scale(1.1) rotate(15deg); opacity: 0.9; }
                .download-btn-circle:disabled { opacity: 0.6; cursor: not-allowed; }

                /* Analytics Section */
                .analytics-section { padding: 25px; }
                .analytics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
                .analytics-controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
                .chart-tabs { display: flex; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 4px; border: 1px solid var(--border); overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .chart-tab { padding: 7px 16px; border-radius: 7px; font-size: 13px; font-weight: 500; color: var(--text-muted); transition: 0.2s; white-space: nowrap; }
                .chart-tab.active { background: var(--primary); color: white; }
                .chart-tab:hover:not(.active) { color: white; }
                .chart-container { height: 320px; width: 100%; }
                .chart-loading, .chart-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; }

                /* Filters */
                .filter-wrapper { position: relative; }
                .filter-btn { padding: 8px 14px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-muted); font-size: 13px; cursor: pointer; }
                .filter-dropdown { position: absolute; top: 40px; right: 0; z-index: 100; min-width: 160px; padding: 8px; }
                .filter-label { font-size: 11px; color: var(--text-muted); padding: 5px 15px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
                .filter-option { padding: 9px 15px; border-radius: 8px; cursor: pointer; font-size: 13px; transition: 0.2s; }
                .filter-option:hover, .filter-option.active { background: rgba(99,102,241,0.15); color: var(--primary); }
                .refresh-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-muted); cursor: pointer; transition: 0.2s; flex-shrink: 0; }
                .refresh-btn:hover { color: var(--primary); border-color: var(--primary); }

                /* Custom Report Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-box { width: 100%; max-width: 500px; padding: 30px; max-height: 90vh; overflow-y: auto; }
                .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-x { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; }
                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
                .form-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
                .form-group input, .form-group select { padding: 11px 14px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px; width: 100%; }
                .form-group select option { background: #1e293b; color: white; }
                .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .modal-foot { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; border-top: 1px solid var(--border); padding-top: 20px; }
                .btn-cancel { background: transparent; color: var(--text-muted); border: 1px solid var(--border); padding: 10px 22px; border-radius: 8px; font-weight: 600; cursor: pointer; }

                .mt-30 { margin-top: 30px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                /* Spinner */
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: scale(1); } }

                @media (max-width: 1100px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
                @media (max-width: 768px) {
                    .reports-container { padding: 15px; }
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
