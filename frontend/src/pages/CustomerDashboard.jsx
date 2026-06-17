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
            <header className="module-header glass-card">
                <div className="header-top">
                    <div>
                        <h1>Customer Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Welcome back, {profile?.name || 'Valued Customer'}. Here's an overview of your account.
                        </p>
                    </div>
                    <Link to="/customer/new-order" className="btn-primary flex-center gap-10" style={{ textDecoration: 'none' }}>
                        <Plus size={18} /> New Order
                    </Link>
                </div>
            </header>

            <div className="bento-grid">
                {/* Stats Section */}
                <div className="bento-card stat-card primary-stat">
                    <div className="stat-icon"><Package size={28} /></div>
                    <div className="stat-content">
                        <h3>Total Orders</h3>
                        <div className="stat-value">{orders.length}</div>
                    </div>
                </div>
                
                <div className="bento-card stat-card secondary-stat">
                    <div className="stat-icon"><Truck size={28} /></div>
                    <div className="stat-content">
                        <h3>Active Deliveries</h3>
                        <div className="stat-value">{activeDeliveries}</div>
                    </div>
                </div>

                <div className="bento-card stat-card success-stat">
                    <div className="stat-icon"><CheckCircle size={28} /></div>
                    <div className="stat-content">
                        <h3>Completed Orders</h3>
                        <div className="stat-value">{completedOrders}</div>
                    </div>
                </div>

                {/* Profile Profile Section */}
                <div className="bento-card profile-card">
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
                <div className="bento-card orders-card">
                    <div className="card-header">
                        <h3><FileText size={18} /> My Order History</h3>
                    </div>
                    <div className="table-responsive">
                        {orders.length > 0 ? (
                            <table className="data-table">
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
                                            <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>${order.totalAmount?.toLocaleString()}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Link to={`/orders/${order._id}/tracking`} className="action-btn-sm" title="Track Order">
                                                    <Truck size={14} /> Track
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state-large">
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
                    border-bottom: 1px dashed var(--border);
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--text-primary);
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
                    background: var(--bg-body);
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }
                .detail-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .detail-value { font-size: 15px; font-weight: 600; color: var(--text-primary); word-break: break-word; }

                .data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .data-table th { text-align: left; padding: 16px; border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 600; font-size: 14px; background: var(--bg-body); }
                .data-table th:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
                .data-table th:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
                .data-table td { padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
                .data-table tbody tr:last-child td { border-bottom: none; }
                .data-table tbody tr:hover td { background: var(--bg-hover); }

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
