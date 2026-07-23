import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, Clock, CheckCircle, DollarSign, Search, Eye, Truck, FileText, Plus , Briefcase} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
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
    

    if (loading) return <div className="flex-center" style={{minHeight:'100vh'}}><div className="loader"></div></div>;

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
                            <span className="rd-module-title">Procurement Management</span>
                            <span className="rd-module-badge">PROCUREMENT</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <PastelKPIGrid>
                    <PastelKPICard title="Total POs" value={orders.length} colorTheme="blue" icon={ShoppingCart} trendValue="+12% vs last month" trendPositive={true} />
                    <PastelKPICard title="Pending Approval" value={pendingOrders.length} colorTheme="peach" icon={Clock} trendValue="Action required" trendPositive={false} />
                    <PastelKPICard title="Approved" value={approvedOrders.length} colorTheme="mint" icon={CheckCircle} trendValue="+5% vs last month" trendPositive={true} />
                    <PastelKPICard title="Total PO Value" value={formatCurrency(totalPOValue)} colorTheme="purple" icon={DollarSign} trendValue="+8% vs last month" trendPositive={true} />
                </PastelKPIGrid>

                {/* Table Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rd-table-card"
                >
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)', flexWrap: 'wrap', gap: 16}}>
                        <div>
                            <div className="rd-table-title">Purchase Orders</div>
                            <div className="rd-table-subtitle">All procurement requests and approvals</div>
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
                            <button className="rd-btn-solid" onClick={() => navigate('/orders/select-type')}>+ Raise PO</button>
                        </div>
                    </div>

                    <div className="rd-table-scroll">
                        <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '15%' }}>PO ID</th>
                                    <th style={{ width: '20%' }}>VENDOR</th>
                                    <th style={{ width: '20%' }}>ITEM DESCRIPTION</th>
                                    <th style={{ width: '12%', textAlign: 'right' }}>AMOUNT</th>
                                    <th style={{ width: '10%' }}>RAISED</th>
                                    <th style={{ width: '10%', textAlign: 'center' }}>DELIVERY</th>
                                    <th style={{ width: '8%' }}>STATUS</th>
                                    <th style={{ width: '5%', textAlign: 'center' }}>ACTIONS</th>
                                </tr>
                            </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={8} style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No orders found</td></tr>
                            ) : filteredOrders.map((order, i) => {
                                const vendorName = order.vendor?.companyName || order.vendor?.name || order.vendorName || order.customer?.company || order.customer?.name || order.supplierName || '—';
                                
                                // Better item extraction
                                let itemDesc = '—';
                                if (order.items && order.items.length > 0) {
                                    const firstItem = order.items[0];
                                    const name = firstItem.materialName || firstItem.name || firstItem.productName || (firstItem.material && (firstItem.material.name || firstItem.material.materialName)) || 'Item';
                                    const qty = firstItem.quantity || firstItem.qty || 0;
                                    const unit = firstItem.unit || 'pcs';
                                    itemDesc = `${name} × ${qty} ${unit}`;
                                    if (order.items.length > 1) {
                                        itemDesc += ` (+${order.items.length - 1} more)`;
                                    }
                                } else if (order.description || order.notes) {
                                    itemDesc = (order.description || order.notes).substring(0, 30) + '...';
                                }

                                const amount = Number(order.totalAmount) || Number(order.grandTotal) || Number(order.amount) || 0;
                                const raised = order.orderDate || order.createdAt || order.date;
                                const delivery = order.deliveryDate || order.expectedDeliveryDate || order.expectedDelivery || order.dueDate;
                                const priority = order.priority || 'Normal';
                                const status = order.status || 'Pending';

                                const statusColors = {
                                    'Pending': 'rd-status-orange', 'Awaiting Approval': 'rd-status-orange',
                                    'Approved': 'rd-status-green', 'Processing': 'rd-status-blue',
                                    'In Transit': 'rd-status-blue', 'Dispatched': 'rd-status-blue',
                                    'Delivered': 'rd-status-green', 'Received': 'rd-status-green',
                                    'Cancelled': 'rd-status-red', 'Rejected': 'rd-status-red',
                                    'Employee Verification': 'rd-status-blue',
                                    'Admin/Manager Review': 'rd-status-orange',
                                    'Vendor Processing': 'rd-status-blue',
                                    'Order Fulfillment': 'rd-status-blue'
                                };
                                const isHighPriority = priority === 'High' || priority === 'Urgent';

                                return (
                                    <tr key={order._id || i} style={{ height: '52px' }}>
                                        <td style={{ verticalAlign: 'middle', fontWeight: 700, color: '#3b82f6', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={order.orderNumber || order.poNumber || order.id || '—'} data-label="PO ID">{order.orderNumber || order.poNumber || order.id || '—'}</td>
                                        <td style={{ verticalAlign: 'middle', fontWeight: 600, color: 'var(--rd-text-main)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={vendorName} data-label="Vendor">{vendorName}</td>
                                        <td style={{ verticalAlign: 'middle', color: '#475569', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={itemDesc} data-label="Item Description">{itemDesc}</td>
                                        <td style={{ verticalAlign: 'middle', fontWeight: 700, color: 'var(--rd-text-main)', textAlign: 'right'}} data-label="Amount">₹{amount.toLocaleString()}</td>
                                        <td style={{ verticalAlign: 'middle', color: '#64748b'}} data-label="Raised">{raised ? new Date(raised).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: '2-digit'}) : '—'}</td>
                                        <td style={{ verticalAlign: 'middle', color: '#64748b', textAlign: 'center'}} data-label="Delivery">{delivery ? new Date(delivery).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: '2-digit'}) : '—'}</td>
                                        <td style={{ verticalAlign: 'middle' }} data-label="Status">
                                            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                                <span className={`ui-badge ${statusColors[status] === 'rd-status-red' ? 'danger' : statusColors[status] === 'rd-status-green' ? 'success' : statusColors[status] === 'rd-status-orange' ? 'warning' : 'info'}`}>
                                                    {status}
                                                </span>
                                                {isHighPriority && <span title={`${priority} Priority`} style={{color: '#ef4444', fontSize: '14px'}}>🚩</span>}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'middle', textAlign: 'center'}} data-label="Actions">
                                            <button className="rd-btn-compact outline" style={{padding: '6px'}} title="View Order"
                                                onClick={() => navigate(`/orders/${order._id || order.id}/tracking`)}>
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

const ProcKPICard = ({ title, val, trend, subtitle, subtitleColor, color, icon: Icon, data, isCurrency }) => {
    const themeClass = color ? `ent-theme-${color}` : 'ent-theme-primary';
    return (
        <div className={`ent-module-card ${themeClass}`}>
            <div className="ent-card-icon-wrapper">
                {Icon && <Icon size={20} strokeWidth={2.5} />}
            </div>
            <div className="ent-card-title" title={title}>{title}</div>
            <div className="ent-card-value-area">
                <div className="ent-card-value">{val}</div>
                <div className="ent-card-status-badge" style={{ backgroundColor: 'transparent', padding: 0, color: subtitleColor || 'var(--ent-text-secondary)', fontWeight: 500 }}>
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

export default ERP;
