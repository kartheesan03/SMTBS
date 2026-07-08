import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { DollarSign, TrendingUp, Calendar, ShoppingCart, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

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
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="page-container"
        >
            <div className="page-header" style={{ marginBottom: 0 }}>
                <PageHeader title="Revenue Tracking" badge="FINANCE" subtitle="Detailed financial breakdown and historical trends." />
            </div>

            {/* KPI ROW */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}
            >
                <div className="premium-card" style={{ position: 'relative', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '130px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Revenue</div>
                        <div className="kpi-icon-3d" style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg, #10b98115, #10b98105)`, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DollarSign size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 6px 0', lineHeight: 1 }}>${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Lifetime Sales
                        </div>
                    </div>
                </div>

                <div className="premium-card" style={{ position: 'relative', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '130px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Monthly Revenue</div>
                        <div className="kpi-icon-3d" style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg, #3b82f615, #3b82f605)`, color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Calendar size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 6px 0', lineHeight: 1 }}>${monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: growthDirection === 'down' ? 'var(--danger)' : 'var(--success)' }}>
                            {growthDirection === 'up' ? <ArrowUpRight size={14} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={14} style={{ marginRight: '4px' }}/>}
                            {Math.abs(growthPercent).toFixed(1)}% <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>vs Last Month</span>
                        </div>
                    </div>
                </div>

                <div className="premium-card" style={{ position: 'relative', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '130px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Highest Month</div>
                        <div className="kpi-icon-3d" style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg, #f59e0b15, #f59e0b05)`, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Award size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 6px 0', lineHeight: 1 }}>${highestMonth.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Recorded in {highestMonth.name}
                        </div>
                    </div>
                </div>

                <div className="premium-card" style={{ position: 'relative', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '130px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Orders</div>
                        <div className="kpi-icon-3d" style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg, #8b5cf615, #8b5cf605)`, color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ShoppingCart size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 6px 0', lineHeight: 1 }}>{totalSalesOrders}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Completed Sales
                        </div>
                    </div>
                </div>
            </motion.div>

                {/* Revenue Trend Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="premium-card" style={{ padding: '24px' }}
                >
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} color="var(--success)" /> 6-Month Revenue Trend
                        </h3>
                    </div>
                    
                    {trendData.length > 0 ? (
                        <div className="chart-container" style={{ height: '320px', width: '100%', marginLeft: '-24px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenueBig" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} tickFormatter={formatCurrency} width={60} />
                                    <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '13px' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueBig)" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} label={{ position: 'top', formatter: formatCurrency, fill: 'var(--text-heading)', fontSize: 12, fontWeight: 600, dy: -5 }} animationDuration={1500} isAnimationActive={true} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-center" style={{ height: '320px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No revenue data available</div>
                    )}
                </motion.div>
        </motion.div>
    );
};

export default RevenueDashboard;
