import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    Download, FileText, RefreshCw, TrendingUp, DollarSign, Package, 
    Users, ShoppingCart, CheckCircle, Activity, Box, UserCheck, 
    Heart, ArrowUp, ArrowDown
} from 'lucide-react';
import { 
    ResponsiveContainer, ComposedChart, AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import './ReportsRedesign.css';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [loading, setLoading] = useState(true);
    const [dashData, setDashData] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const dashRes = await API.get('/dashboard/stats');
                console.log("DASHBOARD API RESPONSE:", dashRes.data);
                setDashData(dashRes.data || {});
            } catch (err) {
                console.error('Failed to load reports data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const tabs = ['Overview', 'Material', 'HRMS', 'ERP', 'CRM', 'Financial'];

    const formatCurrency = (val) => {
        if (!val) return '₹0';
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val.toLocaleString()}`;
    };

    const analytics = dashData?.analytics || {
        kpis: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, revenueGrowth: 0 },
        trendData: [],
        healthMetrics: { materialHealth: 0, hrAttendanceRate: 0, orderFulfillment: 0, customerRetention: 0 }
    };

    const totalMaterials = dashData?.stats?.totalMaterials || 0;
    const totalEmployees = dashData?.stats?.totalEmployees || 0;
    const totalCustomers = dashData?.stats?.totalCustomers || 0;

    const kpis = [
        { title: 'Total Revenue', value: formatCurrency(analytics.kpis.totalRevenue), trend: Math.abs(analytics.kpis.revenueGrowth), isUp: analytics.kpis.revenueGrowth >= 0, subtitle: 'Completed sales orders', icon: <DollarSign size={20} />, color: 'blue' },
        { title: 'Net Profit', value: formatCurrency(analytics.kpis.netProfit), trend: analytics.kpis.totalRevenue > 0 ? Math.round((analytics.kpis.netProfit / analytics.kpis.totalRevenue) * 100) : 0, isUp: analytics.kpis.netProfit >= 0, subtitle: 'Profit margin %', icon: <TrendingUp size={20} />, color: 'green' },
        { title: 'Total Materials', value: totalMaterials.toLocaleString(), trend: 0, isUp: true, subtitle: 'Active inventory items', icon: <Package size={20} />, color: 'purple' },
        { title: 'Total Employees', value: totalEmployees.toLocaleString(), trend: 0, isUp: true, subtitle: 'Active staff members', icon: <Users size={20} />, color: 'orange' },
        { title: 'Total Customers', value: totalCustomers.toLocaleString(), trend: 0, isUp: true, subtitle: 'Registered clients', icon: <ShoppingCart size={20} />, color: 'teal' },
    ];

    const trendData = analytics.trendData || [];

    const hm = analytics.healthMetrics;
    const healthMetrics = [
        { title: 'Material Health', value: `${hm.materialHealth}%`, status: hm.materialHealth >= 90 ? 'Excellent' : hm.materialHealth >= 75 ? 'Optimized' : 'Needs Attention', icon: <Box size={24} />, color: '#8b5cf6', percent: hm.materialHealth },
        { title: 'HR Attendance', value: `${hm.hrAttendanceRate}%`, status: hm.hrAttendanceRate >= 90 ? 'Excellent' : hm.hrAttendanceRate >= 75 ? 'Good' : 'Low', icon: <UserCheck size={24} />, color: '#10b981', percent: hm.hrAttendanceRate },
        { title: 'Order Fulfillment', value: `${hm.orderFulfillment}%`, status: hm.orderFulfillment >= 90 ? 'On Track' : hm.orderFulfillment >= 70 ? 'Good' : 'Behind', icon: <ShoppingCart size={24} />, color: '#3b82f6', percent: hm.orderFulfillment },
        { title: 'Customer Retention', value: `${hm.customerRetention}%`, status: hm.customerRetention >= 90 ? 'Excellent' : hm.customerRetention >= 70 ? 'Good' : 'Needs Work', icon: <Heart size={24} />, color: '#ec4899', percent: hm.customerRetention },
    ];

    const renderPie = (percent, color) => {
        const radius = 28;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percent / 100) * circumference;
        
        return (
            <div className="health-pie-wrapper">
                <svg width="100%" height="100%" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="32" cy="32" r={radius} fill="none" stroke={`${color}22`} strokeWidth="6" />
                    <circle 
                        cx="32" 
                        cy="32" 
                        r={radius} 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="health-pie-center" style={{ color }}>
                    {percent}%
                </div>
            </div>
        );
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Reports & Analytics Summary', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
        
        // Add KPIs
        const kpiData = kpis.map(k => [k.title || '', String(k.value || ''), k.subtitle || '']);
        doc.autoTable({
            startY: 40,
            head: [['Metric', 'Value', 'Description']],
            body: kpiData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
        
        // Add Trend Data
        const trendTableData = trendData.map(t => [t.name || '', `Rs. ${t.currentYearProfit}`, `Rs. ${t.lastYearProfit}`]);
        doc.autoTable({
            startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY : 100) + 15,
            head: [['Month', 'Current Year Profit', 'Last Year Profit']],
            body: trendTableData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
        
        doc.save('Analytics_Report.pdf');
    };

    const exportCSV = () => {
        const headers = ['Month', 'Current Year Profit', 'Last Year Profit'];
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        trendData.forEach(row => {
            csvRows.push(`${row.name},${row.currentYearProfit},${row.lastYearProfit}`);
        });
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Analytics_Trend.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="analytics-page"
        >
            <div className="analytics-header">
                <div className="header-left">
                    <h1>Reports & Analytics</h1>
                    <div className="filter-tabs">
                        {tabs.map(tab => (
                            <button 
                                key={tab} 
                                className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="header-right">
                    <button className="btn-export" onClick={exportPDF}>
                        <FileText size={16} /> Export PDF
                    </button>
                    <button className="btn-export" onClick={exportCSV}>
                        <FileText size={16} /> Export CSV
                    </button>
                    <button className="btn-refresh" onClick={() => window.location.reload()}>
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <RefreshCw className="spin-icon" size={32} />
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="kpi-cards-grid"
                    >
                        {kpis.map((kpi, index) => (
                            <div key={index} className={`rd-kpi-card ${kpi.color}`}>
                                <div className="kpi-top">
                                    <div className="kpi-icon-box">
                                        {kpi.icon}
                                    </div>
                                    {kpi.trend > 0 && (
                                        <div className={`kpi-trend ${kpi.isUp ? 'up' : 'down'}`}>
                                            {kpi.isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                            {kpi.trend}%
                                        </div>
                                    )}
                                </div>
                                <div className="kpi-content">
                                    <h3>{kpi.value}</h3>
                                    <p className="kpi-title">{kpi.title}</p>
                                    <div className="kpi-mini-bar-bg">
                                        <div className="kpi-mini-bar-fill" style={{ width: `${Math.min(100, (kpi.trend || 0) * 5 + 50)}%` }}></div>
                                    </div>
                                    <p className="kpi-subtitle">{kpi.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Chart Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="rd-chart-card"
                    >
                        <div className="chart-header-split">
                            <div className="chart-header-block">
                                <div className="chart-header-title">
                                    Net profit <span className="legend-dot" style={{ background: '#3b82f6', marginLeft: '12px' }}></span> <span style={{color: '#3b82f6'}}>Current year</span>
                                </div>
                                <div className="chart-header-value">
                                    {formatCurrency(analytics.kpis.currentYearTotalProfit || 0)}
                                    {analytics.kpis.lastYearTotalProfit > 0 && (
                                        <span className={`trend-badge ${((analytics.kpis.currentYearTotalProfit - analytics.kpis.lastYearTotalProfit) / analytics.kpis.lastYearTotalProfit) >= 0 ? 'up' : 'down'}`}>
                                            {((analytics.kpis.currentYearTotalProfit - analytics.kpis.lastYearTotalProfit) / analytics.kpis.lastYearTotalProfit) >= 0 ? '+' : ''}
                                            {(((analytics.kpis.currentYearTotalProfit - analytics.kpis.lastYearTotalProfit) / analytics.kpis.lastYearTotalProfit) * 100).toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="chart-header-block">
                                <div className="chart-header-title">
                                    Net profit <span className="legend-dot" style={{ background: '#cbd5e1', marginLeft: '12px', width: '8px', height: '8px', border: '2px solid #cbd5e1', background: 'white' }}></span> <span style={{color: '#94a3b8'}}>Last year</span>
                                </div>
                                <div className="chart-header-value">
                                    {formatCurrency(analytics.kpis.lastYearTotalProfit || 0)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="rd-chart-body" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorLy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        scale="point"
                                        padding={{ left: 15, right: 15 }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#64748b', fontSize: 12}} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#64748b', fontSize: 12}}
                                        tickFormatter={(value) => {
                                            if (value >= 100000) return '₹' + (value / 100000).toFixed(1).replace('.0', '') + 'L';
                                            if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'K';
                                            return '₹' + value;
                                        }}
                                        padding={{ top: 50, bottom: 0 }}
                                    />
                                    <Tooltip 
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const currentData = payload.find(p => p.dataKey === 'currentYearProfit');
                                                const lastData = payload.find(p => p.dataKey === 'lastYearProfit');
                                                const currentVal = currentData ? currentData.value : 0;
                                                const lastVal = lastData ? lastData.value : 0;
                                                const monthName = payload[0]?.payload?.fullMonth || label;
                                                return (
                                                    <div className="custom-tooltip-box">
                                                        <div className="tooltip-date">{monthName} 2026</div>
                                                        <div className="tooltip-row">
                                                            <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                                                            <span className="tooltip-val blue">{currentVal.toLocaleString()}</span>
                                                        </div>
                                                        <div className="tooltip-row">
                                                            <span className="legend-dot-hollow"></span>
                                                            <span className="tooltip-val gray">{lastVal.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                        cursor={{ stroke: '#eff6ff', strokeWidth: 2, fill: 'transparent' }}
                                    />
                                    
                                    <Area type="monotone" dataKey="currentYearProfit" name="Current year" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCy)" activeDot={{r: 6, strokeWidth: 2, fill: '#3b82f6', stroke: '#fff'}} />
                                    <Area type="monotone" dataKey="lastYearProfit" name="Last year" stroke="#cbd5e1" strokeWidth={2} fillOpacity={1} fill="url(#colorLy)" activeDot={{r: 6, strokeWidth: 2, fill: '#fff', stroke: '#cbd5e1'}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Health Metrics Bottom Row */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="health-metrics-row"
                    >
                        {healthMetrics.map((hm, idx) => (
                            <div key={idx} className="health-metric-card">
                                <div className="hm-left">
                                    <div className="hm-icon" style={{ background: `${hm.color}15`, color: hm.color }}>
                                        {hm.icon}
                                    </div>
                                    <div className="hm-info">
                                        <h4>{hm.title}</h4>
                                        <div className="hm-stats">
                                            <span className="hm-value">{hm.value}</span>
                                            <span className="hm-status" style={{ color: hm.color }}>({hm.status})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hm-right">
                                    {renderPie(hm.percent, hm.color)}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </>
            )}
        </motion.div>
    );
};

export default Reports;
