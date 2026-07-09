import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Package, Truck, CheckCircle, DollarSign, Search, Plus, Eye, ArrowRight, Activity, TrendingUp , ShoppingCart} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { motion } from 'framer-motion';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
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
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthRevenue = deliveredOrders
        .filter(o => new Date(o.createdAt).getMonth() === currentMonth && new Date(o.createdAt).getFullYear() === currentYear)
        .reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);

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
        { name: 'Confirmed', value: orders.filter(o => o.status === 'Confirmed').length || 0, fill: '#3b82f6' },
        { name: 'Processing', value: orders.filter(o => o.status === 'Processing').length || 0, fill: '#8b5cf6' },
        { name: 'Dispatched', value: orders.filter(o => o.status === 'Dispatched').length || 0, fill: '#0ea5e9' },
        { name: 'Delivered', value: orders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length || 0, fill: '#10b981' },
        { name: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length || 0, fill: '#ef4444' }
    ].filter(item => item.value > 0);
    if(statusDistData.length === 0) {
        statusDistData.push({ name: 'No Data', value: 1, fill: '#e2e8f0' });
    }

    // Dynamic Chart Data Generation
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revMap = {};
    const delRevMap = {};
    orders.forEach(o => {
        if(!o.createdAt) return;
        const date = new Date(o.createdAt);
        if(date.getFullYear() !== currentYear) return;
        const month = monthNames[date.getMonth()];
        const amt = (Number(o.totalAmount) || Number(o.grandTotal) || 0) / 1000;
        revMap[month] = (revMap[month] || 0) + amt;
        if(['Delivered', 'Completed'].includes(o.status)) {
            delRevMap[month] = (delRevMap[month] || 0) + amt;
        }
    });

    const revenueChartData = monthNames.slice(0, currentMonth + 1).map(month => ({
        name: month,
        orderRevenue: Math.round(revMap[month] || 0),
        deliveredRevenue: Math.round(delRevMap[month] || 0)
    }));

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container"
        >
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Order Management</span>
                            <span className="rd-module-badge">ORDERS</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <PastelKPIGrid>
                    <PastelKPICard title="Total Orders" value={orders.length} colorTheme="purple" icon={Package} trendValue="+18% vs last month" trendPositive={true} />
                    <PastelKPICard title="Active Orders" value={activeOrders.length} colorTheme="blue" icon={Truck} trendValue="In pipeline" trendPositive={true} />
                    <PastelKPICard title="Delivered" value={deliveredOrders.length} colorTheme="mint" icon={CheckCircle} trendValue="+12% vs last month" trendPositive={true} />
                    <PastelKPICard title="Order Revenue" value={formatCurrency(orderRevenue)} colorTheme="yellow" icon={DollarSign} trendValue="+22% vs last month" trendPositive={true} />
                </PastelKPIGrid>

                {/* Charts */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{display: 'flex', gap: 24, marginBottom: 24}}
                >
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
                </motion.div>

                {/* Table */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="rd-table-card"
                >
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)', flexWrap: 'wrap', gap: 16}}>
                        <div>
                            <div className="rd-table-title">Sales Order Register</div>
                            <div className="rd-table-subtitle">All customer orders and delivery tracking</div>
                        </div>
                        <div className="rd-table-actions" style={{flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 220, flexShrink: 0, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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

                    <div className="rd-table-scroll">
                        <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>ORDER ID</th>
                                    <th>CUSTOMER</th>
                                    <th style={{textAlign: 'right'}}>ITEMS</th>
                                    <th style={{textAlign: 'right'}}>AMOUNT</th>
                                    <th>ORDERED</th>
                                    <th>DELIVERY</th>
                                    <th>PRIORITY</th>
                                    <th>STATUS</th>
                                    <th>MANAGER</th>
                                    <th style={{textAlign: 'center'}}>ACTION</th>
                                </tr>
                            </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={10} style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No sales orders found</td></tr>
                            ) : filteredOrders.map((o, i) => {
                                const orderId = o.orderNumber || '—';
                                const status = o.status || '—';
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
                                        <td style={{fontWeight: 700, color: '#3b82f6', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={orderId} data-label="Order ID">{orderId}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={o.customer?.company || o.customer?.name || '—'} data-label="Customer">{o.customer?.company || o.customer?.name || '—'}</td>
                                        <td style={{color: '#475569', textAlign: 'right'}} data-label="Items">{o.items?.length || '—'}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)', textAlign: 'right'}} data-label="Amount">₹{(Number(o.totalAmount) || Number(o.grandTotal) || 0).toLocaleString()}</td>
                                        <td style={{color: '#64748b'}} data-label="Ordered">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit', year:'2-digit'}) : '—'}</td>
                                        <td style={{color: '#64748b'}} data-label="Delivery">{o.deliveryDate || o.expectedDelivery ? new Date(o.deliveryDate || o.expectedDelivery).toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit', year:'2-digit'}) : '—'}</td>
                                        <td data-label="Priority">
                                            <span style={{padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: priStyle.bg, color: priStyle.color}}>
                                                {pri}
                                            </span>
                                        </td>
                                        <td data-label="Status">
                                            <span className={`ui-badge ${statusColors[status] === 'rd-status-red' ? 'danger' : statusColors[status] === 'rd-status-green' ? 'success' : statusColors[status] === 'rd-status-orange' || statusColors[status] === 'rd-status-purple' ? 'warning' : 'primary'}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td style={{color: '#475569'}} data-label="Manager">{o.manager || o.salesRep || '—'}</td>
                                        <td style={{textAlign: 'center'}} data-label="Action">
                                            <button className="rd-btn-compact outline" style={{padding: '6px', display: 'inline-flex', alignItems: 'center'}} title="View Order">
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const OrderKPICard = ({ title, val, trend, subtitle, color, icon: Icon, data }) => {
    const themeClass = color ? `ent-theme-${color}` : 'ent-theme-primary';

    return (
        <div className={`ent-module-card ${themeClass}`}>
            <div className="ent-card-icon-wrapper">
                {Icon && <Icon size={20} strokeWidth={2.5} />}
            </div>
            <div className="ent-card-title" title={title}>{title}</div>
            <div className="ent-card-value-area">
                <div className="ent-card-value">{val}</div>
                <div className="ent-card-status-badge" style={{ backgroundColor: 'transparent', padding: 0, color: 'var(--ent-text-secondary)', fontWeight: 500 }}>
                    {subtitle || trend || 'Active Tracking'}
                </div>
            </div>
            <div className="ent-card-footer">
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                    Updated Today
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;
