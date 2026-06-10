import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { Box, Send, CheckCircle, XCircle, Clock, Truck, ShieldAlert, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StockRequests = () => {
    const { user } = useContext(AuthContext);
    const userRole = user?.role ? user.role : '';
    const isEmployee = userRole === 'Employee';
    const isManager = userRole === 'Manager';
    const isSales = userRole === 'Sales';
    const isAdmin = userRole === 'Admin';
    const isSuperAdmin = userRole === 'Super Admin';

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMsg, setToastMsg] = useState('');
    const navigate = useNavigate();

    // Manager Action Modal
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [managerFormData, setManagerFormData] = useState({ id: '', message: '', orderId: '' });

    // Sales Action Modal
    const [showSalesModal, setShowSalesModal] = useState(false);
    const [salesFormData, setSalesFormData] = useState({ id: '', status: 'Processing' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await API.get('/stock-requests');
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch stock requests', err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 4000);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="status-badge-premium low">Pending</span>;
            case 'Manager Action Taken': return <span className="status-badge-premium warn" style={{ background: '#fef3c7', color: '#b45309' }}>Manager Action Taken</span>;
            case 'Employee Approved': return <span className="status-badge-premium ok">Employee Approved</span>;
            case 'Employee Rejected': return <span className="status-badge-premium out">Rejected</span>;
            case 'Processing': return <span className="status-badge-premium" style={{ background: '#e0e7ff', color: '#4338ca' }}>Processing</span>;
            case 'Dispatched': return <span className="status-badge-premium" style={{ background: '#dbeafe', color: '#1d4ed8' }}>Dispatched</span>;
            case 'Delivered': return <span className="status-badge-premium" style={{ background: '#dcfce7', color: '#15803d' }}>Delivered</span>;
            case 'Cancelled': return <span className="status-badge-premium out">Cancelled</span>;
            default: return <span className="status-badge-premium">{status}</span>;
        }
    };

    // Employee Actions
    const handleEmployeeApproval = async (id, approved) => {
        try {
            await API.put(`/stock-requests/${id}/employee-approval`, { approved });
            showToast(approved ? 'Request Approved successfully.' : 'Request Rejected.');
            fetchRequests();
        } catch (err) {
            showToast('Action failed.');
        }
    };

    // Manager Actions
    const submitManagerAction = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/stock-requests/${managerFormData.id}/manager-action`, {
                managerMessage: managerFormData.message,
                orderId: managerFormData.orderId || null
            });
            setShowManagerModal(false);
            showToast('Manager response recorded.');
            fetchRequests();
        } catch (err) {
            showToast('Manager action failed.');
        }
    };

    // Sales Actions
    const submitSalesAction = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/stock-requests/${salesFormData.id}/sales-update`, {
                status: salesFormData.status
            });
            setShowSalesModal(false);
            showToast('Delivery status updated.');
            fetchRequests();
        } catch (err) {
            showToast('Sales action failed.');
        }
    };

    return (
        <div className="stock-requests-workspace" style={{ padding: '24px', background: 'var(--bg-body)', minHeight: '100vh' }}>
            <header className="module-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: '0 0 6px 0', fontSize: '26px' }}>Stock Requests Pipeline</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage material requests, manager approvals, and sales deliveries.</p>
                </div>
            </header>

            {toastMsg && <div className="toast-notification success" style={{ background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>{toastMsg}</div>}

            <div className="table-card" style={{ background: 'white', borderRadius: '12px', padding: '1px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
                ) : requests.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No stock requests found.</div>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Material</th>
                                <th>Requested By</th>
                                <th>Req. Qty</th>
                                <th>Status</th>
                                <th>Manager Message</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <strong>{req.material?.name || 'Unknown'}</strong><br />
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{req.material?.sku}</span>
                                    </td>
                                    <td>{req.employee?.name || 'Unknown'}</td>
                                    <td>{req.requiredQuantity}</td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {req.managerMessage || '-'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {/* Manager Button */}
                                            {(isManager || isAdmin || isSuperAdmin) && req.status === 'Pending' && (
                                                <button className="btn-primary-blue" style={{ padding: '6px 12px', background: '#f59e0b', border: 'none' }} onClick={() => {
                                                    setManagerFormData({ id: req.id, message: '', orderId: '' });
                                                    setShowManagerModal(true);
                                                }}>
                                                    Take Action
                                                </button>
                                            )}

                                            {/* Employee Approval Buttons */}
                                            {isEmployee && req.status === 'Manager Action Taken' && (
                                                <>
                                                    <button className="btn-primary-blue" style={{ padding: '6px 12px', background: '#10b981', border: 'none' }} onClick={() => handleEmployeeApproval(req.id, true)}>Approve</button>
                                                    <button className="btn-primary-blue" style={{ padding: '6px 12px', background: '#ef4444', border: 'none' }} onClick={() => handleEmployeeApproval(req.id, false)}>Reject</button>
                                                </>
                                            )}

                                            {/* Sales Delivery Update Button */}
                                            {(isSales || isAdmin || isSuperAdmin) && ['Employee Approved', 'Processing', 'Dispatched'].includes(req.status) && (
                                                <button className="btn-primary-blue" style={{ padding: '6px 12px', background: '#3b82f6', border: 'none' }} onClick={() => {
                                                    setSalesFormData({ id: req.id, status: req.status === 'Employee Approved' ? 'Processing' : req.status });
                                                    setShowSalesModal(true);
                                                }}>
                                                    Update Delivery
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

            {/* Manager Action Modal */}
            {showManagerModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h2>Manager Action</h2>
                            <button className="close-btn" onClick={() => setShowManagerModal(false)}>✕</button>
                        </div>
                        <form onSubmit={submitManagerAction} className="modal-form">
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label>Manager Message / Note</label>
                                <textarea rows="3" required placeholder="Let the employee know your decision..." value={managerFormData.message} onChange={e => setManagerFormData({ ...managerFormData, message: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}></textarea>
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label>Linked Purchase Order ID (Optional)</label>
                                <input type="number" placeholder="Order ID" value={managerFormData.orderId} onChange={e => setManagerFormData({ ...managerFormData, orderId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowManagerModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Send to Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sales Action Modal */}
            {showSalesModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Update Delivery Status</h2>
                            <button className="close-btn" onClick={() => setShowSalesModal(false)}>✕</button>
                        </div>
                        <form onSubmit={submitSalesAction} className="modal-form">
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label>Status</label>
                                <select value={salesFormData.status} onChange={e => setSalesFormData({ ...salesFormData, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <option value="Processing">Processing</option>
                                    <option value="Dispatched">Dispatched</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowSalesModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Update Status</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StockRequests;
