import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Package, Truck, CheckCircle, DollarSign, Search, Plus, Eye, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import toast from 'react-hot-toast';

const OrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders');
            let extractedOrders = [];
            if (Array.isArray(data)) extractedOrders = data;
            else if (data && Array.isArray(data.orders)) extractedOrders = data.orders;
            else if (data && Array.isArray(data.data)) extractedOrders = data.data;

            // Only sales orders for Order Management
            setOrders(extractedOrders.filter(o => (o.orderType || '').toLowerCase().includes('sales')));
        } catch (err) {
            console.error(err);
            toast.error("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // KPI computations
    const activeOrders = orders.filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status));
    const deliveredOrders = orders.filter(o => ['Delivered', 'Completed'].includes(o.status));
    const orderRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
    const currentMonthRevenue = orderRevenue * 0.8; // mock current month

    const formatCurrency = (val) => {
        if (!val || val === 0) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val.toLocaleString()}`;
    };

    // Filters and Chart Data
    const filters = ['All', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];

    const filteredOrders = orders.filter(o => {
        const status = o.status || 'Confirmed';
        const matchesFilter = activeFilter === 'All' || status === activeFilter;
        const custName = o.customer?.company || o.customer?.name || '';
        const orderNum = o.orderNumber || '';
        const matchesSearch = !searchTerm ||
            custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orderNum.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const statusDistData = [
        { name: 'Confirmed', value: orders.filter(o => o.status === 'Confirmed').length || 1, fill: '#3b82f6' },
        { name: 'Processing', value: orders.filter(o => o.status === 'Processing').length || 1, fill: '#8b5cf6' },
        { name: 'Dispatched', value: orders.filter(o => o.status === 'Dispatched').length || 1, fill: '#0ea5e9' },
        { name: 'Delivered', value: orders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length || 1, fill: '#10b981' },
        { name: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length || 1, fill: '#ef4444' }
    ];

    // Dynamic Chart Data Generation
    const makeBarData = (base) => Array.from({length: 7}, () => ({v: Math.max(1, base + Math.floor(Math.random() * (base * 0.4) - (base * 0.2)))}));
    
    const revBase = (orderRevenue / 1000) || 500;
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const revenueChartData = [
        { name: 'Jan', orderRevenue: Math.round(revBase * 0.6), deliveredRevenue: Math.round(revBase * 0.4) },
        { name: 'Feb', orderRevenue: Math.round(revBase * 0.7), deliveredRevenue: Math.round(revBase * 0.5) },
        { name: 'Mar', orderRevenue: Math.round(revBase * 0.65), deliveredRevenue: Math.round(revBase * 0.45) },
        { name: 'Apr', orderRevenue: Math.round(revBase * 0.8), deliveredRevenue: Math.round(revBase * 0.6) },
        { name: 'May', orderRevenue: Math.round(revBase * 0.9), deliveredRevenue: Math.round(revBase * 0.7) },
        { name: currentMonth, orderRevenue: Math.round(revBase), deliveredRevenue: Math.round(currentMonthRevenue / 1000) }
    ];

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>OM</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Order Management</span>
                            <span className="rd-module-badge" style={{background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe'}}>ORDERS</span>
                        </div>
                        <div className="rd-module-desc">Track customer orders, fulfillment status, deliveries, and operational workflows.</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <OrderKPICard title="Total Orders" val={orders.length} trend="+18%" subtitle="vs last month" color="blue" icon={Package} data={makeBarData(orders.length || 10)} />
                    <OrderKPICard title="Active Orders" val={activeOrders.length} trend="~" subtitle="In pipeline" color="purple" icon={Truck} data={makeBarData(activeOrders.length || 5)} />
                    <OrderKPICard title="Delivered" val={deliveredOrders.length} trend="+25%" subtitle="vs last month" color="green" icon={CheckCircle} data={makeBarData(deliveredOrders.length || 5)} />
                    <OrderKPICard title="Order Revenue" val={formatCurrency(orderRevenue)} trend="+19%" subtitle="vs last month" color="teal" icon={DollarSign} data={makeBarData(revBase)} />
                </div>

                {/* Charts */}
                <div style={{display: 'flex', gap: 24, marginBottom: 24}}>
                    <div className="rd-chart-card" style={{flex: 1}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <div style={{width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <Activity size={16} color="#3b82f6" />
                                </div>
                                <h3 className="rd-chart-title" style={{margin: 0}}>Order Status Distribution</h3>
                            </div>
                            <select style={{padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', background: '#f8fafc', outline: 'none'}}>
                                <option>This Month</option>
                                <option>Last Month</option>
                            </select>
                        </div>
                        <div style={{height: 200}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusDistData} barSize={24}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="value" radius={[4,4,0,0]}>
                                        {statusDistData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rd-chart-card" style={{flex: 1.5}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <div style={{width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <TrendingUp size={16} color="#3b82f6" />
                                </div>
                                <h3 className="rd-chart-title" style={{margin: 0}}>Monthly Order Revenue</h3>
                            </div>
                            <select style={{padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', background: '#f8fafc', outline: 'none'}}>
                                <option>This Year</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                        <div style={{height: 200}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueChartData} barGap={4} barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={v => `${v}K`} />
                                    <Tooltip formatter={(value) => `₹${value}K`} cursor={{fill: 'transparent'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: 12, fontWeight: 600, color: '#475569'}} />
                                    <Bar dataKey="orderRevenue" name="Order Revenue" fill="#3b82f6" radius={[4,4,0,0]} />
                                    <Bar dataKey="deliveredRevenue" name="Delivered Revenue" fill="#10b981" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)'}}>
                        <div>
                            <div className="rd-table-title">Sales Order Register</div>
                            <div className="rd-table-subtitle">All customer orders and delivery tracking</div>
                        </div>
                        <div className="rd-table-actions">
                            <div className="rd-search-bar" style={{width: 220, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search order, customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <div style={{display: 'flex', gap: 6}}>
                                {filters.map(f => (
                                    <button key={f} onClick={() => setActiveFilter(f)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                                            background: activeFilter === f ? '#3b82f6' : '#fff',
                                            color: activeFilter === f ? '#fff' : '#64748b',
                                            borderColor: activeFilter === f ? '#3b82f6' : '#e2e8f0'
                                        }}>{f}</button>
                                ))}
                            </div>
                            <button className="rd-btn-solid" onClick={() => navigate('/orders/create/sales')}>+ New Order</button>
                        </div>
                    </div>

                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>CUSTOMER</th>
                                <th>ITEMS</th>
                                <th>AMOUNT</th>
                                <th>ORDERED</th>
                                <th>DELIVERY</th>
                                <th>PRIORITY</th>
                                <th>STATUS</th>
                                <th>MANAGER</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={10} style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No sales orders found</td></tr>
                            ) : filteredOrders.map((o, i) => {
                                const orderId = o.orderNumber || `SO-${String(i + 1).padStart(4, '0')}`;
                                const status = o.status || 'Confirmed';
                                const statusColors = {
                                    'Confirmed': 'rd-status-blue',
                                    'Processing': 'rd-status-purple',
                                    'Dispatched': 'rd-status-blue',
                                    'Delivered': 'rd-status-green',
                                    'Completed': 'rd-status-green',
                                    'Cancelled': 'rd-status-red'
                                };
                                const priorityColors = {
                                    'High': {color: '#ef4444', bg: '#fef2f2'},
                                    'Critical': {color: '#ef4444', bg: '#fef2f2'},
                                    'Normal': {color: '#64748b', bg: '#f8fafc'},
                                    'Low': {color: '#10b981', bg: '#ecfdf5'}
                                };
                                const pri = o.priority || 'Normal';
                                const priStyle = priorityColors[pri] || priorityColors['Normal'];

                                return (
                                    <tr key={o._id || o.id || i} style={{cursor: 'pointer'}} onClick={() => navigate(`/orders/${o._id || o.id}/tracking`)}>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{orderId}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{o.customer?.company || o.customer?.name || '-'}</td>
                                        <td style={{color: '#475569'}}>{o.items?.length || 1}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>₹{(Number(o.totalAmount) || Number(o.grandTotal) || 0).toLocaleString()}</td>
                                        <td style={{color: '#64748b'}}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : '-'}</td>
                                        <td style={{color: '#64748b'}}>{o.deliveryDate || o.expectedDelivery ? new Date(o.deliveryDate || o.expectedDelivery).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'TBD'}</td>
                                        <td>
                                            <span style={{padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: priStyle.bg, color: priStyle.color}}>
                                                {pri}
                                            </span>
                                        </td>
                                        <td><span className={`rd-status-badge ${statusColors[status] || 'rd-status-gray'}`}>{status}</span></td>
                                        <td style={{color: '#475569'}}>{o.manager || o.salesRep || 'Sales Team'}</td>
                                        <td>
                                            <button className="rd-btn-outline" style={{padding: '5px 12px', fontSize: 12, color: '#3b82f6', borderColor: '#bfdbfe', display: 'flex', alignItems: 'center', gap: 4}}>
                                                <Eye size={14} /> View <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const OrderKPICard = ({ title, val, trend, subtitle, color, icon: Icon, data }) => {
    const gradients = {
        blue: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        purple: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        green: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        teal: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)'
    };
    const iconBgs = { blue: '#dbeafe', purple: '#f3e8ff', green: '#d1fae5', teal: '#ccfbf1' };
    const iconColors = { blue: '#3b82f6', purple: '#a855f7', green: '#10b981', teal: '#14b8a6' };
    const barColors = { blue: '#93c5fd', purple: '#d8b4fe', green: '#6ee7b7', teal: '#99f6e4' };
    const valColors = { blue: '#1d4ed8', purple: '#7e22ce', green: '#059669', teal: '#0f766e' };

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
                        <div style={{fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 6}}>{title}</div>
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
                {trend && trend !== '~' && <span style={{fontSize: 12, fontWeight: 700, color: iconColors[color]}}>↗ {trend}</span>}
                {trend === '~' && <span style={{fontSize: 12, fontWeight: 700, color: iconColors[color]}}>~</span>}
                <span style={{fontSize: 12, color: '#94a3b8'}}>{subtitle}</span>
            </div>
        </div>
    );
};

export default OrderManagement;
