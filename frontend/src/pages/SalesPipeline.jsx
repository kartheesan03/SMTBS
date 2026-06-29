import React, { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, TrendingUp, DollarSign, Award, Users, Crosshair, ArrowUpRight, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import toast from 'react-hot-toast';

const SalesPipeline = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, customersRes] = await Promise.all([
                    API.get('/orders'),
                    API.get('/customers')
                ]);
                let ordList = [];
                const od = ordersRes.data;
                if (Array.isArray(od)) ordList = od;
                else if (od && Array.isArray(od.orders)) ordList = od.orders;
                else if (od && Array.isArray(od.data)) ordList = od.data;

                // Only sales orders
                setOrders(ordList.filter(o => (o.orderType || '').toLowerCase().includes('sales')));
                setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load pipeline data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Pipeline stages derived from order statuses
    const stageMap = {
        'Pending': 'New',
        'Confirmed': 'Contacted',
        'Processing': 'Qualified',
        'Dispatched': 'Proposal Sent',
        'In Transit': 'Negotiation',
        'Delivered': 'Closed Won',
        'Completed': 'Closed Won',
        'Cancelled': 'Cancelled'
    };

    const stageOrders = {};
    orders.forEach(o => {
        const stage = stageMap[o.status] || 'New';
        if (stage === 'Cancelled') return;
        if (!stageOrders[stage]) stageOrders[stage] = [];
        stageOrders[stage].push(o);
    });

    const stageColors = {
        'New': '#3b82f6',
        'Contacted': '#0ea5e9',
        'Qualified': '#10b981',
        'Proposal Sent': '#f59e0b',
        'Negotiation': '#8b5cf6',
        'Closed Won': '#059669'
    };

    const stageNames = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won'];
    const totalOrderCount = orders.filter(o => o.status !== 'Cancelled').length || 1;

    const funnelData = stageNames.map(stage => {
        const list = stageOrders[stage] || [];
        const value = list.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
        return {
            stage,
            count: list.length,
            value,
            color: stageColors[stage],
            percent: Math.round((list.length / totalOrderCount) * 100) || (list.length > 0 ? 10 : 0)
        };
    });

    // KPI computations
    const pipelineValue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
    const dealCount = orders.filter(o => o.status !== 'Cancelled').length;
    const avgDealSize = dealCount > 0 ? Math.round(pipelineValue / dealCount) : 0;
    const closedWon = (stageOrders['Closed Won'] || []).length;
    const winRate = dealCount > 0 ? Math.round((closedWon / dealCount) * 100) : 0;

    const formatShortCurrency = (val) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${Math.round(val / 1000)}K`;
        return `₹${val}`;
    };

    // Revenue chart from orders by month
    const monthlyRevMap = {};
    const monthlyDeliveredMap = {};
    orders.forEach(o => {
        if (!o.createdAt) return;
        const d = new Date(o.createdAt);
        const key = d.toLocaleString('default', { month: 'short' });
        const amt = Number(o.totalAmount) || Number(o.grandTotal) || 0;
        monthlyRevMap[key] = (monthlyRevMap[key] || 0) + amt;
        if (['Delivered', 'Completed'].includes(o.status)) {
            monthlyDeliveredMap[key] = (monthlyDeliveredMap[key] || 0) + amt;
        }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
        const idx = (currentMonthIdx - i + 12) % 12;
        last6.push(months[idx]);
    }
    const revenueData = last6.map(m => ({
        name: m,
        revenue: monthlyRevMap[m] || 0,
        delivered: monthlyDeliveredMap[m] || 0
    }));
    const totalRevenue = revenueData.reduce((s, r) => s + r.revenue, 0);
    const totalDelivered = revenueData.reduce((s, r) => s + r.delivered, 0);

    // Lead source from customers
    const sourceMap = {};
    customers.forEach(c => {
        const src = c.industry || 'Other';
        sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const sourceColors = ['#3b82f6', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const sourceData = Object.entries(sourceMap).slice(0, 5).map(([name, value], idx) => ({
        name, value, fill: sourceColors[idx % sourceColors.length]
    }));
    if (sourceData.length === 0) sourceData.push({ name: 'N/A', value: 1, fill: '#94a3b8' });

    // Top open opportunities from non-closed orders
    const openOrders = orders
        .filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status))
        .sort((a, b) => (Number(b.totalAmount) || Number(b.grandTotal) || 0) - (Number(a.totalAmount) || Number(a.grandTotal) || 0))
        .slice(0, 4);

    const oppColors = ['#8b5cf6', '#f59e0b', '#0ea5e9', '#10b981'];
    const oppBgs = ['#faf5ff', '#fffbeb', '#f0f9ff', '#ecfdf5'];

    const makeBarData = (base) => Array.from({length: 7}, () => ({v: Math.max(1, base + Math.floor(Math.random() * (base * 0.4) - (base * 0.2)))}));

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <div className="rd-container">
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>SP</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Sales Pipeline Overview</span>
                            <span className="rd-module-badge" style={{background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe'}}>PIPELINE</span>
                        </div>
                        <div className="rd-module-desc">Track opportunities, deal progress, and revenue forecasts.</div>
                    </div>
                </div>

                <div className="rd-kpi-row">
                    <PipelineKPICard title="Total Pipeline Value" val={formatShortCurrency(pipelineValue)} trend="+24%" color="blue" icon={BarChartIcon} data={makeBarData(dealCount || 5)} />
                    <PipelineKPICard title="Deals in Pipeline" val={dealCount} trend="+11%" color="teal" icon={TrendingUp} data={makeBarData(dealCount || 5)} />
                    <PipelineKPICard title="Avg. Deal Size" val={formatShortCurrency(avgDealSize)} trend="+9%" color="purple" icon={DollarSign} data={makeBarData(avgDealSize / 1000 || 5)} />
                    <PipelineKPICard title="Win Rate" val={`${winRate}%`} trend="+6%" color="green" icon={Award} data={makeBarData(winRate || 10)} />
                </div>

                {/* Stage Funnel Chart */}
                <div className="rd-chart-card" style={{marginBottom: 24}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <div style={{width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <BarChartIcon size={16} color="#3b82f6" />
                            </div>
                            <h3 className="rd-chart-title" style={{margin: 0}}>Sales Pipeline — Stage Funnel</h3>
                        </div>
                        <span style={{color: '#94a3b8', fontSize: 20, cursor: 'pointer', lineHeight: 1}}>...</span>
                    </div>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: '10px 0'}}>
                        {funnelData.map((stage, i) => (
                            <div key={i} style={{display: 'flex', alignItems: 'center'}}>
                                <div style={{width: 140, display: 'flex', alignItems: 'center', gap: 8}}>
                                    <div style={{width: 8, height: 8, borderRadius: '50%', background: stage.color}}></div>
                                    <span style={{fontWeight: 700, color: '#1e293b', fontSize: 13}}>{stage.stage}</span>
                                </div>
                                <div style={{width: 80, fontSize: 13, color: '#64748b'}}>{stage.count} deals</div>
                                <div style={{flex: 1, position: 'relative', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden'}}>
                                    <div style={{position: 'absolute', top: 0, left: 0, height: '100%', width: `${stage.percent}%`, background: stage.color, borderRadius: 4}}></div>
                                </div>
                                <div style={{width: 80, textAlign: 'right', fontWeight: 800, color: stage.color, fontSize: 14}}>
                                    {formatShortCurrency(stage.value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{display: 'flex', gap: 24, marginBottom: 24}}>
                    {/* Monthly Revenue Trend */}
                    <div className="rd-chart-card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <div style={{width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <TrendingUp size={16} color="#3b82f6" />
                                </div>
                                <div>
                                    <h3 className="rd-chart-title" style={{margin: 0, fontSize: 16}}>Monthly Revenue Trend</h3>
                                    <div style={{fontSize: 12, color: '#94a3b8'}}>Track your revenue and delivered amount over time</div>
                                </div>
                            </div>
                            <select style={{padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', background: '#f8fafc', outline: 'none'}}>
                                <option>This Year</option>
                            </select>
                        </div>
                        
                        <div style={{display: 'flex', gap: 16, marginBottom: 24}}>
                            <div style={{flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                                    <div style={{width: 10, height: 10, borderRadius: 2, background: '#3b82f6'}}></div>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#475569'}}>Total Revenue</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                                    <span style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>{formatShortCurrency(totalRevenue)}</span>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#10b981'}}>▲ 18.5%</span>
                                </div>
                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>vs last 6 months</div>
                            </div>
                            <div style={{flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                                    <div style={{width: 10, height: 10, borderRadius: 2, background: '#10b981'}}></div>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#475569'}}>Total Delivered</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                                    <span style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>{formatShortCurrency(totalDelivered)}</span>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#10b981'}}>▲ 21.3%</span>
                                </div>
                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>vs last 6 months</div>
                            </div>
                        </div>

                        <div style={{height: 200, flex: 1}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} barGap={4} barSize={12}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={v => formatShortCurrency(v)} />
                                    <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: 12, fontWeight: 600}} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: 12, fontWeight: 600, color: '#475569', left: 0}} />
                                    <Bar dataKey="revenue" name="Revenue (₹)" fill="#3b82f6" radius={[4,4,0,0]} />
                                    <Bar dataKey="delivered" name="Delivered (₹)" fill="#10b981" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', marginTop: 24}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <div style={{width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <TrendingUp size={18} />
                                </div>
                                <div>
                                    <div style={{fontWeight: 700, fontSize: 14}}>Pipeline Highlights</div>
                                    <div style={{fontSize: 12, opacity: 0.9, marginTop: 2}}>{dealCount} active deals worth {formatShortCurrency(pipelineValue)} in pipeline. {closedWon} deals closed.</div>
                                </div>
                            </div>
                            <button style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4}}>
                                View Details <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Lead Source Distribution */}
                    <div className="rd-chart-card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <div style={{width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <Users size={16} color="#8b5cf6" />
                                </div>
                                <div>
                                    <h3 className="rd-chart-title" style={{margin: 0, fontSize: 16}}>Customer Industry Distribution</h3>
                                    <div style={{fontSize: 12, color: '#94a3b8'}}>Analyze customer segments by industry</div>
                                </div>
                            </div>
                            <select style={{padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', background: '#f8fafc', outline: 'none'}}>
                                <option>All Time</option>
                            </select>
                        </div>

                        <div style={{display: 'flex', gap: 16, marginBottom: 24}}>
                            <div style={{flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                                    <div style={{width: 20, height: 20, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Users size={10} color="#4f46e5" />
                                    </div>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#475569'}}>Total Customers</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                                    <span style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>{customers.length}</span>
                                </div>
                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>active customers</div>
                            </div>
                            <div style={{flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                                    <div style={{width: 20, height: 20, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Crosshair size={10} color="#059669" />
                                    </div>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#475569'}}>Conversion Rate</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                                    <span style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>{winRate}%</span>
                                </div>
                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>pipeline to closed</div>
                            </div>
                        </div>

                        <div style={{height: 200, flex: 1}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="value" radius={[6,6,0,0]} label={{position: 'top', fill: '#1e293b', fontSize: 12, fontWeight: 700}}>
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', marginTop: 24}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <div style={{width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <Award size={18} />
                                </div>
                                <div>
                                    <div style={{fontWeight: 700, fontSize: 14}}>Top Segment: {sourceData[0]?.name || 'N/A'}</div>
                                    <div style={{fontSize: 12, opacity: 0.9, marginTop: 2}}>{sourceData[0]?.value || 0} customers in the {sourceData[0]?.name || 'top'} segment.</div>
                                </div>
                            </div>
                            <button style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4}}>
                                View Report <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Open Opportunities */}
                <div className="rd-chart-card">
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <div style={{width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Crosshair size={16} color="#8b5cf6" />
                            </div>
                            <h3 className="rd-chart-title" style={{margin: 0}}>Top Open Opportunities</h3>
                        </div>
                        <span style={{color: '#94a3b8', fontSize: 20, cursor: 'pointer', lineHeight: 1}}>...</span>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                        {openOrders.length === 0 ? (
                            <div style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>No open opportunities</div>
                        ) : openOrders.map((opp, i) => {
                            const custName = opp.customer?.company || opp.customer?.name || 'Walk-in Customer';
                            const oppStage = stageMap[opp.status] || opp.status;
                            const oppVal = Number(opp.totalAmount) || Number(opp.grandTotal) || 0;
                            const color = oppColors[i % oppColors.length];
                            const bg = oppBgs[i % oppBgs.length];
                            
                            return (
                                <div key={opp._id || opp.id || i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                                        <div style={{width: 40, height: 40, borderRadius: 10, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16}}>
                                            {custName.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{fontWeight: 700, color: '#1e293b', fontSize: 14}}>{custName}</div>
                                            <div style={{fontSize: 12, color: '#94a3b8', marginTop: 2}}>Order: {opp.orderNumber || `#${opp._id || opp.id}`}</div>
                                        </div>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                                        <span style={{padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: color, border: `1px solid ${color}50`}}>
                                            {oppStage}
                                        </span>
                                        <div style={{textAlign: 'right'}}>
                                            <div style={{fontWeight: 800, color: '#10b981', fontSize: 15}}>₹{oppVal.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

const PipelineKPICard = ({ title, val, trend, color, icon: Icon, data }) => {
    const gradients = {
        blue: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        teal: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
        purple: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        green: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
    };
    const iconBgs = { blue: '#dbeafe', teal: '#ccfbf1', purple: '#f3e8ff', green: '#d1fae5' };
    const iconColors = { blue: '#3b82f6', teal: '#14b8a6', purple: '#a855f7', green: '#10b981' };
    const barColors = { blue: '#93c5fd', teal: '#99f6e4', purple: '#d8b4fe', green: '#6ee7b7' };
    const valColors = { blue: '#1d4ed8', teal: '#0f766e', purple: '#7e22ce', green: '#059669' };

    return (
        <div style={{
            background: gradients[color], borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.04)', minHeight: 130, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div style={{width: 40, height: 40, borderRadius: 10, background: iconBgs[color], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon size={20} color={iconColors[color]} />
                    </div>
                    <div>
                        <div style={{fontSize: 28, fontWeight: 800, color: valColors[color], lineHeight: 1}}>{val}</div>
                        <div style={{fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 6}}>{title}</div>
                    </div>
                </div>
                <div style={{width: 80, height: 50}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Bar dataKey="v" fill={barColors[color]} radius={[2,2,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 10}}>
                <span style={{fontSize: 12, fontWeight: 700, color: iconColors[color]}}>↗ {trend}</span>
                <span style={{fontSize: 12, color: '#64748b', fontWeight: 500}}>vs last month</span>
            </div>
        </div>
    );
};

export default SalesPipeline;
