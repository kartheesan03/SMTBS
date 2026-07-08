import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { DollarSign, Download, Eye, X, FileText, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { generatePayslipPDF } from '../utils/pdfGenerator';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

const Payslips = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/salaries');
            setHistory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching salary history:', error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleViewPayslip = (record) => {
        setSelectedPayslip(record);
        setShowModal(true);
    };

    const handleDownload = async (record) => {
        try {
            setDownloading(true);
            const employeeName = record.employee ? `${record.employee.firstName || ''} ${record.employee.lastName || ''}`.trim() : 'Employee';
            await generatePayslipPDF(record, employeeName);
        } catch (error) {
            console.error('Error downloading payslip:', error);
            toast.error('Failed to generate payslip PDF');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="loading-state flex-center">
            <Loader2 size={32} className="spin text-primary" />
            <p>Loading payslip records...</p>
            <style jsx="true">{`
                .loading-state { flex-direction: column; min-height: 400px; gap: 15px; color: var(--text-muted); font-weight: 500; }
                .spin { animation: spin 1s linear infinite; }
                .text-primary { color: var(--primary); }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="page-container"
        >
            <header className="page-header" style={{ marginBottom: 0 }}>
                <PageHeader title="Payslips" badge="HRMS" subtitle="Review employee payment history and download official payslips." />
            </header>

            <div className="module-content">
                {history.length === 0 ? (
                    <div className="premium-card no-salary-card">
                        <div className="no-salary-icon-wrapper">
                            <DollarSign size={32} className="no-salary-icon" />
                        </div>
                        <h3>No Salary Records Found</h3>
                        <p>Payroll has not been generated for any employees yet.</p>
                    </div>
                ) : (
                    <div className="premium-card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} className="text-primary" /> Employee Payslips
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-app)', padding: '4px 10px', borderRadius: '12px' }}>
                                {history.length} record{history.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div style={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'auto', background: 'var(--bg-surface)' }}>
                            <div className="enterprise-table-container">
                                <table className="enterprise-table">
                                    <colgroup>
                                        <col style={{ width: '18%' }} />
                                        <col style={{ width: '12%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '12%' }} />
                                        <col style={{ width: '13%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '15%' }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>Employee Name</th>
                                            <th>Employee ID</th>
                                            <th>Department</th>
                                            <th>Month</th>
                                            <th style={{ textAlign: 'right' }}>Net Amount</th>
                                            <th style={{ textAlign: 'center' }}>Status</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(s => {
                                            const employeeName = s.employee ? `${s.employee.firstName || ''} ${s.employee.lastName || ''}`.trim() : 'Unknown';
                                            const employeeId = s.employee?.employeeId || '—';
                                            const department = s.employee?.department || '—';
                                            
                                            return (
                                                <tr key={s._id} className="table-row-hover">
                                                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div className="emp-avatar-sm">
                                                                {(s.employee?.firstName?.[0] || 'U').toUpperCase()}
                                                            </div>
                                                            <strong style={{ color: 'var(--text-heading)', fontSize: '13px' }}>{employeeName}</strong>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{employeeId}</td>
                                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{department}</td>
                                                    <td style={{ padding: '12px 16px', color: 'var(--text-heading)', fontSize: '13px', fontWeight: 600 }}>{s.month}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                                                        ₹{s.netSalary?.toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                        <span className={`status-pill ${s.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {s.status === 'Paid' ? <CheckCircle size={12} strokeWidth={2.5}/> : 
                                                             s.status === 'Approved' ? <CheckCircle size={12} strokeWidth={2.5}/> : 
                                                             s.status === 'Rejected' ? <AlertCircle size={12} strokeWidth={2.5}/> : 
                                                             <Clock size={12} strokeWidth={2.5}/>}
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                            <button className="action-icon-btn btn-view" title="View Payslip" onClick={() => handleViewPayslip(s)}>
                                                                <Eye size={18} strokeWidth={2} />
                                                            </button>
                                                            {s.status === 'Paid' && (
                                                                <button className="action-icon-btn btn-download" title="Download Payslip" onClick={() => handleDownload(s)}>
                                                                    <Download size={18} strokeWidth={2} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModal && selectedPayslip && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="flex-center gap-10">
                                <div className="icon-wrapper bg-primary-light text-primary">
                                    <FileText size={20} strokeWidth={2.5} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)' }}>
                                    Payslip Details
                                </h3>
                                <span className="month-badge">{selectedPayslip.month}</span>
                            </div>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} strokeWidth={2.5}/></button>
                        </div>
                        
                        <div className="modal-body p-30" style={{ padding: '24px' }}>
                            <div className="payslip-section">
                                <h6 className="section-title">EMPLOYEE INFORMATION</h6>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Name</span>
                                        <span className="info-value">{selectedPayslip.employee ? `${selectedPayslip.employee.firstName || ''} ${selectedPayslip.employee.lastName || ''}`.trim() : 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Employee ID</span>
                                        <span className="info-value">{selectedPayslip.employee?.employeeId || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Designation</span>
                                        <span className="info-value">{selectedPayslip.employee?.designation || 'Staff'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Department</span>
                                        <span className="info-value">{selectedPayslip.employee?.department || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="payslip-section mt-24">
                                <h6 className="section-title">SALARY BREAKDOWN</h6>
                                <div className="breakdown-card">
                                    <div className="row-between">
                                        <span className="breakdown-label">Basic Salary</span>
                                        <span className="breakdown-val">₹{selectedPayslip.basicSalary?.toLocaleString()}</span>
                                    </div>
                                    <div className="row-between">
                                        <span className="breakdown-label">Allowances</span>
                                        <span className="breakdown-val positive">+ ₹{selectedPayslip.allowances?.toLocaleString()}</span>
                                    </div>
                                    <div className="row-between line-above">
                                        <span className="breakdown-label">Gross Earnings</span>
                                        <span className="breakdown-val highlight">₹{((selectedPayslip.basicSalary || 0) + (selectedPayslip.allowances || 0)).toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="row-between mt-12">
                                        <span className="breakdown-label text-danger">Taxes & Deductions</span>
                                        <span className="breakdown-val negative">- ₹{selectedPayslip.deductions?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="payslip-footer-total mt-24">
                                <div className="total-label">
                                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Total Net Pay</span>
                                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginTop: '2px', opacity: 0.9 }}>For {selectedPayslip.month}</span>
                                </div>
                                <span className="total-amount">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ padding: '20px 24px', background: 'var(--bg-app)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            {selectedPayslip.status === 'Paid' ? (
                                <button className="btn-primary flex-center" style={{ gap: '8px', padding: '10px 20px' }} onClick={() => handleDownload(selectedPayslip)} disabled={downloading}>
                                    <Download size={18} strokeWidth={2.5} /> {downloading ? 'Generating...' : 'Download PDF'}
                                </button>
                            ) : (
                                <div className="no-payslip-msg-inline">
                                    <Clock size={16} strokeWidth={2.5} />
                                    <span>Available once paid</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .module-container { padding: 30px; color: var(--text-heading); }
                .text-primary { color: var(--primary); }
                
                /* Enterprise Table Specific */
                .enterprise-table-container { width: 100%; border-collapse: collapse; }
                .enterprise-table { width: 100%; border-collapse: collapse; min-width: 800px; }
                .enterprise-table th { background: var(--bg-app); color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-strong); position: sticky; top: 0; z-index: 10; }
                .enterprise-table td { border-bottom: 1px solid var(--border-subtle); transition: background 0.2s; }
                .table-row-hover:hover td { background: var(--bg-hover); }
                
                .emp-avatar-sm { width: 32px; height: 32px; border-radius: 8px; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; }
                
                .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
                .status-pill.paid { background: var(--success-bg); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
                .status-pill.approved { background: var(--success-bg); color: var(--success); }
                .status-pill.awaiting-approval { background: var(--warning-bg); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.2); }
                .status-pill.pending { background: var(--warning-bg); color: var(--warning); }
                .status-pill.rejected { background: var(--danger-bg); color: var(--danger); }
                
                .action-icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-surface); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .action-icon-btn.btn-view { color: var(--info); }
                .action-icon-btn.btn-view:hover { background: var(--info-bg); border-color: var(--info); }
                .action-icon-btn.btn-download { color: var(--primary); }
                .action-icon-btn.btn-download:hover { background: var(--primary-light); border-color: var(--primary); }
                
                .no-salary-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 30px; background: var(--bg-surface); border: 1px dashed var(--border-strong); border-radius: var(--radius-lg); text-align: center; }
                .no-salary-icon-wrapper { width: 64px; height: 64px; background: var(--bg-app); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
                .no-salary-icon { color: var(--text-muted); }
                .no-salary-card h3 { font-size: 18px; font-weight: 800; color: var(--text-heading); margin: 0 0 8px 0; }
                .no-salary-card p { font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.6; margin: 0; }
                
                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-content { background: var(--bg-surface); border-radius: var(--radius-lg); width: 100%; max-width: 550px; box-shadow: var(--shadow-xl); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; }
                .modal-body { overflow-y: auto; flex: 1; }
                .icon-wrapper { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .bg-primary-light { background: var(--primary-light); }
                .month-badge { background: var(--bg-app); padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--text-muted); border: 1px solid var(--border-subtle); margin-left: 8px; }
                .close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 6px; transition: 0.2s; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-heading); }
                
                .section-title { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: var(--bg-app); padding: 16px; border-radius: 12px; border: 1px solid var(--border-subtle); }
                .info-item { display: flex; flex-direction: column; gap: 4px; }
                .info-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
                .info-value { font-size: 14px; font-weight: 700; color: var(--text-heading); }
                
                .breakdown-card { background: var(--bg-surface); padding: 16px 20px; border-radius: 12px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); }
                .row-between { display: flex; justify-content: space-between; padding: 8px 0; align-items: center; }
                .line-above { border-top: 1px dashed var(--border-strong); margin-top: 8px; padding-top: 16px; }
                .breakdown-label { font-size: 14px; font-weight: 600; color: var(--text-main); }
                .breakdown-val { font-size: 15px; font-weight: 700; color: var(--text-heading); font-variant-numeric: tabular-nums; }
                .breakdown-val.positive { color: var(--success); }
                .breakdown-val.negative { color: var(--danger); }
                .breakdown-val.highlight { font-size: 16px; color: var(--primary); }
                .text-danger { color: var(--danger); }
                
                .payslip-footer-total { padding: 20px 24px; background: linear-gradient(135deg, var(--primary), var(--primary-hover)); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; color: white; box-shadow: 0 10px 20px -5px var(--primary-glow); }
                .total-amount { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
                
                .no-payslip-msg-inline { display: flex; align-items: center; gap: 8px; color: var(--warning); font-size: 13px; font-weight: 600; background: var(--warning-bg); padding: 10px 16px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2); }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }
                .mt-24 { margin-top: 24px; }
                .mt-12 { margin-top: 12px; }
                
                @media (max-width: 768px) {
                    .page-container { padding: 20px; }
                    .info-grid { grid-template-columns: 1fr; }
                    .modal-actions button { width: 100%; }
                }
            `}</style>
        </motion.div>
    );
};

export default Payslips;
