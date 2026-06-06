import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { DollarSign, FileText, Download, TrendingUp, X, CheckCircle, Clock, Loader, User, AlertCircle, Check, CreditCard, Banknote, Send, Wallet, ArrowRight, BadgeCheck, Receipt } from 'lucide-react';
import { generatePayslipPDF } from '../utils/pdfGenerator';

const Payroll = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenModal, setShowGenModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showPayAllModal, setShowPayAllModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [paymentReceipt, setPaymentReceipt] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [paying, setPaying] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [toast, setToast] = useState(null);
    const [calcStats, setCalcStats] = useState(null);
    const [calculating, setCalculating] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';
    const isHR = userInfo.role === 'HR';
    const canPay = isAdmin || isHR;

    const [formData, setFormData] = useState({
        employeeId: '',
        month: `${new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`,
        basicSalary: '',
        allowances: 0,
        deductions: 0
    });

    const [payForm, setPayForm] = useState({
        paymentMethod: 'Bank Transfer',
        bankRef: '',
        notes: ''
    });

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [salRes, empRes] = await Promise.all([
                API.get('/salaries'),
                API.get('/employees')
            ]);
            setSalaries(salRes.data);
            setEmployees(empRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/salaries', formData);
            setShowGenModal(false);
            setFormData({
                employeeId: '',
                month: `${new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`,
                basicSalary: '',
                allowances: 0,
                deductions: 0
            });
            setCalcStats(null);
            fetchData();
            showToast('Payroll entry generated successfully.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error generating payroll', false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCalculateDeductions = async () => {
        if (!formData.employeeId || !formData.month || !formData.basicSalary) {
            return showToast('Please select an employee and enter basic salary first', false);
        }
        setCalculating(true);
        try {
            const { data } = await API.post('/salaries/calculate-deductions', {
                employeeId: formData.employeeId,
                month: formData.month,
                basicSalary: Number(formData.basicSalary)
            });
            setCalcStats(data);
            setFormData({ ...formData, deductions: data.suggestedDeduction || 0 });
            showToast(`Calculated: ${data.absentDays} Absents, ${data.lateDays} Lates`);
        } catch (err) {
            showToast(err.response?.data?.message || 'Error calculating deductions', false);
        } finally {
            setCalculating(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await API.put(`/salaries/${id}/approve`);
            fetchData();
            if (selectedSalary?._id === id) setShowViewModal(false);
            showToast('Salary approved successfully.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error approving payroll', false);
        }
    };

    // ─── Pay Individual ─────────────────────────────────
    const handleOpenPayModal = (s) => {
        setSelectedSalary(s);
        setPayForm({ paymentMethod: 'Bank Transfer', bankRef: '', notes: '' });
        setShowPayModal(true);
    };

    const handlePaySalary = async () => {
        if (!selectedSalary) return;
        setPaying(true);
        try {
            const { data } = await API.put(`/salaries/${selectedSalary._id}/pay`, payForm);
            setShowPayModal(false);
            setPaymentReceipt({
                employeeName: selectedSalary.employee?.userId?.name || 'Employee',
                month: selectedSalary.month,
                netSalary: selectedSalary.netSalary,
                transactionId: data.transactionId,
                paymentMethod: payForm.paymentMethod,
                paymentDate: new Date().toLocaleString()
            });
            setShowReceiptModal(true);
            fetchData();
            showToast(data.message);
        } catch (err) {
            showToast(err.response?.data?.message || 'Payment failed', false);
        } finally {
            setPaying(false);
        }
    };

    // ─── Pay All Approved ─────────────────────────────────
    const handlePayAll = async () => {
        setPaying(true);
        try {
            const { data } = await API.put('/salaries/pay-all');
            setShowPayAllModal(false);
            fetchData();
            showToast(data.message);
        } catch (err) {
            showToast(err.response?.data?.message || 'Bulk payment failed', false);
        } finally {
            setPaying(false);
        }
    };

    const handleViewDetails = (s) => {
        setSelectedSalary(s);
        setShowViewModal(true);
    };

    const handleDownload = async (record) => {
        try {
            setDownloading(true);
            const employeeName = record.employee?.userId?.name || record.employee?.firstName || 'Employee';
            await generatePayslipPDF(record, employeeName);
            showToast('Payslip downloaded.');
        } catch (error) {
            console.error('Error downloading payslip:', error);
            showToast('Failed to generate payslip', false);
        } finally {
            setDownloading(false);
        }
    };

    const stats = {
        total: salaries.reduce((acc, curr) => acc + (curr.netSalary || 0), 0),
        paid: salaries.filter(s => s.status === 'Paid').length,
        approved: salaries.filter(s => s.status === 'Approved').length,
        pending: salaries.filter(s => s.status === 'Awaiting Approval').length,
        approvedTotal: salaries.filter(s => s.status === 'Approved').reduce((acc, s) => acc + (s.netSalary || 0), 0),
        paidTotal: salaries.filter(s => s.status === 'Paid').reduce((acc, s) => acc + (s.netSalary || 0), 0)
    };

    return (
        <div className="module-container">

            {/* Toast */}
            {toast && (
                <div className={`pay-toast ${toast.ok ? 'ok' : 'err'}`}>
                    {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Payroll Management</h1>
                    <p className="text-muted">Process monthly salaries, approve, and disburse payments to employees.</p>
                </div>
                {canPay && (
                    <div className="header-actions">
                        {stats.approved > 0 && (
                            <button className="btn-pay-all flex-center gap-10" onClick={() => setShowPayAllModal(true)}>
                                <Banknote size={18} /> Pay All Approved ({stats.approved})
                            </button>
                        )}
                        <button className="btn-primary flex-center gap-10" onClick={() => setShowGenModal(true)}>
                            <TrendingUp size={18} /> Generate Payroll
                        </button>
                    </div>
                )}
            </header>

            {/* ── Summary Cards ── */}
            <div className="payroll-summary-grid">
                <div className="glass-card p-stat">
                    <div className="stat-icon-wrap" style={{ '--sc': 'var(--primary)' }}>
                        <Wallet size={22} />
                    </div>
                    <div>
                        <p>Total Disbursement</p>
                        <h3>₹{stats.total.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="glass-card p-stat">
                    <div className="stat-icon-wrap" style={{ '--sc': '#10b981' }}>
                        <BadgeCheck size={22} />
                    </div>
                    <div>
                        <p>Paid</p>
                        <h3 className="text-success">{stats.paid} <span className="stat-sub">₹{stats.paidTotal.toLocaleString()}</span></h3>
                    </div>
                </div>
                <div className="glass-card p-stat">
                    <div className="stat-icon-wrap" style={{ '--sc': '#6366f1' }}>
                        <Check size={22} />
                    </div>
                    <div>
                        <p>Approved (Ready to Pay)</p>
                        <h3 className="text-primary">{stats.approved} <span className="stat-sub">₹{stats.approvedTotal.toLocaleString()}</span></h3>
                    </div>
                </div>
                <div className="glass-card p-stat">
                    <div className="stat-icon-wrap" style={{ '--sc': '#f59e0b' }}>
                        <Clock size={22} />
                    </div>
                    <div>
                        <p>Pending Approval</p>
                        <h3 className={stats.pending > 0 ? "text-warning" : ""}>{stats.pending}</h3>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="module-content mt-30">
                {loading ? (
                    <div className="flex-center p-50"><Loader size={30} className="spin-icon"/></div>
                ) : (
                    <DataTable 
                        title="Employee Salary Ledger"
                        headers={['Employee', 'Month', 'Base', 'Adjustments', 'Net Pay', 'Status', 'Action']}
                        data={salaries}
                        renderRow={(s) => (
                            <tr key={s._id}>
                                <td>
                                    <div className="emp-cell">
                                        <div className="emp-avatar"><User size={14}/></div>
                                        <div>
                                            <strong>{s.employee ? `${s.employee.firstName || ''} ${s.employee.lastName || ''}`.trim() : 'Unknown'}</strong>
                                            <p className="text-muted small">{s.employee?.department || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{s.month}</td>
                                <td>₹{(s.basicSalary || 0).toLocaleString()}</td>
                                <td>
                                    <div className="adj-cell">
                                        <span className="text-success">+₹{(s.allowances || 0).toLocaleString()}</span>
                                        <span className="text-danger">-₹{(s.deductions || 0).toLocaleString()}</span>
                                    </div>
                                </td>
                                <td><strong className="text-primary">₹{(s.netSalary || 0).toLocaleString()}</strong></td>
                                <td>
                                    <div className={`status-pill ${s.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {s.status === 'Paid' ? <CheckCircle size={14}/> : s.status === 'Approved' ? <Check size={14}/> : <Clock size={14}/>}
                                        {s.status}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex-center gap-5">
                                        <button className="btn-table-action" onClick={() => handleViewDetails(s)}>Details</button>
                                        {isAdmin && s.status === 'Awaiting Approval' && (
                                            <button className="btn-table-action approve-btn" onClick={() => handleApprove(s._id)}>Approve</button>
                                        )}
                                        {canPay && s.status === 'Approved' && (
                                            <button className="btn-table-action pay-btn" onClick={() => handleOpenPayModal(s)}>
                                                <CreditCard size={13} /> Pay
                                            </button>
                                        )}
                                        {s.status === 'Paid' && (
                                            <button className="btn-table-action paid-badge-btn" disabled>
                                                <BadgeCheck size={13} /> Paid
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    />
                )}
            </div>

            {/* ═══════════════════ GENERATE MODAL ═══════════════════ */}
            {showGenModal && (
                <div className="modal-overlay" onClick={() => setShowGenModal(false)}>
                    <div className="glass-card modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Generate New Payroll Entry</h3>
                            <button className="close-btn" onClick={() => setShowGenModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-30">
                            <div className="form-group">
                                <label>Select Employee</label>
                                <select required value={formData.employeeId} onChange={e => {
                                    setFormData({...formData, employeeId: e.target.value, basicSalary: employees.find(emp => String(emp._id || emp.id) === e.target.value)?.salary || formData.basicSalary});
                                    setCalcStats(null);
                                }}>
                                    <option value="">Choose...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.firstName} {emp.lastName || ''} ({emp.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-grid mt-20">
                                <div className="form-group">
                                    <label>Month / Period</label>
                                    <input type="text" required value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Basic Salary (₹)</label>
                                    <input type="number" required value={formData.basicSalary} onChange={e => setFormData({...formData, basicSalary: Number(e.target.value)})} placeholder="Enter amount" />
                                </div>
                            </div>
                            <div className="form-grid mt-20">
                                <div className="form-group">
                                    <label>Allowances (₹)</label>
                                    <input type="number" value={formData.allowances} onChange={e => setFormData({...formData, allowances: Number(e.target.value)})} />
                                </div>
                                <div className="form-group">
                                    <label>Deductions (₹)</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="number" style={{ flex: 1 }} value={formData.deductions} onChange={e => setFormData({...formData, deductions: Number(e.target.value)})} />
                                        <button type="button" className="btn-secondary" style={{ padding: '0 15px', whiteSpace: 'nowrap' }} onClick={handleCalculateDeductions} disabled={calculating}>
                                            {calculating ? '...' : 'Auto-Calc'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {calcStats && (
                                <div className="calc-stats-box mt-10">
                                    <div className="flex-between"><span>Total Days:</span> <strong>{calcStats.daysInMonth}</strong></div>
                                    <div className="flex-between"><span>Present:</span> <strong className="text-success">{calcStats.presentDays}</strong></div>
                                    <div className="flex-between"><span>Absent:</span> <strong className="text-danger">{calcStats.absentDays}</strong></div>
                                    <div className="flex-between"><span>Late:</span> <strong className="text-warning">{calcStats.lateDays}</strong></div>
                                </div>
                            )}

                            {formData.basicSalary > 0 && (
                                <div className="net-preview mt-20">
                                    <span>Net Payable:</span>
                                    <strong>₹{((formData.basicSalary || 0) + (formData.allowances || 0) - (formData.deductions || 0)).toLocaleString()}</strong>
                                </div>
                            )}
                            <div className="modal-actions mt-30">
                                <button type="button" className="btn-cancel" onClick={() => setShowGenModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Processing...' : 'Submit for Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════ PAY INDIVIDUAL MODAL ═══════════════════ */}
            {showPayModal && selectedSalary && (
                <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
                    <div className="glass-card modal-content animate-pop pay-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header pay-header">
                            <div className="flex-center gap-10">
                                <div className="pay-header-icon"><CreditCard size={20} /></div>
                                <div>
                                    <h3>Disburse Salary</h3>
                                    <p className="text-muted small">Confirm payment to employee</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setShowPayModal(false)}>✕</button>
                        </div>
                        <div className="p-30">
                            {/* Employee Info Card */}
                            <div className="pay-emp-card">
                                <div className="pay-emp-avatar">
                                    <User size={22} />
                                </div>
                                <div className="pay-emp-info">
                                    <h4>{selectedSalary.employee ? `${selectedSalary.employee.firstName || ''} ${selectedSalary.employee.lastName || ''}`.trim() || 'Employee' : 'Employee'}</h4>
                                    <span>{selectedSalary.employee?.department || 'N/A'} • {selectedSalary.month}</span>
                                </div>
                                <div className="pay-emp-amount">
                                    <span className="label">Net Payable</span>
                                    <h2>₹{(selectedSalary.netSalary || 0).toLocaleString()}</h2>
                                </div>
                            </div>

                            {/* Salary Breakdown */}
                            <div className="pay-breakdown">
                                <div className="pay-break-row">
                                    <span>Basic Salary</span>
                                    <span>₹{(selectedSalary.basicSalary || 0).toLocaleString()}</span>
                                </div>
                                <div className="pay-break-row">
                                    <span>Allowances</span>
                                    <span className="text-success">+₹{(selectedSalary.allowances || 0).toLocaleString()}</span>
                                </div>
                                <div className="pay-break-row">
                                    <span>Deductions</span>
                                    <span className="text-danger">-₹{(selectedSalary.deductions || 0).toLocaleString()}</span>
                                </div>
                                <div className="pay-break-row total">
                                    <span>Net Amount</span>
                                    <span>₹{(selectedSalary.netSalary || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="form-group mt-20">
                                <label>Payment Method</label>
                                <div className="pay-method-grid">
                                    {['Bank Transfer', 'UPI', 'Cheque', 'Cash'].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`pay-method-btn ${payForm.paymentMethod === m ? 'active' : ''}`}
                                            onClick={() => setPayForm({ ...payForm, paymentMethod: m })}
                                        >
                                            {m === 'Bank Transfer' && <Banknote size={16} />}
                                            {m === 'UPI' && <Send size={16} />}
                                            {m === 'Cheque' && <FileText size={16} />}
                                            {m === 'Cash' && <Wallet size={16} />}
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group mt-20">
                                <label>Reference / Notes (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Bank ref, cheque number, etc."
                                    value={payForm.bankRef}
                                    onChange={e => setPayForm({ ...payForm, bankRef: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowPayModal(false)}>Cancel</button>
                            <button className="btn-pay-confirm" onClick={handlePaySalary} disabled={paying}>
                                {paying ? (
                                    <><Loader size={16} className="spin-icon" /> Processing...</>
                                ) : (
                                    <><CreditCard size={16} /> Confirm & Pay ₹{(selectedSalary.netSalary || 0).toLocaleString()}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════ PAY ALL MODAL ═══════════════════ */}
            {showPayAllModal && (
                <div className="modal-overlay" onClick={() => setShowPayAllModal(false)}>
                    <div className="glass-card modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header pay-header">
                            <div className="flex-center gap-10">
                                <div className="pay-header-icon bulk"><Banknote size={20} /></div>
                                <h3>Bulk Salary Disbursement</h3>
                            </div>
                            <button className="close-btn" onClick={() => setShowPayAllModal(false)}>✕</button>
                        </div>
                        <div className="p-30">
                            <div className="bulk-pay-summary">
                                <div className="bulk-stat">
                                    <span>Employees</span>
                                    <h3>{stats.approved}</h3>
                                </div>
                                <div className="bulk-arrow"><ArrowRight size={20} /></div>
                                <div className="bulk-stat total">
                                    <span>Total Amount</span>
                                    <h3>₹{stats.approvedTotal.toLocaleString()}</h3>
                                </div>
                            </div>

                            <div className="bulk-emp-list">
                                <p className="label mb-10">Employees to be paid:</p>
                                {salaries.filter(s => s.status === 'Approved').map(s => (
                                    <div key={s._id} className="bulk-emp-row">
                                        <div className="flex-center gap-10">
                                            <div className="emp-avatar sm"><User size={12}/></div>
                                            <span>{s.employee?.userId?.name || s.employee?.firstName || 'Employee'}</span>
                                        </div>
                                        <strong>₹{(s.netSalary || 0).toLocaleString()}</strong>
                                    </div>
                                ))}
                            </div>

                            <div className="bulk-warning">
                                <AlertCircle size={16} />
                                <span>This will mark <strong>{stats.approved}</strong> salary records as paid and notify all employees.</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowPayAllModal(false)}>Cancel</button>
                            <button className="btn-pay-confirm" onClick={handlePayAll} disabled={paying}>
                                {paying ? (
                                    <><Loader size={16} className="spin-icon" /> Processing...</>
                                ) : (
                                    <><Banknote size={16} /> Pay All ₹{stats.approvedTotal.toLocaleString()}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════ RECEIPT MODAL ═══════════════════ */}
            {showReceiptModal && paymentReceipt && (
                <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
                    <div className="glass-card modal-content animate-pop receipt-modal" onClick={e => e.stopPropagation()}>
                        <div className="receipt-header">
                            <div className="receipt-check-circle">
                                <CheckCircle size={40} />
                            </div>
                            <h2>Payment Successful!</h2>
                            <p className="text-muted">Salary has been disbursed</p>
                        </div>
                        <div className="receipt-body">
                            <div className="receipt-row">
                                <span>Employee</span>
                                <strong>{paymentReceipt.employeeName}</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Period</span>
                                <strong>{paymentReceipt.month}</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Amount</span>
                                <strong className="text-success">₹{paymentReceipt.netSalary.toLocaleString()}</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Method</span>
                                <strong>{paymentReceipt.paymentMethod}</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Transaction ID</span>
                                <strong className="txn-id">{paymentReceipt.transactionId}</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Date</span>
                                <strong>{paymentReceipt.paymentDate}</strong>
                            </div>
                        </div>
                        <div className="receipt-footer">
                            <button className="btn-primary" onClick={() => setShowReceiptModal(false)}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════ DETAILS MODAL ═══════════════════ */}
            {showViewModal && selectedSalary && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="glass-card payslip-modal-admin animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="flex-center gap-10">
                                <FileText className="text-primary" />
                                <h3>Payroll Details: {selectedSalary.employee?.userId?.name || selectedSalary.employee?.firstName}</h3>
                            </div>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="ps-section">
                                <p className="label">Month</p>
                                <p className="val">{selectedSalary.month}</p>
                            </div>
                            <div className="ps-grid">
                                <div className="ps-box">
                                    <p className="label">Basic</p>
                                    <p className="val">₹{(selectedSalary.basicSalary || 0).toLocaleString()}</p>
                                </div>
                                <div className="ps-box">
                                    <p className="label">Allowances</p>
                                    <p className="val text-success">+₹{(selectedSalary.allowances || 0).toLocaleString()}</p>
                                </div>
                                <div className="ps-box">
                                    <p className="label">Deductions</p>
                                    <p className="val text-danger">-₹{(selectedSalary.deductions || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="ps-total-row">
                                <div>
                                    <p className="label">NET PAYABLE</p>
                                    <h2>₹{(selectedSalary.netSalary || 0).toLocaleString()}</h2>
                                </div>
                                <div className={`status-tag ${selectedSalary.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {selectedSalary.status}
                                </div>
                            </div>
                            {selectedSalary.transactionId && (
                                <div className="ps-txn-info mt-20">
                                    <Receipt size={16} />
                                    <span>Transaction: <strong>{selectedSalary.transactionId}</strong></span>
                                    {selectedSalary.paymentDate && (
                                        <span className="text-muted">• Paid on {new Date(selectedSalary.paymentDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            {selectedSalary.status === 'Paid' ? (
                                <button className="btn-download-payslip" onClick={() => handleDownload(selectedSalary)} disabled={downloading}>
                                    <Download size={18} /> {downloading ? 'Generating...' : 'Download Payslip'}
                                </button>
                            ) : (
                                <span className="payslip-pending-msg">
                                    <Clock size={14} /> Payslip available after payment
                                </span>
                            )}
                            {isAdmin && selectedSalary.status === 'Awaiting Approval' && (
                                <button className="btn-primary" style={{background: '#10b981', borderColor: '#10b981'}} onClick={() => handleApprove(selectedSalary._id)}>
                                    Approve Now
                                </button>
                            )}
                            {canPay && selectedSalary.status === 'Approved' && (
                                <button className="btn-pay-confirm" onClick={() => { setShowViewModal(false); handleOpenPayModal(selectedSalary); }}>
                                    <CreditCard size={16} /> Pay Now
                                </button>
                            )}
                            <button className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .module-container { padding: 30px; position: relative; color: var(--text-primary); }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 16px; }
                .title-gradient { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0; letter-spacing: -0.5px; }
                .text-muted { color: var(--text-muted) !important; font-size: 14px; margin: 0; }
                .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
                
                .payroll-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                .p-stat { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); padding: 24px; display: flex; align-items: center; gap: 18px; box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s; }
                .p-stat:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
                .p-stat p { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
                .p-stat h3 { font-size: 24px; font-weight: 800; color: var(--text-primary); }
                .stat-sub { font-size: 13px; color: var(--text-muted); font-weight: 500; }
                .stat-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: color-mix(in srgb, var(--sc) 12%, transparent); color: var(--sc); border: 1px solid color-mix(in srgb, var(--sc) 20%, transparent); }
                
                .emp-cell { display: flex; align-items: center; gap: 12px; }
                .emp-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary-50); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700; }
                .emp-avatar.sm { width: 26px; height: 26px; }
                .small { font-size: 11px; }

                .adj-cell { display: flex; flex-direction: column; font-size: 13px; font-weight: 600; }
                
                .status-pill { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 6px 12px; border-radius: 20px; width: fit-content; letter-spacing: 0.5px; }
                .status-pill.paid { background: var(--success-light); color: var(--success); }
                .status-pill.approved { background: var(--primary-50); color: var(--primary); }
                .status-pill.awaiting-approval { background: var(--warning-light); color: var(--warning); }

                .payslip-pending-msg { display: flex; align-items: center; gap: 8px; color: var(--warning); font-size: 13px; font-weight: 600; background: var(--warning-light); padding: 10px 16px; border-radius: 8px; }

                .btn-table-action { background: var(--bg-body); color: var(--text-primary); border: 1px solid var(--border); font-size: 13px; padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s; font-weight: 600; }
                .btn-table-action:hover { background: var(--bg-hover); transform: translateY(-1px); }
                .approve-btn { background: var(--success-light); color: var(--success); border-color: transparent; }
                .approve-btn:hover { background: color-mix(in srgb, var(--success) 20%, transparent); border-color: var(--success); }
                .pay-btn { background: var(--primary-50); color: var(--primary); border-color: transparent; }
                .pay-btn:hover { background: var(--primary-100); border-color: var(--primary); color: var(--primary); }
                .paid-badge-btn { background: var(--success-light); color: var(--success); border-color: transparent; cursor: default !important; opacity: 0.8; }

                .btn-primary { background: var(--primary); color: #ffffff; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); display: inline-flex; align-items: center; cursor: pointer; border: none; transition: all 0.2s; }
                .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }

                .btn-pay-all { background: linear-gradient(135deg, var(--success) 0%, #059669 100%); color: white; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); display: flex; align-items: center; }
                .btn-pay-all:hover { box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5); transform: translateY(-1px); }

                .btn-pay-confirm { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
                .btn-pay-confirm:hover { box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5); transform: translateY(-1px); }
                .btn-pay-confirm:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

                .btn-download-payslip {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 14px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }
                .btn-download-payslip:hover {
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
                }
                .btn-download-payslip:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .mt-20 { margin-top: 20px; }
                .mt-30 { margin-top: 30px; }
                .mb-10 { margin-bottom: 10px; }
                .p-30 { padding: 30px; }

                .flex-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 13px; }
                .calc-stats-box { background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
                .btn-secondary { background: var(--bg-body); color: var(--text-primary); border: 1px solid var(--border); border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-secondary:hover { background: var(--bg-hover); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-content, .glass-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); box-shadow: var(--shadow-lg); overflow-y: auto; }
                .modal-content { width: 100%; max-width: 550px; max-height: 90vh; }
                .pay-modal { max-width: 580px; }
                .receipt-modal { max-width: 440px; }
                .payslip-modal-admin { width: 100%; max-width: 600px; max-height: 90vh; }
                .modal-header { padding: 20px 28px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .modal-header h3 { font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0; }
                .close-btn { background: none; color: var(--text-muted); cursor: pointer; font-size: 20px; border: none; padding: 4px; border-radius: 6px; transition: background 0.2s; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
                
                .pay-header-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-50); color: var(--primary); display: flex; align-items: center; justify-content: center; }
                .pay-header-icon.bulk { background: var(--success-light); color: var(--success); }

                /* Pay Employee Card */
                .pay-emp-card { display: flex; align-items: center; gap: 16px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
                .pay-emp-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .pay-emp-info { flex: 1; }
                .pay-emp-info h4 { font-size: 18px; margin: 0 0 4px 0; font-weight: 700; color: var(--text-primary); }
                .pay-emp-info span { font-size: 13px; color: var(--text-muted); }
                .pay-emp-amount { text-align: right; }
                .pay-emp-amount .label { font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; font-weight: 700; }
                .pay-emp-amount h2 { font-size: 26px; color: var(--success); margin: 4px 0 0 0; font-weight: 800; }

                /* Breakdown */
                .pay-breakdown { background: var(--bg-body); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
                .pay-break-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: var(--text-muted); font-weight: 500; }
                .pay-break-row.total { border-top: 1px dashed var(--border); margin-top: 12px; padding-top: 16px; font-weight: 800; color: var(--text-primary); font-size: 18px; }

                /* Payment Methods */
                .pay-method-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
                .pay-method-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 10px; color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .pay-method-btn:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--border-hover); }
                .pay-method-btn.active { background: var(--primary-50); border-color: var(--primary); color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }

                /* Bulk Pay */
                .bulk-pay-summary { display: flex; align-items: center; justify-content: center; gap: 24px; padding: 28px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 14px; margin-bottom: 24px; }
                .bulk-stat { text-align: center; }
                .bulk-stat span { font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
                .bulk-stat h3 { font-size: 28px; margin: 8px 0 0 0; font-weight: 800; color: var(--text-primary); }
                .bulk-stat.total h3 { color: var(--success); }
                .bulk-arrow { color: var(--text-muted); }
                .bulk-emp-list { max-height: 220px; overflow-y: auto; border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 20px; background: var(--bg-body); }
                .bulk-emp-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 4px; border-bottom: 1px solid var(--border); font-size: 14px; font-weight: 500; color: var(--text-primary); }
                .bulk-emp-row:last-child { border-bottom: none; }
                .bulk-warning { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--warning-light); border: 1px solid color-mix(in srgb, var(--warning) 20%, transparent); border-radius: 12px; font-size: 14px; color: var(--warning); font-weight: 500; }

                /* Receipt */
                .receipt-header { text-align: center; padding: 36px 30px 16px; }
                .receipt-check-circle { width: 76px; height: 76px; border-radius: 50%; background: var(--success-light); color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
                .receipt-header h2 { font-size: 24px; margin: 0 0 8px 0; font-weight: 800; color: var(--text-primary); }
                .receipt-body { padding: 16px 30px 24px; }
                .receipt-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); font-size: 15px; font-weight: 500; color: var(--text-primary); }
                .receipt-row span { color: var(--text-muted); }
                .receipt-row:last-child { border-bottom: none; }
                .txn-id { font-family: monospace; font-size: 13px; background: var(--primary-50); padding: 4px 10px; border-radius: 6px; color: var(--primary); font-weight: 700; }
                .receipt-footer { padding: 20px 30px 30px; text-align: center; }
                .receipt-footer .btn-primary { width: 100%; padding: 14px; font-size: 16px; display: flex; justify-content: center; }

                /* Net Preview in Gen Modal */
                .net-preview { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--primary-50); border: 1px solid var(--primary-100); border-radius: 12px; font-size: 16px; font-weight: 600; color: var(--text-primary); }
                .net-preview strong { color: var(--primary); font-size: 22px; font-weight: 800; }

                .ps-txn-info { display: flex; align-items: center; gap: 10px; font-size: 14px; padding: 16px 20px; background: var(--primary-50); border-radius: 12px; color: var(--text-primary); font-weight: 500; }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-secondary); }
                .form-group input, .form-group select { padding: 12px 16px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; transition: border-color 0.2s; width: 100%; }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group input::placeholder { color: var(--text-muted); }
                .form-group input:focus, .form-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); }

                .modal-body { padding: 30px; }
                .ps-section { margin-bottom: 24px; }
                .label { font-size: 12px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; font-weight: 700; letter-spacing: 0.5px; display: block; }
                .val { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
                .ps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
                .ps-box { background: var(--bg-body); padding: 16px; border-radius: 12px; border: 1px solid var(--border); }
                
                .ps-total-row { background: var(--primary-50); padding: 24px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--primary-100); }
                .ps-total-row h2 { font-size: 32px; color: var(--primary); margin: 0; font-weight: 800; }
                .status-tag { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-tag.awaiting-approval { color: var(--warning); }
                .status-tag.approved { color: var(--primary); }
                .status-tag.paid { color: var(--success); }
                .text-success { color: var(--success) !important; }
                .text-danger { color: var(--danger) !important; }
                .text-warning { color: var(--warning) !important; }
                .text-primary { color: var(--primary) !important; }

                .modal-footer { padding: 24px 28px; background: var(--bg-card); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
                .btn-cancel { background: var(--bg-body); color: var(--text-secondary); border: 1px solid var(--border); padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; }
                .btn-cancel:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--border-hover); }
                .btn-secondary { background: var(--bg-body); border: 1px solid var(--border); color: var(--text-primary); padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; }
                .btn-secondary:hover { background: var(--bg-hover); border-color: var(--border-hover); }
                
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }
                .gap-5 { gap: 5px; }
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                .pay-toast { position: fixed; bottom: 30px; right: 30px; display: flex; align-items: center; gap: 10px; padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; z-index: 9999; animation: slideUp 0.3s ease-out; box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
                .pay-toast.ok  { background: var(--bg-card); border-left: 4px solid var(--success); color: var(--text-primary); }
                .pay-toast.ok svg { color: var(--success); }
                .pay-toast.err { background: var(--bg-card); border-left: 4px solid var(--danger); color: var(--text-primary); }
                .pay-toast.err svg { color: var(--danger); }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) {
                    .payroll-summary-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 768px) {
                    .module-container { padding: 20px; }
                    .module-header { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .payroll-summary-grid { grid-template-columns: 1fr; }
                    .pay-method-grid { grid-template-columns: repeat(2, 1fr); }
                    .header-actions { width: 100%; }
                    .header-actions button { flex: 1; min-width: 150px; justify-content: center; }
                    .form-grid { grid-template-columns: 1fr; }
                    .ps-grid { grid-template-columns: 1fr; }
                    .pay-emp-card { flex-direction: column; text-align: center; }
                    .pay-emp-amount { text-align: center; }
                    .pay-toast { left: 20px; right: 20px; bottom: 20px; }
                    .modal-footer { flex-direction: column; }
                    .modal-footer button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Payroll;
