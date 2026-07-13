import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Package, Truck, CheckCircle, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

const VendorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/vendors/my-profile');
                setProfile(res.data.vendor);
                setMaterials(res.data.materials);
                setOrders(res.data.orders || []);
            } catch (error) {
                console.error("Error fetching vendor data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="app-loading">Loading...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="page-container"
        >
            <div className="page-header" style={{ marginBottom: 0 }}>
                <PageHeader 
                    title="Vendor Dashboard" 
                    badge="VENDOR" 
                    subtitle={`Welcome back, ${profile?.name || 'Vendor'}`}
                />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}
            >
                <div className="premium-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Materials Supplied</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>{materials.length}</div>
                    </div>
                </div>
                <div className="premium-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>{profile?.status}</div>
                    </div>
                </div>
                <div className="premium-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Active POs</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>{orders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered').length}</div>
                    </div>
                </div>
                <div className="premium-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Truck size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Completed POs</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>{orders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length}</div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div className="premium-card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>My Materials Catalog</h3>
                        <div className="table-responsive">
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        <th>Material Name</th>
                                        <th>Category</th>
                                        <th>Current Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.map(material => (
                                        <tr key={material._id || material.id}>
                                            <td style={{ fontWeight: 600 }}>{material.name}</td>
                                            <td><span className="status-badge-inline in-progress">{material.category}</span></td>
                                            <td style={{ fontWeight: 600 }}>{material.quantity} {material.unit}</td>
                                        </tr>
                                    ))}
                                    {materials.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No materials listed.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="premium-card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>Business Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Contact Person</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginTop: '4px' }}>{profile?.contactPerson || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginTop: '4px' }}>{profile?.email || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Phone</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginTop: '4px' }}>{profile?.phone || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Address</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginTop: '4px' }}>{profile?.address || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>My Purchase Orders</h3>
                    <div className="table-responsive">
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th>Order Number</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id || order._id}>
                                        <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{order.orderNumber}</td>
                                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: 600 }}>${order.grandTotal?.toFixed(2) || '0.00'}</td>
                                        <td>
                                            <span className={`status-badge-inline ${order.status === 'Delivered' ? 'completed' : 'in-progress'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/erp/orders/${order.id || order._id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>View</Link>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No active orders.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default VendorDashboard;
