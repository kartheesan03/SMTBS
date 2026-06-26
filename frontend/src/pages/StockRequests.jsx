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

    // History Modal
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState('[]');

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
            case 'Manager Approved': return <span className="status-badge-premium ok">Manager Approved</span>;
            case 'Rejected': return <span className="status-badge-premium out">Rejected</span>;
            case 'More Info Requested': return <span className="status-badge-premium warn" style={{ background: '#fef3c7', color: '#b45309' }}>More Info Requested</span>;
            case 'Processing': return <span className="status-badge-premium" style={{ background: '#e0e7ff', color: '#4338ca' }}>Processing</span>;
            case 'Dispatched': return <span className="status-badge-premium" style={{ background: '#dbeafe', color: '#1d4ed8' }}>Dispatched</span>;
            case 'Delivered': return <span className="status-badge-premium" style={{ background: '#dcfce7', color: '#15803d' }}>Delivered</span>;
            case 'Completed': return <span className="status-badge-premium" style={{ background: '#dcfce7', color: '#166534' }}>Completed</span>;
            case 'Cancelled': return <span className="status-badge-premium out">Cancelled</span>;
            default: return <span className="status-badge-premium">{status}</span>;
        }
    };

    // Employee Actions
    const handleEmployeeReceive = async (id) => {
        try {
            await API.put(`/stock-requests/${id}/employee-receive`);
            showToast('Material received and request completed.');
            fetchRequests();
        } catch (err) {
            showToast('Action failed.');
        }
    };

    // Manager Actions
    const submitManagerAction = async (actionType) => {
        try {
            await API.put(`/stock-requests/${managerFormData.id}/manager-action`, {
                managerMessage: managerFormData.message,
                actionType
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
        <div className="page-container" style={{ padding: '24px', background: 'var(--bg-body)', minHeight: '100vh' }}>
            <header className="module-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: '0 0 6px 0', fontSize: '26px' }}>Stock Requests Pipeline</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage material requests, manager approvals, and sales deliveries.</p>
                </div>
            </header>

            {toastMsg && <div className="toast-notification success" style={{ background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>{toastMsg}</div>}

            <div className="table-card" >
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
                ) : requests.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No stock requests found.</div>
                ) : (
                    <table className="enterprise-table">
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
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button className="btn-primary-blue" style={{ padding: '6px 12px', background: '#64748b', border: 'none' }} onClick={() => {
                                                setSelectedHistory(req.history || '[]');
                                                setShowHistoryModal(true);
                                            }}>History</button>

                                            {/* Manager Button */}
                                            {(isManager || isAdmin || isSuperAdmin) && req.status === 'Pending' && (
                                                <button className="btn-primary-blue" style={{ padding: '6px 12px', background: '#f59e0b', border: 'none' }} onClick={() => {
                                                    setManagerFormData({ id: req.id, message: '' });
                                                    setShowManagerModal(true);
                                                }}>
                                                    Take Action
                                                </button>
                                            )}

                                            {/* Employee Receive Button */}
                                            {isEmployee && req.status === 'Delivered' && (
                                                <button className="btn-primary-blue" style={{ padding: '6px 12px', background: '#10b981', border: 'none' }} onClick={() => handleEmployeeReceive(req.id)}>Mark as Received</button>
                                            )}

                                            {/* Sales Delivery Update Button */}
                                            {(isSales || isAdmin || isSuperAdmin) && ['Manager Approved', 'Processing', 'Dispatched'].includes(req.status) && (
                                                <button className="btn-primary-blue" style={{ padding: '6px 12px', background: '#3b82f6', border: 'none' }} onClick={() => {
                                                    setSalesFormData({ id: req.id, status: req.status === 'Manager Approved' ? 'Processing' : req.status });
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
                        <div className="modal-form">
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label>Manager Message / Note</label>
                                <textarea rows="3" required placeholder="Let the employee know your decision..." value={managerFormData.message} onChange={e => setManagerFormData({ ...managerFormData, message: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', }}></textarea>
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => setShowManagerModal(false)} style={{ padding: '10px 16px', background: 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                <button type="button" onClick={() => submitManagerAction('MoreInfo')} style={{ padding: '10px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Request More Info</button>
                                <button type="button" onClick={() => submitManagerAction('Reject')} style={{ padding: '10px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                                <button type="button" onClick={() => submitManagerAction('Approve')} style={{ padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Approve Request</button>
                                <button type="button" onClick={() => submitManagerAction('CreatePO')} style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Create Purchase Order</button>
                            </div>
                        </div>
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
                                <select value={salesFormData.status} onChange={e => setSalesFormData({ ...salesFormData, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', }}>
                                    <option value="Processing">Processing</option>
                                    <option value="Dispatched">Dispatched</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowSalesModal(false)} style={{ padding: '10px 16px', background: 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Update Status</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Request History</h2>
                            <button className="close-btn" onClick={() => setShowHistoryModal(false)}>✕</button>
                        </div>
                        <div style={{ padding: '10px 0' }}>
                            {(() => {
                                let historyArray = [];
                                try { historyArray = JSON.parse(selectedHistory); } catch(e){}
                                if (!Array.isArray(historyArray) || historyArray.length === 0) {
                                    return <p style={{ color: 'var(--text-muted)' }}>No history available for this request.</p>;
                                }
                                return (
                                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                                        {historyArray.map((entry, i) => (
                                            <li key={i} style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }}></div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{entry.status}</div>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        {new Date(entry.timestamp).toLocaleString()} • by {entry.user?.name || 'System'} ({entry.user?.role || ''})
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            })()}
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button type="button" onClick={() => setShowHistoryModal(false)} style={{ padding: '10px 16px', background: '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StockRequests;
