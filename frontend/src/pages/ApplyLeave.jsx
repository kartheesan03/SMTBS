import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Loader, Check, AlertTriangle, ArrowLeft } from 'lucide-react';

const ApplyLeave = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ type: 'Annual', startDate: '', endDate: '', reason: '' });

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    const today = new Date().toISOString().split('T')[0];

    const calcDays = (s, e) => {
        if (!s || !e) return 0;
        return Math.ceil((new Date(e) - new Date(s)) / 86400000) + 1;
    };

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
            showToast(`Leave application submitted successfully.`);
            setTimeout(() => {
                navigate('/leave-management');
            }, 1000);
        } catch (err) {
            showToast(err.response?.data?.message || 'Submission failed.', false);
            setSubmitting(false);
        }
    };

    return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {toast && (
                <div className={`lv-toast ${toast.ok ? 'ok' : 'err'}`}>
                    {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
                    {toast.msg}
                </div>
            )}

            <div style={{ width: '100%', maxWidth: '600px', marginBottom: '20px' }}>
                <button 
                    onClick={() => navigate('/leave-management')}
                    style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)', 
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        fontWeight: '600', fontSize: '14px', padding: 0
                    }}
                >
                    <ArrowLeft size={16} /> Back to Leave Management
                </button>
            </div>

            <div className="dashboard-card-3d lv-form-card" style={{ padding: '32px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                <div className="lv-form-head">
                    <h3>New Leave Application</h3>
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
                        <button type="button" className="btn-secondary" onClick={() => navigate('/leave-management')}>
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

            <style jsx="true">{`
                .module-container { padding: 40px 30px; position: relative; background-color: var(--bg-app); min-height: 100vh; font-family: 'Outfit', sans-serif; color: var(--text-main); }
                
                /* ── Toast ── */
                .lv-toast { position: fixed; bottom: 28px; right: 28px; display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; z-index: 9999; animation: slideUp 0.3s ease; box-shadow: var(--shadow-lg); }
                .lv-toast.ok  { background: var(--success-bg); border: 1px solid var(--success); color: var(--success); }
                .lv-toast.err { background: var(--danger-bg);  border: 1px solid var(--danger); color: var(--danger); }

                /* ── Form Card ── */
                .lv-form-card { background: var(--bg-surface) !important; border: 1px solid var(--border-subtle) !important; border-radius: var(--radius-lg) !important; box-shadow: var(--shadow-sm) !important; }
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
                
                /* Buttons */
                .btn-secondary { background: var(--bg-app); color: var(--text-muted); border: 1px solid var(--border-subtle); padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-secondary:hover { background: var(--bg-hover); color: var(--text-heading); border-color: var(--border-strong); }
                .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-xl); font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 12px -1px rgba(37, 99, 235, 0.3); }
                
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-container { padding: 16px; }
                    .lv-form-grid { grid-template-columns: 1fr; }
                    .lv-form-actions { flex-direction: column; }
                    .lv-form-actions button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default ApplyLeave;
