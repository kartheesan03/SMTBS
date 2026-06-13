import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    ArrowLeft, Package, Truck, CheckCircle, 
    MapPin, Calendar, Clock, Plus, Loader 
} from 'lucide-react';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Form state
    const [status, setStatus] = useState('Order Confirmed');
    const [location, setLocation] = useState('');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const statuses = [
        'Order Created',
        'Order Confirmed',
        'Packed',
        'Shipped',
        'In Transit',
        'Out for Delivery',
        'Delivered'
    ];

    const canUpdateTracking = ['Admin', 'Manager', 'Sales'].includes(user?.role);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/orders');
            const foundOrder = data.find(o => o.id.toString() === orderId || o._id?.toString() === orderId);
            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                setError('Order not found');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUpdate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await API.put(`/orders/${orderId}/tracking`, {
                status,
                location,
                remarks,
                date: new Date().toISOString()
            });
            // Clear form
            setLocation('');
            setRemarks('');
            // Refresh order
            fetchOrderDetails();
        } catch (err) {
            console.error(err);
            alert('Failed to add tracking update');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ color: '#ef4444' }}>{error}</h3>
                <button className="btn-secondary" onClick={() => navigate('/erp')}>Go Back</button>
            </div>
        );
    }

    const timeline = order.trackingTimeline || [];
    const latestStatus = timeline.length > 0 ? timeline[timeline.length - 1].status : order.deliveryStatus || order.status;
    const isDelivered = latestStatus === 'Delivered';

    const getStatusIcon = (st) => {
        if (st.includes('Delivered')) return <CheckCircle size={18} />;
        if (st.includes('Shipped') || st.includes('Transit') || st.includes('Delivery')) return <Truck size={18} />;
        return <Package size={18} />;
    };

    return (
        <div className="tracking-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/erp')}>
                    <ArrowLeft size={18} />
                    <span>Back to Orders</span>
                </button>
            </header>

            <div className="tracking-container">
                {/* Order Summary */}
                <div className="tracking-summary-card">
                    <div className="card-header">
                        <h2>Order Tracking</h2>
                        <span className={`status-badge ${isDelivered ? 'success' : 'processing'}`}>
                            {latestStatus}
                        </span>
                    </div>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">Order ID</span>
                            <span className="value">#{order.orderNumber || order.id}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Customer</span>
                            <span className="value">
                                {order.customerModel === 'Customer' && order.customer ? 
                                    (order.customer.name || order.customer.companyName || 'Unknown Customer') 
                                    : 'Customer'}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Delivery Date</span>
                            <span className="value">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'Pending'}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Amount</span>
                            <span className="value">${(order.totalAmount || order.grandTotal || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="latest-status-banner">
                        <div className="icon-wrap">
                            {getStatusIcon(latestStatus)}
                        </div>
                        <div className="status-text">
                            <h3>{isDelivered ? 'Your order has been delivered' : `Your order is ${latestStatus.toLowerCase()}`}</h3>
                            <p>Last updated: {timeline.length > 0 ? new Date(timeline[timeline.length - 1].date).toLocaleString() : 'Just now'}</p>
                        </div>
                    </div>
                </div>

                <div className="tracking-body">
                    {/* Timeline */}
                    <div className="timeline-section">
                        <h3>Tracking History</h3>
                        {timeline.length === 0 ? (
                            <div className="empty-timeline">
                                <p>No tracking updates available yet.</p>
                            </div>
                        ) : (
                            <div className="timeline">
                                {timeline.slice().reverse().map((update, index) => (
                                    <div className="timeline-item" key={update.id || index}>
                                        <div className="timeline-marker">
                                            <div className={`marker-dot ${index === 0 ? 'active' : ''}`}></div>
                                            {index !== timeline.length - 1 && <div className="marker-line"></div>}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <h4>{update.status}</h4>
                                                <span className="time">
                                                    <Clock size={12} /> {new Date(update.date).toLocaleString()}
                                                </span>
                                            </div>
                                            {update.location && (
                                                <div className="timeline-location">
                                                    <MapPin size={12} /> {update.location}
                                                </div>
                                            )}
                                            {update.remarks && (
                                                <p className="timeline-remarks">{update.remarks}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Update Form (Admin/Manager/Sales only) */}
                    {canUpdateTracking && (
                        <div className="update-section">
                            <h3>Add Tracking Update</h3>
                            <form className="update-form" onSubmit={handleAddUpdate}>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                                        {statuses.map(st => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location / Hub</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Mumbai Sorting Center" 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Remarks</label>
                                    <textarea 
                                        placeholder="e.g. Package arrived at facility" 
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <button type="submit" className="btn-primary-blue w-100 flex-center gap-8" disabled={submitting}>
                                    {submitting ? <Loader size={16} className="spin" /> : <Plus size={16} />} 
                                    Update Status
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <style jsx="true">{`
                .tracking-page {
                    padding: 24px;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .page-header {
                    margin-bottom: 24px;
                }
                .back-btn {
                    display: flex; align-items: center; gap: 8px;
                    background: transparent; border: none; color: #64748b;
                    font-size: 14px; font-weight: 600; cursor: pointer; transition: color 0.2s;
                }
                .back-btn:hover { color: #0f172a; }
                
                .tracking-container {
                    display: flex; flex-direction: column; gap: 24px;
                }
                
                .tracking-summary-card {
                    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
                    padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .card-header {
                    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
                }
                .card-header h2 { margin: 0; font-size: 20px; color: #0f172a; }
                .status-badge {
                    padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
                }
                .status-badge.success { background: #ecfdf5; color: #059669; }
                .status-badge.processing { background: #eff6ff; color: #2563eb; }
                
                .summary-grid {
                    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
                    padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; margin-bottom: 20px;
                }
                .summary-item { display: flex; flex-direction: column; gap: 4px; }
                .summary-item .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
                .summary-item .value { font-size: 14px; color: #0f172a; font-weight: 700; }
                
                .latest-status-banner {
                    display: flex; align-items: center; gap: 16px;
                    background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #f1f5f9;
                }
                .icon-wrap {
                    width: 40px; height: 40px; border-radius: 50%; background: #e0e7ff; color: #4f46e5;
                    display: flex; align-items: center; justify-content: center;
                }
                .status-text h3 { margin: 0 0 4px 0; font-size: 16px; color: #0f172a; }
                .status-text p { margin: 0; font-size: 13px; color: #64748b; }
                
                .tracking-body {
                    display: grid; grid-template-columns: 2fr 1fr; gap: 24px;
                }
                
                .timeline-section, .update-section {
                    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
                    padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .timeline-section h3, .update-section h3 { margin: 0 0 20px 0; font-size: 16px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
                
                .timeline {
                    display: flex; flex-direction: column;
                }
                .timeline-item {
                    display: flex; gap: 16px; min-height: 80px;
                }
                .timeline-marker {
                    display: flex; flex-direction: column; align-items: center; width: 16px;
                }
                .marker-dot {
                    width: 12px; height: 12px; border-radius: 50%; background: #cbd5e1; z-index: 2;
                }
                .marker-dot.active {
                    background: #4f46e5; border: 3px solid #e0e7ff; width: 16px; height: 16px;
                }
                .marker-line {
                    width: 2px; flex: 1; background: #e2e8f0; margin-top: 4px; margin-bottom: 4px;
                }
                .timeline-content {
                    flex: 1; padding-bottom: 24px;
                }
                .timeline-header {
                    display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;
                }
                .timeline-header h4 { margin: 0; font-size: 15px; color: #0f172a; }
                .time { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #64748b; }
                .timeline-location {
                    display: flex; align-items: center; gap: 4px; font-size: 13px; color: #475569; margin-bottom: 6px;
                }
                .timeline-remarks { margin: 0; font-size: 13px; color: #64748b; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #f1f5f9; }
                
                .update-form { display: flex; flex-direction: column; gap: 16px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 13px; font-weight: 600; color: #334155; }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; }
                
                @media (max-width: 768px) {
                    .tracking-body { grid-template-columns: 1fr; }
                    .summary-grid { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>
        </div>
    );
};

export default OrderTracking;
