import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, FileText, DollarSign, Search, Bell, Settings, Moon
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import './FarmakuDashboard.css';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await API.get('/dashboard/stats');
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div style={{ padding: '24px' }}>Loading dashboard...</div>;
    if (!dashboardData) return <div style={{ padding: '24px' }}>Failed to load dashboard data.</div>;

    const { 
        stats = {}, 
        charts = { monthlyStats: [], categoryData: [] },
        tables = { recentOrders: [] }
    } = dashboardData;

    const totalCustomers = dashboardData.totalCustomers || 0;
    const totalTransaction = stats.totalSalesOrders || 0; // Or totalOrders
    const totalIncome = dashboardData.totalRevenue || 0;

    // Format for Area Chart (Sales Performance)
    // We want to map monthlyStats to revenue and sales
    const salesPerformanceData = charts.monthlyStats.map(item => ({
        name: item.name,
        Revenue: item.revenue || 0,
    }));

    // Format for Doughnut Chart (Categories or Departments)
    const categoryData = charts.categoryData.length > 0 ? charts.categoryData : [
        { name: 'No Data', value: 1 }
    ];
    const COLORS = ['#1e3a8a', '#3b82f6', '#93c5fd', '#bfdbfe', '#e0e7ff', '#818cf8'];

    // Format for Bar Chart (Revenue Performance or transaction count)
    const revenuePerformanceData = charts.monthlyStats.map(item => ({
        name: item.name,
        Transactions: item.sales || 0
    }));

    const recentOrders = tables.recentOrders || [];

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="farmaku-dashboard">
            {/* Header */}
            <header className="farmaku-header">
                <div className="farmaku-header-left">
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user?.name || 'Admin'}</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '8px', padding: '8px 16px', border: '1px solid #e5e7eb' }}>
                        <Search size={16} color="#9ca3af" />
                        <input 
                            type="text" 
                            placeholder="Search anything" 
                            style={{ border: 'none', outline: 'none', marginLeft: '8px', background: 'transparent' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                         <Bell size={20} color="#4b5563" />
                         <Settings size={20} color="#4b5563" />
                         <Moon size={20} color="#4b5563" />
                    </div>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="farmaku-stats-grid">
                <div className="farmaku-stat-card">
                    <div className="farmaku-stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div className="farmaku-stat-info">
                        <h3>Total Customers</h3>
                        <p className="farmaku-stat-val">{totalCustomers.toLocaleString()}</p>
                    </div>
                </div>
                <div className="farmaku-stat-card">
                    <div className="farmaku-stat-icon purple">
                        <FileText size={24} />
                    </div>
                    <div className="farmaku-stat-info">
                        <h3>Total Transaction</h3>
                        <p className="farmaku-stat-val">{totalTransaction.toLocaleString()}</p>
                    </div>
                </div>
                <div className="farmaku-stat-card">
                    <div className="farmaku-stat-icon green">
                        <DollarSign size={24} />
                    </div>
                    <div className="farmaku-stat-info">
                        <h3>Total Income</h3>
                        <p className="farmaku-stat-val">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>
            </div>

            {/* Charts Area Grid */}
            <div className="farmaku-charts-grid">
                {/* Line Chart */}
                <div className="farmaku-card">
                    <div className="farmaku-card-header">
                        <div>
                            <h2 className="farmaku-card-title">Sales Performance</h2>
                            <p className="farmaku-card-subtitle">See how your sales grow month by month</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <AreaChart data={salesPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `$${val/1000}k`} />
                                <RechartsTooltip 
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Doughnut Chart */}
                <div className="farmaku-card">
                    <div className="farmaku-card-header">
                        <h2 className="farmaku-card-title">Material Categories</h2>
                    </div>
                    <div style={{ width: '100%', height: 200, position: 'relative' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                                {categoryData.reduce((acc, curr) => acc + curr.value, 0)}
                            </div>
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>Total</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                        {categoryData.slice(0, 4).map((entry, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4b5563' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="farmaku-bottom-grid">
                {/* Bar Chart */}
                <div className="farmaku-card">
                    <div className="farmaku-card-header">
                        <div>
                            <h2 className="farmaku-card-title">Monthly Transactions</h2>
                            <p className="farmaku-card-subtitle">Volume of sales over time</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <BarChart data={revenuePerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="Transactions" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table */}
                <div className="farmaku-card">
                    <div className="farmaku-card-header">
                        <div>
                            <h2 className="farmaku-card-title">Top Transactions</h2>
                            <p className="farmaku-card-subtitle">Highlights of the highest transactions made recently</p>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>See All</button>
                    </div>
                    <div className="farmaku-table-wrapper">
                        <table className="farmaku-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Customer/Vendor</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Purchase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.slice(0, 5).map((order) => (
                                    <tr key={order.id || order._id || Math.random()}>
                                        <td><strong>#{String(order.id || order._id || '').substring(0, 8).toUpperCase()}</strong></td>
                                        <td>{order.customer?.name || order.vendor?.name || 'N/A'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`farmaku-pill ${order.orderType === 'sales' ? 'success' : 'info'}`}>
                                                {order.orderType === 'sales' ? 'Sales' : 'Purchase'}
                                            </span>
                                        </td>
                                        <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af' }}>No recent transactions</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
