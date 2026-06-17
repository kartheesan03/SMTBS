import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { DollarSign, TrendingUp, Calendar, ShoppingCart, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const RevenueDashboard = () => {
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRevenueData = async () => {
        try {
            const ordRes = await API.get('/orders').catch(e => ({ data: [] }));
            setOrdersData(ordRes.data || []);
        } catch (error) {
            console.error("Failed to load revenue stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueData();
    }, []);

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const salesOrders = ordersData.filter(o => {
        const t = String(o.orderType || '').toUpperCase();
        return t.includes('SALES');
    });

    const completedOrders = salesOrders.filter(o => ['Delivered', 'Completed'].includes(o.status));
    
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
    const totalSalesOrders = completedOrders.length;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revMap = {};
    completedOrders.forEach(o => {
        const date = new Date(o.orderDate || o.createdAt);
        if (!isNaN(date.getTime())) {
            const month = monthNames[date.getMonth()];
            revMap[month] = (revMap[month] || 0) + (Number(o.totalAmount) || Number(o.grandTotal) || 0);
        }
    });

    const currentMonthIdx = new Date().getMonth();
    const currentMonthName = monthNames[currentMonthIdx];
    const prevMonthName = monthNames[(currentMonthIdx - 1 + 12) % 12];
    
    const monthlyRevenue = revMap[currentMonthName] || 0;
    const prevMonthlyRevenue = revMap[prevMonthName] || 0;
    
    let growthPercent = 0;
    let growthDirection = 'up';
    if (prevMonthlyRevenue > 0) {
        growthPercent = ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100;
        growthDirection = growthPercent >= 0 ? 'up' : 'down';
    } else if (monthlyRevenue > 0) {
        growthPercent = 100;
    }

    const trendData = [];
    for (let i = 5; i >= 0; i--) {
        let m = currentMonthIdx - i;
        if (m < 0) m += 12;
        const mName = monthNames[m];
        trendData.push({
            name: mName,
            revenue: revMap[mName] || 0
        });
    }

    // Find highest month
    let highestMonth = { name: '-', revenue: 0 };
    Object.keys(revMap).forEach(m => {
        if (revMap[m] > highestMonth.revenue) {
            highestMonth = { name: m, revenue: revMap[m] };
        }
    });

    const formatCurrency = (value) => {
        if (value >= 100000) return `$${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
        return `$${value}`;
    };

    return (
        <div className="main-content">
            <div className="dashboard-header" style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Revenue Tracking</h1>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Detailed financial breakdown and historical trends.</p>
            </div>

            <div className="bento-grid">
                {/* KPI Cards */}
                <div className="bento-col-3">
                    <div className="dashboard-card-3d kpi-card-3d" style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `#10b98115`, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <DollarSign size={16} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1 }}>${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Lifetime Sales</div>
                    </div>
                </div>

                <div className="bento-col-3">
                    <div className="dashboard-card-3d kpi-card-3d" style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Revenue</div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `#3b82f615`, color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={16} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1 }}>${monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: growthDirection === 'down' ? '#ef4444' : '#10b981' }}>
                            {growthDirection === 'up' ? <ArrowUpRight size={14} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={14} style={{ marginRight: '4px' }}/>}
                            {Math.abs(growthPercent).toFixed(1)}% vs Last Month
                        </div>
                    </div>
                </div>

                <div className="bento-col-3">
                    <div className="dashboard-card-3d kpi-card-3d" style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Highest Month</div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `#f59e0b15`, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award size={16} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1 }}>${highestMonth.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Recorded in {highestMonth.name}</div>
                    </div>
                </div>

                <div className="bento-col-3">
                    <div className="dashboard-card-3d kpi-card-3d" style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `#8b5cf615`, color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShoppingCart size={16} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1 }}>{totalSalesOrders}</h3>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Completed Sales</div>
                    </div>
                </div>

                {/* Revenue Trend Chart */}
                <div className="bento-col-12">
                    <div className="dashboard-card-3d" style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={18} color="#10b981" /> 6-Month Revenue Trend
                            </h3>
                        </div>
                        
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenueBig" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={formatCurrency} />
                                    <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueBig)" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} label={{ position: 'top', formatter: formatCurrency, fill: '#64748b', fontSize: 11 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-center" style={{ height: '300px', color: '#94a3b8', fontSize: '14px' }}>No revenue data available</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RevenueDashboard;
