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

import '../components/AdminDashboard/AdminDashboardRedesign.css';
import PageHeader from '../components/PageHeader';
import { StatCard, StatGrid } from '../components/ui/StatCard';
import { formatCurrency } from '../utils/currency';
import NetProfitChart from '../components/NetProfitChart';

const Reports = () => {

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





    const analytics = dashData?.analytics || {
        kpis: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, revenueGrowth: 0 },
        trendData: [],
        healthMetrics: { materialHealth: 0, hrAttendanceRate: 0, orderFulfillment: 0, customerRetention: 0 }
    };

    const totalMaterials = dashData?.stats?.totalMaterials || 0;
    const totalEmployees = dashData?.stats?.totalEmployees || 0;
    const totalCustomers = dashData?.stats?.totalCustomers || 0;

    const kpis = [
        { title: 'Total Revenue', value: formatCurrency(analytics.kpis.totalRevenue, true), trend: Math.abs(analytics.kpis.revenueGrowth), isUp: analytics.kpis.revenueGrowth >= 0, subtitle: 'Sales active', icon: DollarSign, colorTheme: 'mint' },
        { title: 'Net Profit', value: formatCurrency(analytics.kpis.netProfit, true), trend: analytics.kpis.totalRevenue > 0 ? Math.round((analytics.kpis.netProfit / analytics.kpis.totalRevenue) * 100) : 0, isUp: analytics.kpis.netProfit >= 0, subtitle: 'Margin %', icon: TrendingUp, colorTheme: 'blue' },
        { title: 'Total Materials', value: totalMaterials.toLocaleString(), trend: 0, isUp: true, subtitle: 'Stock stable', icon: Package, colorTheme: 'pink' },
        { title: 'Total Employees', value: totalEmployees.toLocaleString(), trend: 0, isUp: true, subtitle: 'Active staff', icon: Users, colorTheme: 'peach' },
        { title: 'Total Customers', value: totalCustomers.toLocaleString(), trend: 0, isUp: true, subtitle: 'Clients', icon: ShoppingCart, colorTheme: 'purple' },
    ];

    const trendData = analytics.trendData || [];
    
    const chartCyData = trendData.map(d => ({ month: d.name, netProfit: d.currentYearProfit }));
    const chartLyData = trendData.map(d => ({ month: d.name, netProfit: d.lastYearProfit }));

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
        autoTable(doc, {
            startY: 40,
            head: [['Metric', 'Value', 'Description']],
            body: kpiData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
        
        // Add Trend Data
        const trendTableData = trendData.map(t => [t.name || '', `Rs. ${t.currentYearProfit}`, `Rs. ${t.lastYearProfit}`]);
        autoTable(doc, {
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
            className="rd-container"
        >
            <div className="rd-content">
                <div className="rd-module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Reports & Analytics</span>
                            <span className="rd-module-badge">ANALYTICS</span>
                        </div>
                    </div>
                    <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
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
                    <StatGrid columns={5}>
                        {kpis.map((kpi, idx) => (
                            <StatCard 
                                key={idx}
                                title={kpi.title}
                                value={kpi.value}
                                colorTheme={kpi.colorTheme}
                                icon={kpi.icon}
                                trendValue={kpi.trend > 0 ? `${kpi.isUp ? '+' : '-'}${kpi.trend}% vs last period` : kpi.subtitle}
                                trendPositive={kpi.isUp}
                            />
                        ))}
                    </StatGrid>

                    {/* Chart Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        style={{ marginBottom: '24px' }}
                    >
                        <NetProfitChart 
                            currentYearData={chartCyData} 
                            lastYearData={chartLyData} 
                        />
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
            </div>
        </motion.div>
    );
};

export default Reports;
