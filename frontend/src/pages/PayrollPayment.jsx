import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
    CreditCard, ArrowLeft, Banknote, Send, FileText, Wallet,
    CheckCircle, Loader, AlertCircle, User, Calendar, DollarSign,
    Clock, Building2, Hash, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

const PayrollPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [salary, setSalary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [success, setSuccess] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const [form, setForm] = useState({
        paymentMethod: 'UPI',
        paymentDetails: {
            paymentDate: new Date().toISOString().split('T')[0],
            receivedBy: '',
            remarks: '',
            upiId: '',
            transactionId: '',
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            transactionReference: '',
            chequeNumber: '',
            chequeDate: ''
        }
    });

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const fetchSalary = async () => {
            try {
                setLoading(true);
                const { data } = await API.get('/salaries');
                const found = data.find(s => String(s._id) === String(id));
                if (found) {
                    setSalary(found);
                } else {
                    showToast('Payroll record not found', false);
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to load payroll record', false);
            } finally {
                setLoading(false);
            }
        };
        fetchSalary();
    }, [id]);

    const updateField = (field, value) => {
        setForm(prev => ({
            ...prev,
            paymentDetails: { ...prev.paymentDetails, [field]: value }
        }));
    };

    const isFormValid = () => {
        const m = form.paymentMethod;
        const pd = form.paymentDetails;
        if (m === 'UPI') return pd.upiId && pd.transactionId && pd.paymentDate;
        if (m === 'Bank Transfer') return pd.bankName && pd.accountNumber && pd.ifscCode && pd.transactionReference && pd.paymentDate;
        if (m === 'Cheque') return pd.chequeNumber && pd.bankName && pd.chequeDate;
        if (m === 'Cash') return pd.receivedBy && pd.paymentDate;
        return false;
    };

    const handleSubmit = async () => {
        if (!salary || !isFormValid()) return;
        setSubmitting(true);
        try {
            const { data } = await API.put(`/salaries/${salary._id}/pay`, {
                paymentMethod: form.paymentMethod,
                paymentDetails: form.paymentDetails
            });
            setReceipt({
                employeeName: salary.employee ? `${salary.employee.firstName || ''} ${salary.employee.lastName || ''}`.trim() : 'Employee',
                month: salary.month,
                netSalary: salary.netSalary,
                transactionId: data.transactionId,
                paymentMethod: form.paymentMethod,
                paymentDate: new Date().toLocaleString()
            });
            setSuccess(true);
            showToast(data.message || 'Payment processed successfully');
        } catch (err) {
            showToast(err.response?.data?.message || 'Payment failed', false);
        } finally {
            setSubmitting(false);
        }
    };

    const methodIcons = {
        'UPI': <Send size={18} />,
        'Bank Transfer': <Banknote size={18} />,
        'Cheque': <FileText size={18} />,
        'Cash': <Wallet size={18} />
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader size={32} className="spin-icon" style={{ color: '#3b82f6' }} />
            </div>
        );
    }

    if (!salary) {
        return (
            <div style={{ padding: '30px' }}>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
                    <h2 style={{ color: '#0f172a', fontSize: '20px', marginBottom: '8px' }}>Payroll Record Not Found</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>The requested payroll record does not exist or has been deleted.</p>
                    <button onClick={() => navigate('/payroll')} className="rd-back-btn" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '10px 24px', margin: '0 auto' }}>
                        <ArrowLeft size={16} /> Back to Payroll
                    </button>
                </div>
            </div>
        );
    }

    const employeeName = salary.employee ? `${salary.employee.firstName || ''} ${salary.employee.lastName || ''}`.trim() : 'Employee';
    const employeeId = salary.employee?.employeeId || '—';
    const department = salary.employee?.department || 'N/A';

    // ── SUCCESS RECEIPT VIEW ──
    if (success && receipt) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}
            >
                {toast && (
                    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '0px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toast.ok ? '#10b981' : '#ef4444', }}>
                        {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                        {toast.msg}
                    </div>
                )}

                <div className="premium-card" style={{ borderRadius: '0px', overflow: 'hidden' }}>
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }}>
                        <div style={{ width: '72px', height: '72px', background: '#10b981', color: 'white', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', }}>
                            <CheckCircle size={36} />
                        </div>
                        <h2 style={{ margin: '0 0 8px', color: '#064e3b', fontSize: '22px', fontWeight: 800 }}>Payment Successful!</h2>
                        <p style={{ margin: 0, color: '#047857', fontSize: '14px' }}>Salary has been disbursed successfully</p>
                    </div>

                    <div style={{ padding: '28px' }}>
                        {[
                            { label: 'Employee', value: receipt.employeeName },
                            { label: 'Payroll Month', value: receipt.month },
                            { label: 'Amount Paid', value: `₹${(receipt.netSalary || 0).toLocaleString()}`, highlight: true },
                            { label: 'Payment Method', value: receipt.paymentMethod },
                            { label: 'Transaction ID', value: receipt.transactionId || 'N/A' },
                            { label: 'Payment Date', value: receipt.paymentDate }
                        ].map((row, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none' }}>
                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{row.label}</span>
                                <span style={{ fontSize: '14px', color: row.highlight ? '#10b981' : '#0f172a', fontWeight: row.highlight ? 800 : 600 }}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '16px 28px 28px', display: 'flex', gap: '12px' }}>
                        <button onClick={() => navigate('/payroll')} className="rd-back-btn" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '12px', flex: 1, justifyContent: 'center' }}>
                            <ArrowLeft size={16} /> Back to Payroll
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── MAIN PAYMENT FORM VIEW ──
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: '30px' }}
        >
            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '0px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toast.ok ? '#10b981' : '#ef4444', }}>
                    {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Back Button + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => navigate('/payroll')} className="rd-back-btn icon-only">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <PageHeader title="Process Salary Payment" badge="HRMS" subtitle="Complete payment details and confirm disbursement" />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '1100px' }}>
                {/* LEFT: Employee & Payroll Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Employee Card */}
                    <div className="premium-card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={16} style={{ color: '#3b82f6' }} />
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>Employee Details</h3>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '0px', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, flexShrink: 0 }}>
                                    {employeeName[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{employeeName}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{employeeId} • {department}</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { label: 'Payroll Month', value: salary.month, icon: <Calendar size={14} /> },
                                    { label: 'Status', value: salary.status, icon: <Clock size={14} /> }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '0px', }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                                            {item.icon} {item.label}
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Salary Breakdown Card */}
                    <div className="premium-card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DollarSign size={16} style={{ color: '#10b981' }} />
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>Salary Breakdown</h3>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {[
                                { label: 'Basic Salary', value: `₹${(salary.basicSalary || 0).toLocaleString()}`, color: '#0f172a' },
                                { label: 'Allowances', value: `+₹${(salary.allowances || 0).toLocaleString()}`, color: '#10b981' },
                                { label: 'Deductions', value: `-₹${(salary.deductions || 0).toLocaleString()}`, color: '#ef4444' }
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{row.label}</span>
                                    <span style={{ fontSize: '14px', color: row.color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{row.value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 4px', marginTop: '4px' }}>
                                <span style={{ fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>Net Pay</span>
                                <span style={{ fontSize: '22px', color: '#3b82f6', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>₹{(salary.netSalary || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Payment Form */}
                <div className="premium-card" style={{ overflow: 'hidden', alignSelf: 'start' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={16} style={{ color: '#8b5cf6' }} />
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>Payment Details</h3>
                    </div>
                    <div style={{ padding: '20px' }}>
                        {/* Payment Method Selection */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {['UPI', 'Bank Transfer', 'Cheque', 'Cash'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setForm(prev => ({
                                            ...prev,
                                            paymentMethod: m,
                                            paymentDetails: {
                                                ...prev.paymentDetails,
                                                paymentDate: new Date().toISOString().split('T')[0],
                                                chequeDate: m === 'Cheque' ? new Date().toISOString().split('T')[0] : prev.paymentDetails.chequeDate
                                            }
                                        }))}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                            padding: '12px 6px', borderRadius: '0px', cursor: 'pointer',
                                            fontSize: '11px', fontWeight: 600, transition: 'all 0.2s',
                                            border: form.paymentMethod === m ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                            background: form.paymentMethod === m ? '#eef2ff' : '#fff',
                                            color: form.paymentMethod === m ? '#4f46e5' : '#64748b'
                                        }}
                                    >
                                        {methodIcons[m]}
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{m}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Fields */}
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '0px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {form.paymentMethod === 'UPI' && (
                                <>
                                    <FieldRow icon={<Send size={14} />} label="UPI ID *" placeholder="e.g. name@upi" value={form.paymentDetails.upiId} onChange={v => updateField('upiId', v)} />
                                    <FieldRow icon={<Hash size={14} />} label="Transaction ID *" placeholder="TXN123456" value={form.paymentDetails.transactionId} onChange={v => updateField('transactionId', v)} />
                                </>
                            )}
                            {form.paymentMethod === 'Bank Transfer' && (
                                <>
                                    <FieldRow icon={<Building2 size={14} />} label="Bank Name *" placeholder="HDFC, SBI, etc." value={form.paymentDetails.bankName} onChange={v => updateField('bankName', v)} />
                                    <FieldRow icon={<Hash size={14} />} label="Account Number *" placeholder="Account No" value={form.paymentDetails.accountNumber} onChange={v => updateField('accountNumber', v)} />
                                    <FieldRow icon={<Hash size={14} />} label="IFSC Code *" placeholder="IFSC" value={form.paymentDetails.ifscCode} onChange={v => updateField('ifscCode', v)} />
                                    <FieldRow icon={<Hash size={14} />} label="Transaction Ref *" placeholder="Ref Number" value={form.paymentDetails.transactionReference} onChange={v => updateField('transactionReference', v)} />
                                </>
                            )}
                            {form.paymentMethod === 'Cheque' && (
                                <>
                                    <FieldRow icon={<Hash size={14} />} label="Cheque Number *" placeholder="000123" value={form.paymentDetails.chequeNumber} onChange={v => updateField('chequeNumber', v)} />
                                    <FieldRow icon={<Building2 size={14} />} label="Bank Name *" placeholder="HDFC, SBI, etc." value={form.paymentDetails.bankName} onChange={v => updateField('bankName', v)} />
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                            <Calendar size={14} /> Cheque Date *
                                        </label>
                                        <input type="date" value={form.paymentDetails.chequeDate} onChange={e => updateField('chequeDate', e.target.value)}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '0px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                                    </div>
                                </>
                            )}
                            {form.paymentMethod === 'Cash' && (
                                <FieldRow icon={<User size={14} />} label="Received By *" placeholder="Person receiving cash" value={form.paymentDetails.receivedBy} onChange={v => updateField('receivedBy', v)} />
                            )}

                            {/* Common fields */}
                            {form.paymentMethod !== 'Cheque' && (
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                        <Calendar size={14} /> Payment Date *
                                    </label>
                                    <input type="date" value={form.paymentDetails.paymentDate} onChange={e => updateField('paymentDate', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '0px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                    <MessageSquare size={14} /> Remarks
                                </label>
                                <input type="text" placeholder="Optional" value={form.paymentDetails.remarks} onChange={e => updateField('remarks', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '0px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button onClick={() => navigate('/payroll')}
                            style={{ padding: '10px 24px', background: '#fff', color: '#475569', borderRadius: '0px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={submitting || !isFormValid()}
                            style={{
                                padding: '10px 28px', borderRadius: '0px', border: 'none',
                                fontSize: '14px', fontWeight: 600, cursor: isFormValid() ? 'pointer' : 'not-allowed',
                                display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                                background: isFormValid() ? '#10b981' : '#cbd5e1',
                                color: '#fff',
                                boxShadow: isFormValid() ? '0 4px 14px rgba(16,185,129,0.3)' : 'none'
                            }}
                            onMouseEnter={e => { if (isFormValid()) e.currentTarget.style.background = '#059669'; }}
                            onMouseLeave={e => { if (isFormValid()) e.currentTarget.style.background = '#10b981'; }}>
                            {submitting ? (
                                <><Loader size={16} className="spin-icon" /> Processing...</>
                            ) : (
                                <><CreditCard size={16} /> Confirm Payment</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-icon { animation: spin 1s linear infinite; }
            `}</style>
        </motion.div>
    );
};

// Reusable Field Row Component
const FieldRow = ({ icon, label, placeholder, value, onChange }) => (
    <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            {icon} {label}
        </label>
        <input type="text" placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '0px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
    </div>
);

export default PayrollPayment;
