import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    ArrowLeft, CheckCircle, Package, Truck, Loader, FileText, Activity, AlertCircle, Clock, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';
import './OrderTracking.css';

const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const formatDateOnly = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [order, setOrder] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Action panel states
    const [employeeId, setEmployeeId] = useState('');
    const [stockStatus, setStockStatus] = useState('In Stock');
    const [deliveryType, setDeliveryType] = useState('Delivery');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const userRole = user?.role || 'Guest';



    useEffect(() => {
        fetchData();
    }, [orderId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/orders');
            const foundOrder = data.find(o => o.id?.toString() === orderId || o._id?.toString() === orderId);
            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                setError('Order not found');
            }
            
            // Try fetching audit logs if accessible
            try {
                const auditRes = await API.get('/audit-logs?module=Order');
                if (auditRes.data && Array.isArray(auditRes.data)) {
                    const filteredLogs = auditRes.data.filter(log => log.targetId?.toString() === orderId);
                    setAuditLogs(filteredLogs);
                }
            } catch (auditErr) {
                console.log("Could not fetch audit logs (possibly restricted role): ", auditErr);
            }
            
            // Try fetching employees for assignment dropdown
            try {
                const empRes = await API.get('/auth/users');
                if (empRes.data) {
                    setEmployees(empRes.data.filter(u => u.role !== 'Customer' && u.role !== 'Guest'));
                }
            } catch (empErr) {
                console.log("Could not fetch employees: ", empErr);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType, newStatus, customRemarks, customStock, customDelivery) => {
        try {
            setSubmitting(true);
            const payload = {
                action: actionType,
                nextStatus: newStatus,
                remarks: customRemarks || remarks || `Action ${actionType} triggered`,
                stockStatus: customStock || stockStatus,
                deliveryType: customDelivery || deliveryType,
                date: new Date().toISOString()
            };

            await API.put(`/orders/${orderId}/advance`, payload);
            
            setRemarks('');
            toast.success(`Order successfully updated to ${newStatus}`);
            fetchData();
        } catch (err) {
            console.error('Update Error:', err);
            toast.error(`Failed to update order: ${err.response?.data?.message || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ color: '#ef4444' }}>{error}</h3>
                <button className="btn-secondary" onClick={() => navigate('/erp')}>Go Back</button>
            </div>
        );
    }

    let currentStatus = order.status || 'Order Created';

    const hasIssue = currentStatus === 'Low Stock' || currentStatus === 'Out Of Stock' || (order.trackingTimeline && order.trackingTimeline.some(t => ['Low Stock', 'Out Of Stock'].includes(t.status)));
    const isPurchase = order.orderType === 'purchase' || hasIssue || (order.trackingTimeline && order.trackingTimeline.some(t => ['Purchase Request', 'Vendor Supply', 'Vendor Accepted', 'Inventory Updated'].includes(t.status)));

    const workflow = order.workflow || [];
    const activeIndex = workflow.findIndex(s => s.status === 'In Progress');
    const isCancelled = order.status === 'Cancelled' || order.status === 'Rejected' || workflow.some(s => s.status === 'Rejected');
    
    // Fallback if somehow no active stage
    const currentStageObj = activeIndex !== -1 ? workflow[activeIndex] : (workflow.length > 0 ? workflow[workflow.length-1] : null);
    const currentStageName = currentStageObj ? currentStageObj.stage : 'Unknown';

    const roleMap = {
        'Order Created': 'Customer/Vendor/Admin',
        'Admin/Manager Review': 'Admin/Manager',
        'Employee Verification': 'Employee',
        'Inventory Verified': 'Employee',
        'Purchase Required': 'Vendor',
        'Sales Processing': 'Sales',
        'Out for Delivery': 'Sales',
        'Delivered': 'Sales/Admin',
        'Invoice Generated': 'System',
        'Workflow Completed': 'System'
    };

const RoleActionPanel = ({ currentStage, loggedInRole, currentStatus, onAction, isCancelled, submitting }) => {
    const [remarks, setRemarks] = useState('');
    const [stockStatus, setStockStatus] = useState('In Stock');
    const [deliveryType, setDeliveryType] = useState('Delivery');

    const handleActionClick = (actionType, nextStatus) => {
        onAction(actionType, nextStatus, remarks, stockStatus, deliveryType);
        setRemarks('');
    };

    const roleMap = {
        'Order Created': 'Customer/Vendor/Admin',
        'Admin/Manager Review': 'Admin/Manager',
        'Employee Verification': 'Employee',
        'Inventory Verified': 'Employee',
        'Purchase Required': 'Vendor',
        'Sales Processing': 'Sales',
        'Out for Delivery': 'Sales',
        'Delivered': 'Sales/Admin',
        'Invoice Generated': 'System',
        'Workflow Completed': 'System'
    };

    const currentActiveRole = roleMap[currentStage] || 'System';

    const renderEmptyPanel = () => (
        <div className="empty-panel" style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #94a3b8', padding: '16px', borderRadius: '4px' }}>
            <p style={{ color: '#475569', margin: 0, fontWeight: 500 }}>
                <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                Order is currently with <strong>{currentActiveRole}</strong> for <strong>{currentStage}</strong>. No action needed from you.
            </p>
        </div>
    );

    if (isCancelled || currentStatus === 'Delivered') {
        return (
            <div className="empty-panel" style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}>No further actions can be taken on this order. Workflow is concluded.</p>
            </div>
        );
    }

    if (loggedInRole === 'Manager' || loggedInRole === 'Admin') {
        if (['Created', 'Pending Approval', 'Draft'].includes(currentStatus) || currentStatus === 'Manager/Admin Review' || currentStatus === 'Order Created' || currentStage === 'Admin/Manager Review') {
                return (
                    <div className="action-form">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input type="text" placeholder="Enter remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                        <div className="button-group">
                            <button className="erp-btn btn-success" disabled={submitting} onClick={() => handleActionClick('APPROVE', 'Employee Verification')}>
                                {submitting ? 'Processing...' : 'Approve Order'}
                            </button>
                            <button className="erp-btn btn-warning" disabled={submitting} onClick={() => handleActionClick('MODIFY', 'Draft')}>
                                Request Modification
                            </button>
                            <button className="erp-btn btn-danger" disabled={submitting} onClick={() => handleActionClick('REJECT', 'Rejected')}>
                                Reject Order
                            </button>
                        </div>
                    </div>
                );
            }
            if (['Low Stock', 'Out of Stock', 'Waiting for Manager'].includes(currentStatus)) {
                return (
                    <div className="action-form">
                        <div className="form-group">
                            <label>Remarks (Resolution Details)</label>
                            <input type="text" placeholder="Enter how issue was resolved..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                        <div className="button-group">
                            <button className="erp-btn btn-primary" disabled={submitting} onClick={() => handleActionClick('RESOLVE_ISSUE', 'Inventory Updated')}>
                                {submitting ? 'Processing...' : 'Mark Issue Resolved'}
                            </button>
                        </div>
                    </div>
                );
            }
            return renderEmptyPanel();
        }

        if (loggedInRole === 'Employee') {
            if (['Employee Verification', 'Inventory Updated', 'Approved', 'Manager Approved', 'Awaiting Stock Check'].includes(currentStatus) || currentStage === 'Employee Verification') {
                return (
                    <div className="action-form">
                        <div className="form-group">
                            <label>Stock Status</label>
                            <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Remarks</label>
                            <input type="text" placeholder="Enter remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                        <div className="button-group">
                            {stockStatus === 'In Stock' ? (
                                <button className="erp-btn btn-primary" disabled={submitting} onClick={() => handleActionClick('CONFIRM_STOCK', 'Inventory Verified')}>
                                    {submitting ? 'Processing...' : 'Approve'}
                                </button>
                            ) : stockStatus === 'Low Stock' ? (
                                <button className="erp-btn btn-warning" disabled={submitting} onClick={() => handleActionClick('REPORT_STOCK', stockStatus)}>
                                    {submitting ? 'Processing...' : 'Send Low Stock Alert'}
                                </button>
                            ) : (
                                <button className="erp-btn btn-danger" disabled={submitting} onClick={() => handleActionClick('REPORT_STOCK', stockStatus)}>
                                    {submitting ? 'Processing...' : 'Send Out of Stock Alert'}
                                </button>
                            )}
                        </div>
                    </div>
                );
            }
            return renderEmptyPanel();
        }

        if (loggedInRole === 'Sales') {
            if (['Inventory Verified', 'Sales Processing', 'Ready for Delivery'].includes(currentStatus) || currentStage === 'Sales Processing') {
                return (
                    <div className="action-form">
                        <div className="form-group">
                            <label>Delivery Type</label>
                            <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                                <option value="Delivery">Delivery</option>
                                <option value="Customer Pickup">Customer Pickup</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Remarks</label>
                            <input type="text" placeholder="Enter remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                        <div className="button-group">
                            <button className="erp-btn btn-primary" disabled={submitting} onClick={() => handleActionClick('PACK', 'Packing')}>
                                {submitting ? 'Processing...' : 'Prepare Delivery'}
                            </button>
                        </div>
                    </div>
                );
            }
            if (currentStatus === 'Packing') {
                return (
                    <div className="action-form">
                        <div className="button-group">
                            <button className="erp-btn btn-primary" disabled={submitting} onClick={() => handleActionClick('START_DELIVERY', 'Out for Delivery')}>
                                {submitting ? 'Processing...' : 'Out For Delivery'}
                            </button>
                        </div>
                    </div>
                );
            }
            if (currentStatus === 'Out for Delivery' || currentStage === 'Out for Delivery') {
                return (
                    <div className="action-form">
                        <div className="button-group">
                            <button className="erp-btn btn-success" disabled={submitting} onClick={() => handleActionClick('DELIVER', 'Delivered')}>
                                {submitting ? 'Processing...' : 'Mark as Delivered'}
                            </button>
                        </div>
                    </div>
                );
            }
            if (currentStatus === 'Delivered') {
                return (
                    <div className="action-form">
                        <div className="button-group">
                            <button className="erp-btn btn-outline" disabled={submitting} onClick={() => handleActionClick('GENERATE_INVOICE', 'Invoice Generated')}>
                                {submitting ? 'Processing...' : 'Generate Final Invoice'}
                            </button>
                        </div>
                    </div>
                );
            }
            return renderEmptyPanel();
        }

        if (loggedInRole === 'Vendor' || loggedInRole === 'Vendor User') {
            if (['Purchase Required', 'Manager/Admin Review'].includes(currentStatus) || currentStatus === 'Approved' || currentStage === 'Purchase Required') {
                return (
                    <div className="action-form">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input type="text" placeholder="Enter remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                        <div className="button-group">
                            <button className="erp-btn btn-success" disabled={submitting} onClick={() => handleActionClick('ACCEPT', 'Vendor Accepted')}>
                                {submitting ? 'Processing...' : 'Accept Purchase'}
                            </button>
                            <button className="erp-btn btn-danger" disabled={submitting} onClick={() => handleActionClick('REJECT', 'Vendor Rejected')}>
                                Reject Purchase
                            </button>
                        </div>
                    </div>
                );
            }
            if (currentStatus === 'Vendor Accepted') {
                return (
                    <div className="action-form">
                        <div className="button-group">
                            <button className="erp-btn btn-primary" disabled={submitting} onClick={() => handleActionClick('DISPATCH', 'Material Received')}>
                                {submitting ? 'Processing...' : 'Dispatch Materials'}
                            </button>
                        </div>
                    </div>
                );
            }
            return renderEmptyPanel();
        }

        return renderEmptyPanel();
    };

    const timeline = order.trackingTimeline || [];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="erp-tracking-page"
        >
            <header className="page-header" style={{ marginBottom: 24 }}>
                <PageHeader title="Order Workflow" badge="ERP" subtitle="Manage and track the complete order lifecycle" />
                <button className="erp-btn btn-outline" onClick={() => navigate('/erp')} style={{ marginTop: 12, width: 'fit-content' }}>
                    <ArrowLeft size={16} />
                    <span>Back to Orders</span>
                </button>
            </header>

            <div className="erp-layout">
                {/* SECTION 1: ORDER SUMMARY */}
                <section className="erp-card summary-section">
                    <div className="card-header">
                        <div className="header-title">
                            <FileText size={18} />
                            <h3>Order Summary</h3>
                        </div>
                        <span className={`status-badge ${isCancelled ? 'danger' : (currentStatus === 'Delivered' ? 'success' : 'processing')}`}>
                            {currentStatus}
                        </span>
                    </div>
                    <div className="summary-grid">
                        <div className="grid-item">
                            <span className="label">Order Number</span>
                            <span className="value">#{order.orderNumber || order.id}</span>
                        </div>
                        <div className="grid-item">
                            <span className="label">Customer / Organization</span>
                            <span className="value">{order.customer?.company || order.customer?.name || order.vendor?.company || order.vendor?.name || 'Unknown'}</span>
                        </div>
                        <div className="grid-item">
                            <span className="label">Order Amount</span>
                            <span className="value">₹{(order.totalAmount || order.grandTotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="grid-item">
                            <span className="label">Approval Status</span>
                            <span className="value">{order.approvalStatus || 'Pending'}</span>
                        </div>
                        <div className="grid-item">
                            <span className="label">Assigned Employee</span>
                            <span className="value">{order.employeeId ? `#${order.employeeId}` : 'Unassigned'}</span>
                        </div>
                        <div className="grid-item">
                            <span className="label">Delivery Type</span>
                            <span className="value">{order.orderType === 'sales' ? 'Sales Delivery' : 'Standard'}</span>
                        </div>
                        <div className="grid-item">
                            <span className="label">Created Date</span>
                            <span className="value">{formatDateOnly(order.createdAt || order.orderDate)}</span>
                        </div>
                        <div className="grid-item">
                            <span className="label">Expected Delivery</span>
                            <span className="value">{formatDateOnly(order.deliveryDate || order.deliveryETA)}</span>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: WORKFLOW PROGRESS */}
                <section className="erp-card workflow-section">
                    <div className="card-header">
                        <div className="header-title">
                            <Activity size={18} />
                            <h3>Workflow Progress</h3>
                        </div>
                    </div>
                    <div className="workflow-stepper">
                        <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 20px' }}>
                            {workflow.map((stageObj, index) => {
                                let icon = '⚪';
                                let color = '#94a3b8';
                                
                                if (stageObj.status === 'Completed') {
                                    icon = '🟢';
                                    color = '#10b981';
                                } else if (stageObj.status === 'In Progress') {
                                    icon = '🟡';
                                    color = '#f59e0b';
                                } else if (stageObj.status === 'Issue' || stageObj.status === 'Rejected') {
                                    icon = '🔴';
                                    color = '#ef4444';
                                }

                                return (
                                    <div key={stageObj.stage + index} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '18px' }}>{icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#334155' }}>{stageObj.stage}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                    {stageObj.status !== 'Upcoming' ? (
                                                        <span>{stageObj.role} • {stageObj.status} {stageObj.updatedBy ? `by ${stageObj.updatedBy}` : ''}</span>
                                                    ) : (
                                                        <span>{stageObj.role} • Upcoming</span>
                                                    )}
                                                </div>
                                                {stageObj.remarks && <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>"{stageObj.remarks}"</div>}
                                            </div>
                                        </div>
                                        {index < workflow.length - 1 && (
                                            <div style={{ marginLeft: '8px', padding: '4px 0', color: color, fontSize: '14px', lineHeight: 1 }}>
                                                │
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <div className="erp-grid-2col">
                    {/* SECTION 3: ROLE-BASED ACTION PANEL */}
                    <section className="erp-card action-section">
                        <div className="card-header">
                            <div className="header-title">
                                <ShieldCheck size={18} />
                                <h3>Role-Based Actions</h3>
                            </div>
                            <span className="role-badge">{userRole} View</span>
                        </div>
                        <div className="action-panel-body">
                            <RoleActionPanel 
                                currentStage={currentStageName} 
                                loggedInRole={userRole} 
                                currentStatus={order.status} 
                                onAction={handleAction} 
                                isCancelled={isCancelled} 
                                submitting={submitting} 
                            />
                        </div>
                    </section>

                    {/* SECTION 6: NOTIFICATIONS */}
                    <section className="erp-card notifications-section" style={{ alignSelf: 'start' }}>
                        <div className="card-header">
                            <div className="header-title">
                                <AlertCircle size={18} />
                                <h3>Recent Notifications</h3>
                            </div>
                        </div>
                        <div className="notification-list">
                            {timeline.length === 0 ? (
                                <p className="empty-text">No recent notifications.</p>
                            ) : (
                                timeline.slice().reverse().slice(0, 4).map((t, i) => (
                                    <div key={i} className="notification-item">
                                        <div className="notif-icon"><Clock size={14} /></div>
                                        <div className="notif-content">
                                            <strong>{t.status}</strong>
                                            <span>{t.remarks || 'Status updated'}</span>
                                            <small>{formatDateTime(t.date)}</small>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* SECTION 4: ORDER HISTORY */}
                <section className="erp-card history-section">
                    <div className="card-header">
                        <div className="header-title">
                            <Clock size={18} />
                            <h3>Order History</h3>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Performed By</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Previous Status</th>
                                    <th>New Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeline.length === 0 ? (
                                    <tr><td colSpan="7" className="empty-text">No order history available.</td></tr>
                                ) : (
                                    timeline.slice().reverse().map((row, i) => {
                                        // To display previous status, we look at the next element in the reversed array
                                        const nextRow = timeline.slice().reverse()[i + 1];
                                        const prevStatus = nextRow ? nextRow.status : 'None';
                                        
                                        return (
                                            <tr key={i}>
                                                <td>{formatDateTime(row.date)}</td>
                                                <td>{row.userId ? `User #${row.userId}` : 'System'}</td>
                                                <td>{row.role || 'System'}</td>
                                                <td>Update Status</td>
                                                <td><span className="badge-outline">{prevStatus}</span></td>
                                                <td><span className="badge-outline">{row.status}</span></td>
                                                <td>{row.remarks || '-'}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>


            </div>
        </motion.div>
    );
};

export default OrderTracking;
