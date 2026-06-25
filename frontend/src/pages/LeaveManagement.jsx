import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Calendar, Plus, Trash2, CheckCircle, Clock, XCircle, Loader, AlertTriangle, Check } from 'lucide-react';

const LeaveManagement = () => {
    const navigate = useNavigate();
    const [leaves,       setLeaves]       = useState([]);
    const [balance,      setBalance]      = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [toast, setToast] = useState(null);
    const [reviewModal, setReviewModal] = useState(null); // stores leave object being reviewed

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    const isHR = userInfo.role === 'HR' || userInfo.role === 'Admin';

    // ── helpers ────────────────────────────────────────────────────────────
    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    const today = new Date().toISOString().split('T')[0];

    const calcDays = (s, e) => {
        if (!s || !e) return 0;
        return Math.ceil((new Date(e) - new Date(s)) / 86400000) + 1;
    };

    const fmtDate = (iso) =>
        new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // ── fetch ──────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [leavesRes, balRes] = await Promise.all([
                isHR ? API.get('/leaves') : API.get('/leaves/my'),
                API.get('/leaves/balance')
            ]);
            setLeaves(leavesRes.data);
            setBalance(balRes.data.balance);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to load leave data.', false);
        } finally {
            setLoading(false);
        }
    }, [isHR]);

    useEffect(() => { fetchAll(); }, [fetchAll]);



    // ── cancel ─────────────────────────────────────────────────────────────
    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this leave request?')) return;
        try {
            await API.put(`/leaves/${id}/cancel`);
            showToast('Leave request cancelled.');
            fetchAll();
        } catch (err) {
            showToast(err.response?.data?.message || 'Cancel failed.', false);
        }
    };

    const handleReview = async (id, status, reviewNote) => {
        try {
            await API.put(`/leaves/${id}/review`, { status, reviewNote });
            showToast(`Leave request ${status.toLowerCase()} successfully.`);
            setReviewModal(null);
            fetchAll();
        } catch (err) {
            showToast(err.response?.data?.message || 'Review failed.', false);
        }
    };

    // ── render ─────────────────────────────────────────────────────────────
    return (
        <div className="page-container">

            {/* ── Toast ── */}
            {toast && (
                <div className={`lv-toast ${toast.ok ? 'ok' : 'err'}`}>
                    {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <header className="page-header">
                <div>
                    <h1 className="page-title">{isHR ? 'Leave Administration' : 'Leave Management'}</h1>
                    <p className="page-subtitle">
                        {isHR ? 'Review employee leave requests and manage organization-wide attendance.' : 'Manage your time-off requests and track your leave balance.'}
                    </p>
                </div>
                <button
                    id="btn-apply-leave"
                    className="btn-primary flex-center gap-10"
                    onClick={() => navigate('/leave-management/apply')}
                >
                    <Plus size={18} /> Apply for Leave
                </button>
            </header>

            {/* ── Balance Cards ── */}
            <div className="lv-balance-grid">
                {balance && ['Annual', 'Sick', 'Casual'].map(type => {
                    const b = balance[type];
                    const pct = Math.round((b.remaining / b.total) * 100);
                    return (
                        <div key={type} className="premium-card" style={{ padding: '22px' }}>
                            <div className="lv-bal-top">
                                <span className="lv-bal-type">{type} Leave</span>
                                <span className="lv-bal-pct">{pct}%</span>
                            </div>
                            <div className="lv-bal-nums">
                                <span className="lv-bal-remain">{b.remaining}</span>
                                <span className="lv-bal-total text-muted"> / {b.total} days</span>
                            </div>
                            <div className="lv-progress-bar">
                                <div
                                    className="lv-progress-fill"
                                    style={{
                                        width: `${pct}%`,
                                        background: type === 'Annual' ? '#6366f1' : type === 'Sick' ? '#10b981' : '#f59e0b'
                                    }}
                                />
                            </div>
                            <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
                                {b.used} days used this year
                            </p>
                        </div>
                    );
                })}
            </div>


            {/* ── Review Modal (HR) ── */}
            {reviewModal && (
                <div className="modal-overlay">
                    <div className="premium-card animate-pop" style={{ padding: '32px', maxWidth: '500px' }}>
                        <div className="lv-form-head">
                            <h3>Review Leave Request</h3>
                            <button className="close-btn" onClick={() => setReviewModal(null)}>✕</button>
                        </div>
                        <div className="lv-review-details">
                            <p><strong>Employee:</strong> {reviewModal.employee?.userId?.name}</p>
                            <p><strong>Type:</strong> {reviewModal.type}</p>
                            <p><strong>Period:</strong> {fmtDate(reviewModal.startDate)} to {fmtDate(reviewModal.endDate)}</p>
                            <p><strong>Reason:</strong> {reviewModal.reason || 'No reason provided'}</p>
                        </div>
                        <div className="form-group" style={{marginTop: 20}}>
                            <label>Review Note (Optional)</label>
                            <textarea 
                                rows={3} 
                                value={reviewModal.note} 
                                onChange={e => setReviewModal({...reviewModal, note: e.target.value})}
                                placeholder="Add a note for the employee..."
                            />
                        </div>
                        <div className="lv-form-actions">
                            <button className="btn-secondary" onClick={() => setReviewModal(null)}>Back</button>
                            <button 
                                className={`btn-primary ${reviewModal.reviewStatus === 'Rejected' ? 'btn-danger' : ''}`}
                                onClick={() => handleReview(reviewModal._id, reviewModal.reviewStatus, reviewModal.note)}
                            >
                                Confirm {reviewModal.reviewStatus}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Leave History Table ── */}
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="lv-table-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>{isHR ? 'All Leave Requests' : 'Leave History'}</h3>
                    <span className="text-muted" style={{ fontSize: 13 }}>{leaves.length} request{leaves.length !== 1 ? 's' : ''}</span>
                </div>

                {loading ? (
                    <div className="lv-loading">
                        <Loader size={28} className="spin-icon" />
                        <p>Loading your leave records…</p>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="lv-empty">
                        <Calendar size={36} />
                        <p>No leave requests found. Apply for leave above.</p>
                    </div>
                ) : (
                    <div className="enterprise-table-container">
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                {isHR && <th>Employee</th>}
                                <th>Type</th>
                                <th>Dates</th>
                                <th>Days</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map(l => {
                                const days = calcDays(l.startDate, l.endDate);
                                return (
                                    <tr key={l._id}>
                                        {isHR && (
                                            <td>
                                                <div className="lv-emp-info">
                                                    <strong>{l.employee?.userId?.name || 'Unknown'}</strong>
                                                    <span className="text-muted" style={{fontSize:11}}>{l.employee?.employeeId}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <span className={`lv-type-tag ${l.type.toLowerCase()}`}>
                                                {l.type}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{fmtDate(l.startDate)}</strong>
                                            {l.startDate !== l.endDate && (
                                                <span className="text-muted"> → {fmtDate(l.endDate)}</span>
                                            )}
                                        </td>
                                        <td>{days} day{days !== 1 ? 's' : ''}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className={`lv-status-pill ${l.status.toLowerCase()}`}>
                                                {l.status === 'Approved'  && <CheckCircle size={13} />}
                                                {l.status === 'Pending'   && <Clock size={13} />}
                                                {l.status === 'Rejected'  && <XCircle size={13} />}
                                                {l.status === 'Cancelled' && <XCircle size={13} />}
                                                {l.status}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {l.status === 'Pending' && !isHR && (
                                                <button
                                                    className="lv-cancel-btn"
                                                    onClick={() => handleCancel(l._id)}
                                                    style={{ display: 'inline-flex' }}
                                                >
                                                    <Trash2 size={14} /> Cancel
                                                </button>
                                            )}
                                            {l.status === 'Pending' && isHR && (
                                                <div className="lv-review-actions" style={{ justifyContent: 'flex-end' }}>
                                                    <button className="btn-approve-sm" onClick={() => setReviewModal({ ...l, reviewStatus: 'Approved', note: '' })}>Approve</button>
                                                    <button className="btn-reject-sm" onClick={() => setReviewModal({ ...l, reviewStatus: 'Rejected', note: '' })}>Reject</button>
                                                </div>
                                            )}
                                            {l.status !== 'Pending' && l.reviewNote && (
                                                <span className="lv-note text-muted" title={l.reviewNote}>
                                                    📝 Note
                                                </span>
                                            )}
                                            {l.status !== 'Pending' && !l.reviewNote && (
                                                <span className="text-muted" style={{ opacity: 0.5 }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; position: relative; background-color: var(--bg-app); min-height: 100vh; font-family: 'Outfit', sans-serif; color: var(--text-main); }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; gap: 20px; }

                /* ── Toast ── */
                .lv-toast { position: fixed; bottom: 28px; right: 28px; display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; z-index: 9999; animation: slideUp 0.3s ease; box-shadow: var(--shadow-lg); }
                .lv-toast.ok  { background: var(--success-bg); border: 1px solid var(--success); color: var(--success); }
                .lv-toast.err { background: var(--danger-bg);  border: 1px solid var(--danger); color: var(--danger); }

                /* ── Balance grid ── */
                .lv-balance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 28px; }
                .lv-bal-card { padding: 22px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s; }
                .lv-bal-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
                .lv-bal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .lv-bal-type { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .lv-bal-pct { font-size: 13px; font-weight: 800; color: var(--primary); background: var(--primary-light); padding: 2px 8px; border-radius: 6px; }
                .lv-bal-nums { margin-bottom: 12px; }
                .lv-bal-remain { font-size: 32px; font-weight: 800; color: var(--text-heading); }
                .lv-bal-total { font-size: 14px; font-weight: 600; color: var(--text-muted); }
                .lv-progress-bar { width: 100%; height: 8px; background: var(--bg-hover); border-radius: 10px; overflow: hidden; }
                .lv-progress-fill { height: 100%; border-radius: 10px; transition: width 0.6s ease; }

                /* ── Modal ── */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .lv-form-card { width: 100%; max-width: 600px; padding: 32px; max-height: 90vh; overflow-y: auto; background: var(--bg-surface) !important; border: 1px solid var(--border-subtle) !important; border-radius: var(--radius-lg) !important; box-shadow: var(--shadow-lg) !important; }
                .lv-form-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle); }
                .lv-form-head h3 { font-size: 20px; font-weight: 800; color: var(--text-heading); margin: 0; }
                .lv-form { display: flex; flex-direction: column; gap: 20px; }
                .lv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 12px 16px; background: var(--bg-app) !important;
                    border: 1px solid var(--border-subtle) !important; border-radius: var(--radius-md) !important; color: var(--text-heading) !important; font-size: 14px !important;
                    transition: border-color 0.2s; width: 100%; box-shadow: none !important;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none; border-color: var(--primary) !important; box-shadow: 0 0 0 3px var(--primary-light) !important;
                }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group select option { background: var(--bg-app) !important; color: var(--text-heading) !important; }
                .days-preview { font-size: 26px; font-weight: 800; color: var(--primary); padding-top: 4px; }
                .lv-form-actions { display: flex; justify-content: flex-end; gap: 14px; margin-top: 8px; border-top: 1px solid var(--border-subtle); padding-top: 24px; }
                .btn-secondary { background: var(--bg-app); color: var(--text-muted); border: 1px solid var(--border-subtle); padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-secondary:hover { background: var(--bg-hover); color: var(--text-heading); border-color: var(--border-strong); }
                .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-xl); font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 12px -1px rgba(37, 99, 235, 0.3); }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; padding: 4px; border-radius: 6px; transition: background 0.2s; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-heading); }
                .animate-pop { animation: pop 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                @keyframes pop { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }

                /* ── Table card ── */
                .lv-table-card { padding: 8px; overflow-x: auto; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
                .lv-table-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 12px; }
                .lv-table-header h3 { font-size: 18px; font-weight: 800; color: var(--text-heading); margin: 0; }
                .lv-table { width: 100%; border-collapse: collapse; min-width: 700px; }
                .lv-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border-subtle); letter-spacing: 0.5px; }
                .lv-table td { padding: 16px; font-size: 14px; border-bottom: 1px solid var(--border-subtle); color: var(--text-main); }
                .lv-table tbody tr:hover { background: var(--bg-hover); }
                .lv-reason { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted); }

                /* ── Type tags ── */
                .lv-type-tag { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; white-space: nowrap; display: inline-block; }
                .lv-type-tag.annual  { background: rgba(99,102,241,0.1); color: #6366f1; }
                .lv-type-tag.sick    { background: rgba(16,185,129,0.1); color: #10b981; }
                .lv-type-tag.casual  { background: rgba(245,158,11,0.1); color: var(--warning); }
                .lv-type-tag.unpaid  { background: rgba(100,116,139,0.1); color: var(--text-muted); }

                /* ── Status pills ── */
                .lv-status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; white-space: nowrap; }
                .lv-status-pill.approved  { background: var(--success-bg); color: var(--success); }
                .lv-status-pill.pending   { background: rgba(245,158,11,0.1); color: var(--warning); }
                .lv-status-pill.rejected  { background: var(--danger-bg);  color: var(--danger); }
                .lv-status-pill.cancelled { background: var(--bg-hover); color: var(--text-muted); }

                /* ── Cancel button ── */
                .lv-cancel-btn { display: flex; align-items: center; gap: 5px; background: none; color: var(--danger); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; border: none; padding: 4px 8px; border-radius: 6px; transition: background 0.2s; }
                .lv-cancel-btn:hover { background: var(--danger-bg); }
                .lv-note { font-size: 12px; cursor: help; color: var(--text-muted); }
                
                .lv-review-actions { display: flex; gap: 8px; }
                .btn-approve-sm { background: var(--success-bg); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-reject-sm { background: var(--danger-bg); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-approve-sm:hover { background: var(--success); color: white; }
                .btn-reject-sm:hover { background: var(--danger); color: white; }
                .btn-danger { background: var(--danger) !important; border-color: var(--danger) !important; }
                
                .lv-review-details { background: var(--bg-app); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 10px; }
                .lv-review-details p { font-size: 14px; margin: 0; color: var(--text-muted); }
                .lv-review-details strong { color: var(--text-heading); }
                .lv-emp-info { display: flex; flex-direction: column; min-width: 120px; }
                .title-gradient { font-size: 26px; font-weight: 800; color: var(--text-heading); margin: 0 0 4px 0; }
                .text-muted { color: var(--text-muted); }

                /* ── Loading / empty ── */
                .lv-loading, .lv-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 48px 20px; color: var(--text-muted); text-align: center; }
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── Shared ── */
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .page-container { padding: 16px 12px; }
                    .module-header { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .module-header button { width: 100%; justify-content: center; }
                    .lv-balance-grid { grid-template-columns: 1fr; }
                    .lv-form-grid { grid-template-columns: 1fr; }
                    .lv-form-actions { flex-direction: column; }
                    .lv-form-actions button { width: 100%; }
                    .lv-toast { left: 20px; right: 20px; bottom: 20px; }
                }
            `}</style>
        </div>
    );
};

export default LeaveManagement;
