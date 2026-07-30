import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Loader, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

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
                navigate(-1);
            }, 1000);
        } catch (err) {
            showToast(err.response?.data?.message || 'Submission failed.', false);
            setSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container" 
        >
            <div className="rd-content">
            {toast && (
                <div className={`lv-toast ${toast.ok ? 'ok' : 'err'}`}>
                    {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
                    {toast.msg}
                </div>
            )}

            <div style={{ width: '100%', maxWidth: '800px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <PageHeader title="New Leave Application" badge="HRMS" subtitle="Submit a new request for time off" showBack={true} />
                </div>
            </div>

            <div className="premium-card lv-form-card" style={{ padding: '32px', width: '100%', maxWidth: '800px' }}>
                <div className="lv-form-head">
                    <h3 style={{ display: 'none' }}>New Leave Application</h3>
                </div>
                <form onSubmit={handleSubmit} className="lv-form">
                    <div className="lv-form-grid">
                        <div className="form-group type-group">
                            <label>Leave Type</label>
                            <div className="select-wrapper">
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
                        </div>
                        <div className="form-group days-group">
                            <label>Duration</label>
                            <div className="days-preview">
                                <div className="days-number">{calcDays(form.startDate, form.endDate) || '—'}</div>
                                <div className="days-label">Days Requested</div>
                            </div>
                        </div>
                        <div className="form-group date-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                min={today}
                                required
                                value={form.startDate}
                                onChange={e => setForm({ ...form, startDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group date-group">
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
                    <div className="form-group remarks-group">
                        <label>Reason / Remarks</label>
                        <textarea
                            rows={4}
                            placeholder="Briefly explain the reason for your leave request..."
                            value={form.reason}
                            onChange={e => setForm({ ...form, reason: e.target.value })}
                        />
                    </div>
                    <div className="lv-form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-center gap-10" disabled={submitting}>
                            {submitting
                                ? <><Loader size={18} className="spin-icon" /> Submitting…</>
                                : <><Check size={18} /> Submit Application</>
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
                .lv-form-card { background: #ffffff !important; border: 1px solid #e5e7eb !important; border-radius: 8px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03) !important; padding: 32px !important; }
                .lv-form-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
                .lv-form-head h3 { font-size: 18px; font-weight: 600; color: #111827; margin: 0; }
                .lv-form { display: flex; flex-direction: column; gap: 24px; }
                .lv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 13px; font-weight: 500; color: #374151; text-transform: none; letter-spacing: 0; }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 10px 14px; background: #ffffff !important; box-sizing: border-box;
                    border: 1px solid #d1d5db !important; border-radius: 6px !important; color: #111827 !important; font-size: 14px !important; font-weight: 400;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease; width: 100%; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
                }
                .form-group input, .form-group select { height: 42px; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
                }
                
                .select-wrapper { position: relative; }
                .form-group select { appearance: none; padding-right: 36px; cursor: pointer; }
                .select-wrapper::after {
                    content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
                    width: 14px; height: 14px; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    background-size: contain; background-repeat: no-repeat;
                }

                .days-preview { display: flex; flex-direction: row; align-items: center; justify-content: flex-start; background: #f9fafb; border-radius: 6px; padding: 0 14px; height: 42px; box-sizing: border-box; border: 1px solid #e5e7eb; color: #374151; font-size: 14px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); }
                .days-number { font-weight: 600; margin-right: 4px; color: #111827; }
                .days-label { font-weight: 400; color: #6b7280; }
                
                .date-group { grid-column: span 1; }
                .remarks-group { margin-top: 0px; }
                .remarks-group textarea { resize: vertical; min-height: 100px; }
                
                .lv-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; border-top: 1px solid #e5e7eb; padding-top: 24px; }
                
                /* Buttons */
                .btn-secondary { background: #ffffff; color: #374151; border: 1px solid #d1d5db; padding: 10px 20px; border-radius: 6px; font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .btn-secondary:hover { background: #f9fafb; color: #111827; }
                .btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .btn-primary:hover { background: #1d4ed8; }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
                
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .gap-10 { gap: 8px; }

                @media (max-width: 768px) {
                    .page-container { padding: 16px 12px; }
                    .lv-form-grid { grid-template-columns: 1fr; }
                    .lv-form-actions { flex-direction: column; }
                    .lv-form-actions button { width: 100%; }
                }
            `}</style>
            </div>
        </motion.div>
    );
};

export default ApplyLeave;
