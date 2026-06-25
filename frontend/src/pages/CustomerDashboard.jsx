import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { ShoppingCart, Package, MapPin, Truck, CheckCircle, Plus, FileText, User, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile
                try {
                    const profileRes = await API.get('/customers/profile');
                    setProfile(profileRes.data);
                } catch (err) {
                    console.warn("Profile not found or error:", err);
                    setProfile(null);
                }

                // Fetch orders
                try {
                    const ordersRes = await API.get('/orders/customer');
                    setOrders(ordersRes.data || []);
                } catch (err) {
                    console.warn("Orders not found or error:", err);
                    setOrders([]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p>Loading your dashboard...</p>
        </div>
    );

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
        
        try {
            const res = await API.put(`/orders/${orderId}/cancel`);
            toast.success(res.data.message || "Order cancelled successfully");
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'Cancelled' } : o));
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error(error.response?.data?.message || "Failed to cancel order");
        }
    };

    const activeDeliveries = orders.filter(o => o.deliveryStatus === 'Shipped' || o.deliveryStatus === 'Processing' || o.deliveryStatus === 'Out for Delivery').length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customer Dashboard</h1>
                    <p className="page-subtitle">
                        Welcome back, {profile?.name || 'Valued Customer'}. Here's an overview of your account.
                    </p>
                </div>
                <div>
                    <Link to="/customer/new-order" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <Plus size={18} /> New Order
                    </Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                {/* Stats Section */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="premium-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="kpi-icon-3d" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(56, 189, 248, 0.05))', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Total Orders</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{orders.length}</div>
                        </div>
                    </div>
                    
                    <div className="premium-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="kpi-icon-3d" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Truck size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Active Deliveries</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{activeDeliveries}</div>
                        </div>
                    </div>

                    <div className="premium-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="kpi-icon-3d" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Completed Orders</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{completedOrders}</div>
                        </div>
                    </div>
                </div>

                {/* Profile Profile Section */}
                <div className="premium-card" style={{ gridColumn: 'span 8', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header">
                        <h3><User size={18} /> My Profile Details</h3>
                    </div>
                    {profile ? (
                        <div className="profile-details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Company</span>
                                <span className="detail-value">{profile.company || profile.name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{profile.email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{profile.phone || 'N/A'}</span>
                            </div>
                            <div className="detail-item full-width">
                                <span className="detail-label">Address</span>
                                <span className="detail-value">{profile.address || 'N/A'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>You haven't completed your profile yet.</p>
                            <Link to="/complete-profile" className="btn-secondary" style={{ marginTop: '10px', display: 'inline-block', textDecoration: 'none' }}>Complete Profile</Link>
                        </div>
                    )}
                </div>

                {/* Order History Section */}
                <div className="premium-card" style={{ gridColumn: 'span 12', padding: '24px', marginTop: '8px' }}>
                    <div className="card-header" style={{ marginBottom: '20px', paddingBottom: '0', borderBottom: 'none' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> My Order History</h3>
                    </div>
                    <div className="table-responsive">
                        {orders.length > 0 ? (
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        <th style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.5px' }}>ORDER ID</th>
                                        <th style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.5px' }}>MATERIAL</th>
                                        <th style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.5px' }}>QUANTITY</th>
                                        <th style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.5px' }}>AMOUNT</th>
                                        <th style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.5px' }}>ORDER DATE ↓</th>
                                        <th style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.5px' }}>EXPECTED DELIVERY</th>
                                        <th style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.5px' }}>STATUS</th>
                                        <th style={{ textAlign: 'center', color: '#475569', fontSize: '12px', letterSpacing: '0.5px' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{order.orderNumber}</td>
                                            <td>
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                                                        {item.material?.name || 'Unknown Material'}
                                                    </div>
                                                ))}
                                            </td>
                                            <td>
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                                                        {item.quantity} {item.material?.unit || 'units'}
                                                    </div>
                                                ))}
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#0f172a' }}>${order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge ${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={() => setSelectedOrder(order)} className="action-btn-sm" title="View Details" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-heading)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                        <FileText size={14} /> View
                                                    </button>
                                                    <Link to={`/orders/${order._id}/tracking`} className="action-btn-sm" title="Track Order" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-heading)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                                                        <Truck size={14} /> Track
                                                    </Link>
                                                    {!['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'].includes(order.status) && (
                                                        <button onClick={() => handleCancelOrder(order._id)} className="action-btn-sm" title="Cancel Order" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#fee2e2', color: '#b91c1c', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                            <XCircle size={14} /> Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex-center" style={{ padding: '60px 20px', flexDirection: 'column', color: 'var(--text-muted)' }}>
                                <div className="empty-icon"><ShoppingCart size={48} /></div>
                                <h3>No orders found</h3>
                                <p>You haven't placed any orders yet. Create your first order to get started!</p>
                                <Link to="/customer/new-order" className="btn-primary" style={{ marginTop: '20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <Plus size={18} /> Create First Order
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                    <span className="value">{profile?.name || 'Customer'}</span>
                                </div>
                                <div className="status-info">
                                    <span className="label">Status</span>
                                    <span className={`status-badge ${selectedOrder.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {selectedOrder.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="items-section">
                                <h3>Items Ordered</h3>
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>MATERIAL</th>
                                            <th>SKU</th>
                                            <th>QTY</th>
                                            <th>UNIT PRICE</th>
                                            <th>TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.material?.name || 'Unknown Material'}</td>
                                                <td><span className="sku-badge">{item.material?.sku || `MAT-${String(item.material?._id).slice(-4)}`}</span></td>
                                                <td><strong>{item.quantity}</strong> {item.material?.unit || 'units'}</td>
                                                <td>${item.price?.toLocaleString(undefined, { minimumFractionDigits: 0 })}</td>
                                                <td><strong>${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="grand-total">
                                    <span>Grand Total</span>
                                    <strong>${selectedOrder.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
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
    );
};

export default CustomerDashboard;
