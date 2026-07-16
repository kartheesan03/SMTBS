import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
    ShoppingCart, Package, Truck, CheckCircle, Plus, FileText,
    XCircle, Clock, MapPin, Mail, Phone, User, TrendingUp, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import { LoadingState, EmptyState } from '../components/DataStates';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                try {
                    const profileRes = await API.get('/customers/profile');
                    setProfile(profileRes.data);
                } catch (err) {
                    console.warn('Profile not found:', err);
                }
                try {
                    const ordersRes = await API.get('/orders/customer');
                    setOrders(ordersRes.data || []);
                } catch (err) {
                    console.warn('Orders not found:', err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingState message="Loading Customer Dashboard..." height="100vh" />;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await API.put(`/orders/${orderId}/cancel`);
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'Cancelled' } : o));
        } catch (error) {
            console.error('Error cancelling order:', error);
        }
    };

    const activeDeliveries = orders.filter(o => ['Shipped', 'Processing', 'Out for Delivery'].includes(o.deliveryStatus)).length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    const pendingOrders = orders.filter(o => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status)).length;
    const totalSpend = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const formatCurrency = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}K` : `₹${v}`;

    const statusColor = (s) => {
        const m = { 'Delivered': '#10b981', 'Processing': '#3b82f6', 'Pending': '#f59e0b', 'Cancelled': '#ef4444', 'Shipped': '#8b5cf6', 'Rejected': '#ef4444' };
        return m[s] || '#64748b';
    };
    const statusBg = (s) => {
        const m = { 'Delivered': '#d1fae5', 'Processing': '#dbeafe', 'Pending': '#fef3c7', 'Cancelled': '#fee2e2', 'Shipped': '#ede9fe', 'Rejected': '#fee2e2' };
        return m[s] || '#f1f5f9';
    };

    const displayName = profile?.name || profile?.company || user?.name || 'Customer';

    return (
        <div className="rd-container theme-customer" style={{ '--theme-accent': '#ec4899' }}>
            <div className="rd-content">

                {/* ── Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=EC4899&color=fff`}
                                alt="Profile"
                                className="rd-hero-avatar"
                            />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {displayName.split(' ')[0]}
                            </div>
                            <div className="rd-hero-subtitle">
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;·&nbsp; Customer Portal
                            </div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-neutral">
                                    <Package size={14} /> {orders.length} Orders
                                </span>
                                <span className="rd-hero-badge badge-status">
                                    <div className="status-dot-inline"></div> {activeDeliveries} Active Deliveries
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rd-hero-right">
                        <div className="rd-hero-visual">
                            <div className="rd-visual-card">
                                <div className="rd-vc-label">Completed</div>
                                <div className="rd-vc-value">{completedOrders}</div>
                                <div className="rd-vc-chart"></div>
                            </div>
                            <div className="rd-visual-card">
                                <div className="rd-vc-label">Activity</div>
                                <div className="rd-vc-bars">
                                    <div className="rd-vc-bar" style={{ height: '55%' }}></div>
                                    <div className="rd-vc-bar" style={{ height: '80%' }}></div>
                                    <div className="rd-vc-bar" style={{ height: '65%' }}></div>
                                    <div className="rd-vc-bar" style={{ height: '100%' }}></div>
                                    <div className="rd-vc-bar" style={{ height: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="rd-hero-actions-col">
                            <button className="hero-action-btn primary" onClick={() => navigate('/customer/new-order')}>
                                <Plus size={15} /> New Order
                            </button>
                            <button className="hero-action-btn secondary" onClick={() => navigate('/orders')}>
                                <Truck size={15} /> Track Orders
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── KPI Row ── */}
                <PastelKPIGrid columns={4}>
                    <PastelKPICard title="Total Orders" value={orders.length} colorTheme="blue" icon={Package} trendValue="Lifetime orders" trendPositive={true} />
                    <PastelKPICard title="Active Deliveries" value={activeDeliveries} colorTheme="peach" icon={Truck} trendValue="In transit" trendPositive={activeDeliveries === 0} />
                    <PastelKPICard title="Completed Orders" value={completedOrders} colorTheme="mint" icon={CheckCircle} trendValue="Successfully delivered" trendPositive={true} />
                    <PastelKPICard title="Total Spend" value={formatCurrency(totalSpend)} colorTheme="yellow" icon={TrendingUp} trendValue="On delivered orders" trendPositive={true} />
                </PastelKPIGrid>

                {/* ── Main Content ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginTop: 24 }}
                >
                    {/* Order History */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">My Order History</div>
                            <button
                                className="panel-action-btn"
                                onClick={() => navigate('/customer/new-order')}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#ec4899', background: 'rgba(236,72,153,0.07)', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}
                            >
                                <Plus size={12} /> New Order
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            {orders.length === 0 ? (
                                <EmptyState
                                    icon={ShoppingCart}
                                    title="No orders found"
                                    message="You haven't placed any orders yet. Create your first order to get started!"
                                    action={{ label: 'Create First Order', onClick: () => navigate('/customer/new-order') }}
                                />
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            {['ORDER ID', 'DATE', 'AMOUNT', 'STATUS', 'ACTIONS'].map(h => (
                                                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, i) => (
                                            <tr key={order._id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#3b82f6', fontSize: 13 }}>
                                                    {order.orderNumber || `ORD-${String(order._id || '').slice(-5).toUpperCase()}`}
                                                </td>
                                                <td style={{ padding: '10px 12px', fontSize: 13, color: '#64748b' }}>
                                                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB') : 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                                                    ₹{(Number(order.totalAmount) || 0).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                                                        background: statusBg(order.status), color: statusColor(order.status)
                                                    }}>
                                                        {order.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            <FileText size={12} /> View
                                                        </button>
                                                        <Link to={`/orders/${order._id}/tracking`}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}
                                                        >
                                                            <Truck size={12} /> Track
                                                        </Link>
                                                        {!['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'].includes(order.status) && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                <XCircle size={12} /> Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="dashboard-panel">
                            <div className="panel-header">
                                <div className="panel-title">My Profile</div>
                            </div>
                            {profile ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {[
                                        { icon: User, label: 'Name', value: profile.name || profile.company },
                                        { icon: Mail, label: 'Email', value: profile.email },
                                        { icon: Phone, label: 'Phone', value: profile.phone },
                                        { icon: MapPin, label: 'Address', value: profile.address },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Icon size={14} color="#ec4899" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{value || 'N/A'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>Profile not completed yet.</p>
                                    <Link to="/complete-profile" style={{ fontSize: 13, color: '#ec4899', fontWeight: 600, textDecoration: 'none' }}>
                                        Complete Profile →
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="dashboard-panel">
                            <div className="panel-header">
                                <div className="panel-title">Quick Actions</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'Place New Order', icon: Plus, color: '#ec4899', bg: '#fdf2f8', path: '/customer/new-order' },
                                    { label: 'Track My Orders', icon: Truck, color: '#3b82f6', bg: '#eff6ff', path: '/orders' },
                                    { label: 'View Invoices', icon: FileText, color: '#8b5cf6', bg: '#f5f3ff', path: '/my-invoices' },
                                ].map(({ label, icon: Icon, color, bg, path }) => (
                                    <button
                                        key={label}
                                        onClick={() => navigate(path)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid #f1f5f9', background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={15} color={color} />
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
                                        <ExternalLink size={12} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Order Details: {selectedOrder.orderNumber}</h2>
                                <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-top-section">
                                    <div className="customer-info">
                                        <span className="label">Customer</span>
                                        <span className="value">{displayName}</span>
                                    </div>
                                    <div className="status-info">
                                        <span className="label">Status</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: statusBg(selectedOrder.status), color: statusColor(selectedOrder.status) }}>
                                            {selectedOrder.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="items-section">
                                    <h3>Items Ordered</h3>
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>MATERIAL</th><th>QTY</th><th>UNIT PRICE</th><th>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.material?.name || 'Unknown'}</td>
                                                    <td>{item.quantity} {item.material?.unit || 'units'}</td>
                                                    <td>₹{item.price?.toLocaleString()}</td>
                                                    <td><strong>₹{(item.quantity * item.price).toLocaleString()}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="grand-total">
                                        <span>Grand Total</span>
                                        <strong>₹{selectedOrder.totalAmount?.toLocaleString()}</strong>
                                    </div>
                                </div>
                                <div className="modal-bottom-cards">
                                    <div className="info-card">
                                        <span className="label">Order Date</span>
                                        <span className="value">{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                                    </div>
                                    <div className="info-card">
                                        <span className="label">Expected Delivery</span>
                                        <span className="value">{selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                                    </div>
                                    <div className="info-card">
                                        <span className="label">Delivery Status</span>
                                        <span className="value">{selectedOrder.deliveryStatus || 'Not Started'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CustomerDashboard;
