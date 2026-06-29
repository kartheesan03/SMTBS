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
    const [dashData, setDashData] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [dashRes, ordersRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(() => ({ data: {} })),
                    API.get('/orders').catch(() => ({ data: [] }))
                ]);
                setDashData(dashRes.data || {});
                let ordList = [];
                const od = ordersRes.data;
                if (Array.isArray(od)) ordList = od;
                else if (od && Array.isArray(od.orders)) ordList = od.orders;
                else if (od && Array.isArray(od.data)) ordList = od.data;
                setOrders(ordList);
            } catch (err) {
                console.error('Failed to load reports data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const tabs = ['Overview', 'Material', 'HRMS', 'ERP', 'CRM', 'Financial'];

    // --- Compute real KPIs ---
    const salesOrders = orders.filter(o => (o.orderType || '').toLowerCase().includes('sales'));
    const completedSales = salesOrders.filter(o => ['Delivered', 'Completed'].includes(o.status));
    const totalRevenue = completedSales.reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);

    const purchaseOrders = orders.filter(o => (o.orderType || '').toLowerCase().includes('purchase'));
    const totalExpenses = purchaseOrders.reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    const totalMaterials = dashData?.totalMaterials ?? dashData?.stats?.totalMaterials ?? 0;
    const totalEmployees = dashData?.totalEmployees ?? dashData?.stats?.totalEmployees ?? 0;
    const totalCustomers = dashData?.totalCustomers ?? dashData?.stats?.totalCustomers ?? 0;

    const formatCurrency = (val) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val.toLocaleString()}`;
    };

    // Compute month-over-month growth
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const getMonthRevenue = (monthIdx) => {
        return completedSales
            .filter(o => { const d = new Date(o.orderDate || o.createdAt); return !isNaN(d) && d.getMonth() === monthIdx; })
            .reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
    };
    const thisMonthRev = getMonthRevenue(currentMonth);
    const lastMonthRev = getMonthRevenue((currentMonth - 1 + 12) % 12);
    const revenueGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : (thisMonthRev > 0 ? 100 : 0);

    const kpis = [
        { title: 'Total Revenue', value: formatCurrency(totalRevenue), trend: Math.abs(revenueGrowth), isUp: revenueGrowth >= 0, subtitle: 'Completed sales orders', icon: <DollarSign size={20} />, color: 'blue' },
        { title: 'Net Profit', value: formatCurrency(netProfit), trend: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0, isUp: netProfit >= 0, subtitle: 'Revenue minus purchases', icon: <TrendingUp size={20} />, color: 'green' },
        { title: 'Total Materials', value: totalMaterials.toLocaleString(), trend: 0, isUp: true, subtitle: 'Active inventory items', icon: <Package size={20} />, color: 'purple' },
        { title: 'Total Employees', value: totalEmployees.toLocaleString(), trend: 0, isUp: true, subtitle: 'Active staff members', icon: <Users size={20} />, color: 'orange' },
        { title: 'Total Customers', value: totalCustomers.toLocaleString(), trend: 0, isUp: true, subtitle: 'Registered clients', icon: <ShoppingCart size={20} />, color: 'teal' },
    ];

    // --- Compute real trend chart from monthly order data ---
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
        let mIdx = currentMonth - i;
        if (mIdx < 0) mIdx += 12;
        const mName = monthNames[mIdx];

        const monthSales = completedSales.filter(o => {
            const d = new Date(o.orderDate || o.createdAt);
            return !isNaN(d) && d.getMonth() === mIdx;
        });
        const monthPurchases = purchaseOrders.filter(o => {
            const d = new Date(o.orderDate || o.createdAt);
            return !isNaN(d) && d.getMonth() === mIdx;
        });

        const rev = monthSales.reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
        const exp = monthPurchases.reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);

        trendData.push({
            name: mName,
            revenue: Math.round(rev / 1000),
            expenses: Math.round(exp / 1000),
            profit: Math.round((rev - exp) / 1000)
        });
    }

    // --- Compute real health metrics ---
    const lowStockCount = dashData?.lowStockItems ?? dashData?.materialStats?.lowStockCount ?? 0;
    const materialHealth = totalMaterials > 0 ? Math.round(((totalMaterials - lowStockCount) / totalMaterials) * 100) : 0;

    const hrAttendanceRate = dashData?.hrStats?.presentToday != null && totalEmployees > 0
        ? Math.round((dashData.hrStats.presentToday / totalEmployees) * 100)
        : (dashData?.hrStats?.attendanceRate ? parseInt(dashData.hrStats.attendanceRate) : 0);

    const totalOrderCount = orders.length;
    const fulfilledOrders = orders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length;
    const orderFulfillment = totalOrderCount > 0 ? Math.round((fulfilledOrders / totalOrderCount) * 100) : 0;

    const activeCustomers = dashData?.activeCustomers ?? 0;
    const customerSatisfaction = totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0;

    const healthMetrics = [
        { title: 'Material Health', value: `${materialHealth}%`, status: materialHealth >= 90 ? 'Excellent' : materialHealth >= 75 ? 'Optimized' : 'Needs Attention', icon: <Box size={24} />, color: '#8b5cf6', percent: materialHealth },
        { title: 'HR Attendance', value: `${hrAttendanceRate}%`, status: hrAttendanceRate >= 90 ? 'Excellent' : hrAttendanceRate >= 75 ? 'Good' : 'Low', icon: <UserCheck size={24} />, color: '#10b981', percent: hrAttendanceRate },
        { title: 'Order Fulfillment', value: `${orderFulfillment}%`, status: orderFulfillment >= 90 ? 'On Track' : orderFulfillment >= 70 ? 'Good' : 'Behind', icon: <ShoppingCart size={24} />, color: '#3b82f6', percent: orderFulfillment },
        { title: 'Customer Retention', value: `${customerSatisfaction}%`, status: customerSatisfaction >= 90 ? 'Excellent' : customerSatisfaction >= 70 ? 'Good' : 'Needs Work', icon: <Heart size={24} />, color: '#ec4899', percent: customerSatisfaction },
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
                    <div className="kpi-cards-grid">
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
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value}k`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`₹${value}k`]}
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
