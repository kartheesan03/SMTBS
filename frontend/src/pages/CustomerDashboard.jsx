import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { ShoppingCart, Package, MapPin, Truck, CheckCircle, Plus, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const activeDeliveries = orders.filter(o => o.deliveryStatus === 'Shipped' || o.deliveryStatus === 'Processing' || o.deliveryStatus === 'Out for Delivery').length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;

    return (
        <div className="module-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Customer Dashboard</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
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
                    <div className="dashboard-card-3d" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="kpi-icon-3d" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(56, 189, 248, 0.05))', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Total Orders</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{orders.length}</div>
                        </div>
                    </div>
                    
                    <div className="dashboard-card-3d" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="kpi-icon-3d" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Truck size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Active Deliveries</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{activeDeliveries}</div>
                        </div>
                    </div>

                    <div className="dashboard-card-3d" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                <div className="dashboard-card-3d" style={{ gridColumn: 'span 8', padding: '24px', display: 'flex', flexDirection: 'column' }}>
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
                <div className="dashboard-card-3d" style={{ gridColumn: 'span 12', padding: '24px', marginTop: '8px' }}>
                    <div className="card-header" style={{ marginBottom: '20px', paddingBottom: '0', borderBottom: 'none' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> My Order History</h3>
                    </div>
                    <div className="table-responsive">
                        {orders.length > 0 ? (
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total Amount</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{order.orderNumber}</td>
                                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>${order.totalAmount?.toLocaleString()}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Link to={`/orders/${order._id}/tracking`} className="action-btn-sm" title="Track Order" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-heading)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                                                    <Truck size={14} /> Track
                                                </Link>
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

            <style jsx="true">{`
                .module-container { padding: 30px; color: var(--text-primary); max-width: 1400px; margin: 0 auto; }
                .module-header { margin-bottom: 24px; padding: 24px; border-radius: 16px; }
                .header-top { display: flex; justify-content: space-between; align-items: center; }
                .header-top h1 { margin: 0; font-size: 26px; font-weight: 800; }
                
                .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: var(--text-secondary); }
                .loader { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 24px;
                }

                .bento-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .bento-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .stat-card {
                    grid-column: span 4;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 30px 24px;
                }

                .stat-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .primary-stat .stat-icon { background: rgba(56, 189, 248, 0.1); color: #0ea5e9; }
                .secondary-stat .stat-icon { background: rgba(168, 85, 247, 0.1); color: #9333ea; }
                .success-stat .stat-icon { background: rgba(34, 197, 94, 0.1); color: #16a34a; }

                .stat-content h3 { margin: 0 0 8px 0; font-size: 15px; color: var(--text-secondary); font-weight: 600; }
                .stat-value { font-size: 32px; font-weight: 800; color: var(--text-primary); line-height: 1; }

                .profile-card {
                    grid-column: span 4;
                    grid-row: span 2;
                    display: flex;
                    flex-direction: column;
                }

                .orders-card {
                    grid-column: span 8;
                    grid-row: span 2;
                    display: flex;
                    flex-direction: column;
                }

                    .card-header {
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 1px dashed var(--border-light);
                    }
                    .card-header h3 {
                        margin: 0;
                        font-size: 16px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: var(--text-heading);
                    }

                    .profile-details-grid {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                        flex: 1;
                    }
                    .detail-item {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        background: var(--bg-app);
                        padding: 12px 16px;
                        border-radius: var(--radius-md);
                        border: 1px solid var(--border-light);
                    }
                    .detail-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                    .detail-value { font-size: 15px; font-weight: 600; color: var(--text-heading); word-break: break-word; }

                .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
                .status-badge.pending { background: #fef3c7; color: #d97706; }
                .status-badge.processing { background: #e0e7ff; color: #4338ca; }
                .status-badge.shipped { background: #f3e8ff; color: #7e22ce; }
                .status-badge.delivered { background: #dcfce7; color: #15803d; }
                .status-badge.cancelled { background: #fee2e2; color: #b91c1c; }

                .action-btn-sm {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                    text-decoration: none;
                }
                .action-btn-sm:hover {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                }

                .empty-state {
                    text-align: center;
                    padding: 30px 20px;
                    color: var(--text-secondary);
                }

                .empty-state-large {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    background: var(--bg-body);
                    border-radius: 16px;
                    border: 1px dashed var(--border);
                    margin-top: 10px;
                }
                .empty-icon {
                    width: 80px;
                    height: 80px;
                    background: var(--bg-card);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    margin-bottom: 20px;
                    box-shadow: var(--shadow-sm);
                }
                .empty-state-large h3 { margin: 0 0 10px 0; font-size: 20px; color: var(--text-primary); }
                .empty-state-large p { margin: 0; color: var(--text-secondary); max-width: 400px; }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px color-mix(in srgb, var(--primary) 40%, transparent);
                }
                .btn-secondary {
                    background: var(--bg-body);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-secondary:hover {
                    background: var(--bg-hover);
                    border-color: var(--primary);
                    color: var(--primary);
                }

                @media (max-width: 1024px) {
                    .stat-card { grid-column: span 4; }
                    .profile-card { grid-column: span 12; grid-row: auto; }
                    .orders-card { grid-column: span 12; grid-row: auto; }
                }

                @media (max-width: 768px) {
                    .header-top { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .stat-card { grid-column: span 12; }
                    .bento-grid { gap: 16px; }
                    .data-table { display: block; overflow-x: auto; white-space: nowrap; }
                }
            `}</style>
        </div>
    );
};

export default CustomerDashboard;
