import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, Clock, CheckCircle, DollarSign, Search, Eye, Truck, FileText, Plus , Briefcase} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const ERP = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders');
            let extractedOrders = [];
            if (Array.isArray(res.data)) {
                extractedOrders = res.data;
            } else if (res.data && Array.isArray(res.data.orders)) {
                extractedOrders = res.data.orders;
            } else if (res.data && Array.isArray(res.data.data)) {
                extractedOrders = res.data.data;
            }
            setOrders(extractedOrders);
        } catch (error) {
            console.error('Failed to fetch ERP orders:', error);
            toast.error("Failed to load orders");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDeleteOrder = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                await API.delete(`/orders/${id}`);
                toast.success("Order deleted successfully");
                fetchOrders();
            } catch (err) {
                toast.error("Error deleting order");
            }
        }
    };

    // Compute KPIs from real data
    const purchaseOrders = orders.filter(o => (o.orderType || '').toLowerCase() === 'purchase');
    const pendingOrders = purchaseOrders.filter(o => ['Pending', 'Awaiting Approval'].includes(o.status));
    const approvedOrders = purchaseOrders.filter(o => ['Approved', 'Processing', 'In Transit', 'Delivered'].includes(o.status));
    const totalPOValue = purchaseOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);

    const filters = ['All', 'Pending', 'Approved', 'In Transit', 'Delivered'];

    const filteredOrders = orders.filter(o => {
        const matchesFilter = activeFilter === 'All' || o.status === activeFilter;
        const matchesSearch = !searchTerm || 
            (o.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.vendor?.name || o.vendor?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.customer?.name || o.customer?.company || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatCurrency = (val) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val.toLocaleString()}`;
    };

    // Mini bar chart data for KPI cards
    const barData = [{v:4},{v:6},{v:3},{v:7},{v:5},{v:8},{v:6}];

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <div className="rd-container">
            
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Procurement Management</span>
                            <span className="rd-module-badge">PROCUREMENT</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <ProcKPICard title="Total POs" val={orders.length} subtitle="vs last month" color="blue" icon={ShoppingCart} data={barData} />
                    <ProcKPICard title="Pending Approval" val={pendingOrders.length} subtitle="Action required" subtitleColor="#ef4444" color="orange" icon={Clock} data={barData} />
                    <ProcKPICard title="Approved" val={approvedOrders.length} subtitle="vs last month" color="green" icon={CheckCircle} data={barData} />
                    <ProcKPICard title="Total PO Value" val={formatCurrency(totalPOValue)} subtitle="vs last month" color="purple" icon={DollarSign} data={barData} isCurrency />
                </div>

                {/* Table */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)', flexWrap: 'wrap', gap: 16}}>
                        <div>
                            <div className="rd-table-title">Purchase Orders</div>
                            <div className="rd-table-subtitle">All procurement requests and approvals</div>
                        </div>
                        <div className="rd-table-actions" style={{flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 220, flexShrink: 0, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search PO, vendor, item..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                            <button className="rd-btn-solid" onClick={() => navigate('/orders/select-type')}>+ Raise PO</button>
                        </div>
                    </div>

                    <div style={{overflowX: 'auto'}}>
                        <table className="rd-table" style={{minWidth: 1000}}>
                            <thead>
                                <tr>
                                    <th>PO ID</th>
                                <th>VENDOR</th>
                                <th>ITEM</th>
                                <th>QTY</th>
                                <th>AMOUNT</th>
                                <th>RAISED</th>
                                <th>DELIVERY</th>
                                <th>PRIORITY</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={10} style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No orders found</td></tr>
                            ) : filteredOrders.map((order, i) => {
                                const vendorName = order.vendor?.companyName || order.vendor?.name || order.customer?.company || order.customer?.name || 'Walk-in';
                                const itemDesc = order.items?.[0] ? `${order.items[0].materialName || order.items[0].name || 'Item'} × ${order.items[0].quantity || 0} ${order.items[0].unit || 'pcs'}` : '-';
                                const qty = order.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0;
                                const amount = Number(order.totalAmount) || Number(order.grandTotal) || 0;
                                const raised = order.orderDate || order.createdAt;
                                const delivery = order.deliveryDate || order.expectedDelivery;
                                const priority = order.priority || 'Normal';
                                const status = order.status || 'Pending';

                                const statusColors = {
                                    'Pending': 'rd-status-orange', 'Awaiting Approval': 'rd-status-orange',
                                    'Approved': 'rd-status-green', 'Processing': 'rd-status-blue',
                                    'In Transit': 'rd-status-blue', 'Dispatched': 'rd-status-blue',
                                    'Delivered': 'rd-status-green', 'Received': 'rd-status-green',
                                    'Cancelled': 'rd-status-red', 'Rejected': 'rd-status-red'
                                };
                                const priorityColors = { 'High': '#ef4444', 'Normal': '#3b82f6', 'Low': '#f59e0b', 'Urgent': '#dc2626' };

                                return (
                                    <tr key={order._id || i}>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{order.orderNumber || `PO-${1200 + i}`}</td>
                                        <td style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{vendorName}</td>
                                        <td style={{color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{itemDesc}</td>
                                        <td style={{color: '#64748b'}}>{qty} pcs</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>₹{amount.toLocaleString()}</td>
                                        <td style={{color: '#64748b'}}>{raised ? new Date(raised).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}</td>
                                        <td style={{color: '#64748b'}}>{delivery ? new Date(delivery).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}</td>
                                        <td><span style={{color: priorityColors[priority] || '#3b82f6', fontWeight: 600}}>{priority}</span></td>
                                        <td><span className={`rd-status-badge ${statusColors[status] || 'rd-status-blue'}`}>{status}</span></td>
                                        <td>
                                            <button className="rd-btn-outline" style={{padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: '#3b82f6', borderColor: '#bfdbfe'}}
                                                onClick={() => navigate(`/orders/${order._id || order.id}/tracking`)}>
                                                <Eye size={14} /> View
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
        </div>
    );
};

const ProcKPICard = ({ title, val, trend, subtitle, subtitleColor, color, icon: Icon, data, isCurrency }) => {
    const gradients = {
        blue: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        orange: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        green: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        purple: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
    };
    const iconBgs = { blue: '#dbeafe', orange: '#ffedd5', green: '#d1fae5', purple: '#f3e8ff' };
    const iconColors = { blue: '#3b82f6', orange: '#f59e0b', green: '#10b981', purple: '#8b5cf6' };
    const barColors = { blue: '#93c5fd', orange: '#fdba74', green: '#6ee7b7', purple: '#c4b5fd' };
    const valColors = { blue: '#1d4ed8', orange: '#ea580c', green: '#059669', purple: '#7c3aed' };
    const trendColors = { blue: '#3b82f6', orange: '#f59e0b', green: '#10b981', purple: '#8b5cf6' };

    return (
        <div style={{
            background: gradients[color], borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.04)', minHeight: 130,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
                {trend && <span style={{fontSize: 12, fontWeight: 700, color: trendColors[color]}}>↗ {trend}</span>}
                <span style={{fontSize: 12, color: subtitleColor || '#94a3b8'}}>{subtitle}</span>
            </div>
        </div>
    );
};

export default ERP;
