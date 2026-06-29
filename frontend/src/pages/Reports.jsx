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
    ResponsiveContainer, AreaChart, Area, LineChart, Line, 
    XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import './ReportsRedesign.css';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [loading, setLoading] = useState(true);
    
    // Mock Data for the Charts
    const trendData = [
        { name: 'Jan', revenue: 200, expenses: 150, profit: 50 },
        { name: 'Feb', revenue: 240, expenses: 160, profit: 80 },
        { name: 'Mar', revenue: 220, expenses: 170, profit: 50 },
        { name: 'Apr', revenue: 280, expenses: 180, profit: 100 },
        { name: 'May', revenue: 250, expenses: 175, profit: 75 },
        { name: 'Jun', revenue: 300, expenses: 190, profit: 110 },
        { name: 'Jul', revenue: 350, expenses: 200, profit: 150 },
    ];

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    const tabs = ['Overview', 'Material', 'HRMS', 'ERP', 'CRM', 'Financial'];

    const kpis = [
        { title: 'Total Revenue', value: '$375,450', trend: 12.5, isUp: true, subtitle: 'Revenue across all departments', icon: <DollarSign size={20} />, color: 'blue' },
        { title: 'Net Profit', value: '$167,230', trend: 8.2, isUp: true, subtitle: 'Profit after expenses', icon: <TrendingUp size={20} />, color: 'green' },
        { title: 'Total Materials', value: '1,245', trend: 14.1, isUp: true, subtitle: 'Active inventory items', icon: <Package size={20} />, color: 'purple' },
        { title: 'Total Employees', value: '356', trend: 2.4, isUp: false, subtitle: 'Active staff members', icon: <Users size={20} />, color: 'orange' },
        { title: 'Total Customers', value: '1,230', trend: 18.2, isUp: true, subtitle: 'Registered clients', icon: <ShoppingCart size={20} />, color: 'teal' },
    ];

    const healthMetrics = [
        { title: 'Material Health', value: '87%', status: 'Optimized', icon: <Box size={24} />, color: '#8b5cf6', percent: 87 },
        { title: 'HR Attendance', value: '91%', status: 'Excellent', icon: <UserCheck size={24} />, color: '#10b981', percent: 91 },
        { title: 'Order Fulfillment', value: '94%', status: 'On Track', icon: <ShoppingCart size={24} />, color: '#3b82f6', percent: 94 },
        { title: 'Customer Satisfaction', value: '4.6/5', status: 'Very Good', icon: <Heart size={24} />, color: '#ec4899', percent: 92 },
    ];

    const renderPie = (percent, color) => {
        const data = [
            { name: 'Completed', value: percent },
            { name: 'Remaining', value: 100 - percent }
        ];
        return (
            <div className="health-pie-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={25}
                            outerRadius={32}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill={color} />
                            <Cell fill={`${color}22`} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="health-pie-center" style={{ color }}>
                    {percent}%
                </div>
            </div>
        );
    };

    return (
        <div className="analytics-page">
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
                    <button className="btn-export">
                        <FileText size={16} /> Export PDF
                    </button>
                    <button className="btn-export">
                        <FileText size={16} /> Export CSV
                    </button>
                    <button className="btn-refresh">
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
                    <div className="kpi-cards-grid">
                        {kpis.map((kpi, index) => (
                            <div key={index} className={`rd-kpi-card ${kpi.color}`}>
                                <div className="kpi-top">
                                    <div className="kpi-icon-box">
                                        {kpi.icon}
                                    </div>
                                    <div className={`kpi-trend ${kpi.isUp ? 'up' : 'down'}`}>
                                        {kpi.isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                        {kpi.trend}%
                                    </div>
                                </div>
                                <div className="kpi-content">
                                    <h3>{kpi.value}</h3>
                                    <p className="kpi-title">{kpi.title}</p>
                                    <div className="kpi-mini-bar-bg">
                                        <div className="kpi-mini-bar-fill" style={{ width: `${Math.min(100, kpi.trend * 5 + 50)}%` }}></div>
                                    </div>
                                    <p className="kpi-subtitle">{kpi.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart Section */}
                    <div className="rd-chart-card">
                        <div className="rd-chart-header">
                            <div>
                                <h3>Monthly Trend</h3>
                                <p>Revenue, Expenses, and Profit overview</p>
                            </div>
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ background: '#3b82f6' }}></span> Revenue
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ background: '#ef4444' }}></span> Expenses
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ background: '#10b981' }}></span> Profit
                                </div>
                            </div>
                        </div>
                        <div className="rd-chart-body" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}k`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`$${value}k`]}
                                    />
                                    
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRev)" />
                                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Health Metrics Bottom Row */}
                    <div className="health-metrics-row">
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
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
