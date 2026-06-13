import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { ShoppingCart, Package, MapPin, Truck, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await API.get('/customers/my-profile');
                setProfile(profileRes.data);
                const ordersRes = await API.get('/orders/my-orders');
                setOrders(ordersRes.data);
            } catch (error) {
                console.error("Error fetching customer data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="app-loading">Loading...</div>;

    return (
        <div className="dashboard-container p-30">
            <div className="header-box" style={{ marginBottom: '20px' }}>
                <div className="icon-wrapper"><ShoppingCart size={28} /></div>
                <h2>Customer Dashboard</h2>
                <p>Welcome back, {profile?.name}</p>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon" style={{background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8'}}>
                        <Package size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Total Orders</h3>
                        <p className="metric-value">{orders.length}</p>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon" style={{background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'}}>
                        <Truck size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Active Deliveries</h3>
                        <p className="metric-value">{orders.filter(o => o.deliveryStatus === 'Shipped').length}</p>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon" style={{background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e'}}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Completed</h3>
                        <p className="metric-value">{orders.filter(o => o.status === 'Delivered').length}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '30px' }}>
                <div className="dashboard-card" style={{ gridColumn: 'span 8' }}>
                    <div className="card-header">
                        <h3>My Order History</h3>
                        <Link to="/orders/create-order" className="action-btn">New Order</Link>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td>{order.orderNumber}</td>
                                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td><span className={`status-badge ${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span></td>
                                        <td>${order.totalAmount?.toLocaleString()}</td>
                                        <td>
                                            <Link to={`/orders/${order._id}/tracking`} className="btn-icon"><Truck size={18} /></Link>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>No orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <h3>My Profile Details</h3>
                    </div>
                    <div className="profile-details" style={{ padding: '20px' }}>
                        <p><strong>Company:</strong> {profile?.company}</p>
                        <p><strong>Email:</strong> {profile?.email}</p>
                        <p><strong>Phone:</strong> {profile?.phone}</p>
                        <p><strong>Address:</strong> {profile?.address}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
