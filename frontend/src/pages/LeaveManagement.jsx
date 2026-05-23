import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { Calendar, Plus, Trash2, CheckCircle, Clock, XCircle, Loader, AlertTriangle, Check } from 'lucide-react';

const LeaveManagement = () => {
    const [leaves,       setLeaves]       = useState([]);
    const [balance,      setBalance]      = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [formOpen,     setFormOpen]     = useState(false);
    const [submitting,   setSubmitting]   = useState(false);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ type: 'Annual', startDate: '', endDate: '', reason: '' });
    const [reviewModal, setReviewModal] = useState(null); // stores leave object being reviewed

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
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

    // ── submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.startDate || !form.endDate) {
            showToast('Please select both start and end dates.', false);
            return;
        }
        if (new Date(form.endDate) < new Date(form.startDate)) {
            showToast('End date must be on or after start date.', false);
            return;
        }
        setSubmitting(true);
        try {
            await API.post('/leaves', form);
            showToast(`Leave application submitted for ${calcDays(form.startDate, form.endDate)} day(s).`);
            setFormOpen(false);
            setForm({ type: 'Annual', startDate: '', endDate: '', reason: '' });
            fetchAll();
        } catch (err) {
            showToast(err.response?.data?.message || 'Submission failed.', false);
        } finally {
            setSubmitting(false);
        }
    };

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
        <div className="module-container">

            {/* ── Toast ── */}
            {toast && (
                <div className={`lv-toast ${toast.ok ? 'ok' : 'err'}`}>
                    {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">{isHR ? 'Leave Administration' : 'Leave Management'}</h1>
                    <p className="text-muted">
                        {isHR ? 'Review employee leave requests and manage organization-wide attendance.' : 'Manage your time-off requests and track your leave balance.'}
                    </p>
                </div>
                <button
                    id="btn-apply-leave"
                    className="btn-primary flex-center gap-10"
                    onClick={() => setFormOpen(true)}
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
                        <div key={type} className="glass-card lv-bal-card">
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

            {/* ── Application Form Modal ── */}
            {formOpen && (
                <div className="modal-overlay">
                    <div className="glass-card lv-form-card animate-pop">
                        <div className="lv-form-head">
                            <h3>New Leave Application</h3>
                            <button className="close-btn" onClick={() => setFormOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="lv-form">
                            <div className="lv-form-grid">
                                <div className="form-group">
                                    <label>Leave Type</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="Annual">Annual Leave</option>
                                        <option value="Sick">Sick Leave</option>
                                        <option value="Casual">Casual Leave</option>
                                        <option value="Unpaid">Unpaid Leave</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ alignItems: 'center' }}>
                                    <label>Days Requested</label>
                                    <div className="days-preview">
                                        {calcDays(form.startDate, form.endDate) || '—'} days
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        min={today}
                                        required
                                        value={form.startDate}
                                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        min={form.startDate || today}
                                        required
                                        value={form.endDate}
                                        onChange={e => setForm({ ...form, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Reason / Remarks</label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly explain the reason for your leave request..."
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                />
                            </div>
                            <div className="lv-form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-center gap-10" disabled={submitting}>
                                    {submitting
                                        ? <><Loader size={16} className="spin-icon" /> Submitting…</>
                                        : <><Check size={16} /> Submit Application</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* ── Review Modal (HR) ── */}
            {reviewModal && (
                <div className="modal-overlay">
                    <div className="glass-card lv-form-card animate-pop">
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
            <div className="glass-card lv-table-card">
                <div className="lv-table-header">
                    <h3>{isHR ? 'All Leave Requests' : 'Leave History'}</h3>
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
                    <table className="lv-table">
                        <thead>
                            <tr>
                                {isHR && <th>Employee</th>}
                                <th>Type</th>
                                <th>Dates</th>
                                <th>Days</th>
                                <th>Status</th>
                                <th>Actions</th>
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
                                        <td>
                                            <div className={`lv-status-pill ${l.status.toLowerCase()}`}>
                                                {l.status === 'Approved'  && <CheckCircle size={13} />}
                                                {l.status === 'Pending'   && <Clock size={13} />}
                                                {l.status === 'Rejected'  && <XCircle size={13} />}
                                                {l.status === 'Cancelled' && <XCircle size={13} />}
                                                {l.status}
                                            </div>
                                        </td>
                                        <td>
                                            {l.status === 'Pending' && !isHR && (
                                                <button
                                                    className="lv-cancel-btn"
                                                    onClick={() => handleCancel(l._id)}
                                                >
                                                    <Trash2 size={14} /> Cancel
                                                </button>
                                            )}
                                            {l.status === 'Pending' && isHR && (
                                                <div className="lv-review-actions">
                                                    <button className="btn-approve-sm" onClick={() => setReviewModal({ ...l, reviewStatus: 'Approved', note: '' })}>Approve</button>
                                                    <button className="btn-reject-sm" onClick={() => setReviewModal({ ...l, reviewStatus: 'Rejected', note: '' })}>Reject</button>
                                                </div>
                                            )}
                                            {l.reviewNote && (
                                                <span className="lv-note text-muted" title={l.reviewNote}>
                                                    📝 Note
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; position: relative; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; gap: 20px; }

                /* ── Toast ── */
                .lv-toast { position: fixed; bottom: 28px; right: 28px; display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 9999; animation: slideUp 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
                .lv-toast.ok  { background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; }
                .lv-toast.err { background: rgba(239,68,68,0.15);  border: 1px solid #ef4444; color: #ef4444; }

                /* ── Balance grid ── */
                .lv-balance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 28px; }
                .lv-bal-card { padding: 22px; }
                .lv-bal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .lv-bal-type { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .lv-bal-pct { font-size: 12px; font-weight: 700; color: var(--primary); }
                .lv-bal-nums { margin-bottom: 10px; }
                .lv-bal-remain { font-size: 32px; font-weight: 800; color: white; }
                .lv-bal-total { font-size: 14px; }
                .lv-progress-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
                .lv-progress-fill { height: 100%; border-radius: 10px; transition: width 0.6s ease; }

                /* ── Modal ── */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .lv-form-card { width: 100%; max-width: 600px; padding: 32px; max-height: 90vh; overflow-y: auto; }
                .lv-form-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
                .lv-form { display: flex; flex-direction: column; gap: 20px; }
                .lv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 11px 14px; background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;
                    transition: border-color 0.2s; width: 100%;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none; border-color: var(--primary);
                }
                .form-group select option { background: #1e293b; }
                .days-preview { font-size: 24px; font-weight: 800; color: var(--primary); padding-top: 4px; }
                .lv-form-actions { display: flex; justify-content: flex-end; gap: 14px; }
                .btn-secondary { background: transparent; color: white; border: 1px solid var(--border); padding: 11px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .close-btn { background: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
                .animate-pop { animation: pop 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                @keyframes pop { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }

                /* ── Table card ── */
                .lv-table-card { padding: 8px; overflow-x: auto; }
                .lv-table-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 12px; }
                .lv-table { width: 100%; border-collapse: collapse; min-width: 700px; }
                .lv-table th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border); letter-spacing: 0.5px; }
                .lv-table td { padding: 16px; font-size: 14px; border-bottom: 1px solid var(--border); }
                .lv-table tbody tr:hover { background: rgba(255,255,255,0.02); }
                .lv-reason { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                /* ── Type tags ── */
                .lv-type-tag { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
                .lv-type-tag.annual  { background: rgba(99,102,241,0.1); color: #6366f1; }
                .lv-type-tag.sick    { background: rgba(16,185,129,0.1); color: #10b981; }
                .lv-type-tag.casual  { background: rgba(245,158,11,0.1); color: #f59e0b; }
                .lv-type-tag.unpaid  { background: rgba(100,116,139,0.1); color: #64748b; }

                /* ── Status pills ── */
                .lv-status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
                .lv-status-pill.approved  { background: rgba(16,185,129,0.1); color: #10b981; }
                .lv-status-pill.pending   { background: rgba(245,158,11,0.1); color: #f59e0b; }
                .lv-status-pill.rejected  { background: rgba(239,68,68,0.1);  color: #ef4444; }
                .lv-status-pill.cancelled { background: rgba(100,116,139,0.1);color: #64748b; }

                /* ── Cancel button ── */
                .lv-cancel-btn { display: flex; align-items: center; gap: 5px; background: none; color: #ef4444; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
                .lv-cancel-btn:hover { text-decoration: underline; }
                .lv-note { font-size: 12px; cursor: help; }
                
                .lv-review-actions { display: flex; gap: 8px; }
                .btn-approve-sm { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
                .btn-reject-sm { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
                .btn-approve-sm:hover { background: #10b981; color: white; }
                .btn-reject-sm:hover { background: #ef4444; color: white; }
                .btn-danger { background: #ef4444 !important; border-color: #ef4444 !important; }
                
                .lv-review-details { background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
                .lv-review-details p { font-size: 14px; margin: 0; }
                .lv-emp-info { display: flex; flex-direction: column; min-width: 120px; }

                /* ── Loading / empty ── */
                .lv-loading, .lv-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 48px 20px; color: var(--text-muted); text-align: center; }
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── Shared ── */
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .module-header { flex-direction: column; align-items: flex-start; }
                    .module-header button { width: 100%; }
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
