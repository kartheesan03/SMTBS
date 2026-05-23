import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { DollarSign, Download, Eye, X, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { generatePayslipPDF } from '../utils/pdfGenerator';

const MySalaryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/salaries/my');
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

    const handleDownload = (record) => {
        alert(`Downloading payslip for ${record.month}...`);
    };

    if (loading) return (
        <div className="loading-state">
            <Loader2 className="spin" />
            <p>Loading your salary records...</p>
            <style jsx="true">{`
                .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 15px; color: var(--text-muted); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">My Salary & Payslips</h1>
                    <p className="text-muted">Review your payment history and download official payslips.</p>
                </div>
            </header>

            <div className="module-content mt-30">
                <DataTable 
                    title="Payment Ledger"
                    headers={['Month', 'Net Amount', 'Status', 'Date Paid', 'Actions']}
                    data={history}
                    renderRow={(s) => (
                        <tr key={s._id}>
                            <td><strong>{s.month}</strong></td>
                            <td>${s.netSalary?.toLocaleString()}</td>
                            <td>
                                <div className={`status-badge ${s.status?.toLowerCase().replace(' ', '-')}`}>
                                    {s.status === 'Paid' ? <CheckCircle size={14}/> : s.status === 'Approved' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                    {s.status}
                                </div>
                            </td>
                            <td>{s.paymentDate ? new Date(s.paymentDate).toLocaleDateString() : '-'}</td>
                            <td>
                                <div className="action-row">
                                    <button className="icon-btn" title="View Details" onClick={() => handleViewPayslip(s)}>
                                        <Eye size={16}/>
                                    </button>
                                    <button className="icon-btn" title="Download" onClick={() => handleDownload(s)}>
                                        <Download size={16}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </div>

            {showModal && selectedPayslip && (
                <div className="modal-backdrop">
                    <div className="glass-card modal-container-salary animate-slide-up">
                        <div className="modal-head">
                            <div className="flex-center gap-10">
                                <FileText className="text-primary" />
                                <h3>Payslip Detail - {selectedPayslip.month}</h3>
                            </div>
                            <button className="btn-close" onClick={() => setShowModal(false)}><X size={20}/></button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="payslip-group">
                                <h6>EMPLOYEE INFO</h6>
                                <div className="info-grid">
                                    <p><span>Designation:</span> {selectedPayslip.employee?.designation || 'Staff'}</p>
                                    <p><span>ID:</span> {selectedPayslip.employee?.employeeId || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="payslip-group">
                                <h6>EARNINGS</h6>
                                <div className="row-between">
                                    <span>Basic Salary</span>
                                    <span>${selectedPayslip.basicSalary?.toLocaleString()}</span>
                                </div>
                                <div className="row-between">
                                    <span>Allowances</span>
                                    <span>+ ${selectedPayslip.allowances?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="payslip-group">
                                <h6>DEDUCTIONS</h6>
                                <div className="row-between negative">
                                    <span>Taxes & Deductions</span>
                                    <span>- ${selectedPayslip.deductions?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="payslip-footer-total">
                                <span>TOTAL NET PAY</span>
                                <span>${selectedPayslip.netSalary?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-primary flex-center gap-10" onClick={() => handleDownload(selectedPayslip)} disabled={downloading}>
                                <Download size={18} /> {downloading ? 'Generating PDF...' : 'Download Payslip (PDF)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
                .status-badge.paid { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-badge.approved { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
                .status-badge.awaiting-approval { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                
                .action-row { display: flex; gap: 10px; }
                .icon-btn { background: rgba(255,255,255,0.05); color: var(--text-muted); padding: 8px; border-radius: 8px; }
                .icon-btn:hover { background: var(--primary); color: white; }

                .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-container-salary { width: 100%; max-width: 550px; padding: 0; overflow: hidden; border: 1px solid var(--border); max-height: 90vh; overflow-y: auto; }
                .modal-head { padding: 20px 25px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .btn-close { background: none; color: var(--text-muted); cursor: pointer; }
                
                .modal-body { padding: 25px; }
                .payslip-group { margin-bottom: 25px; }
                .payslip-group h6 { font-size: 11px; color: var(--primary); margin-bottom: 12px; letter-spacing: 1.5px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; }
                .info-grid p span { color: var(--text-muted); margin-right: 5px; }
                
                .row-between { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .row-between.negative { color: #ef4444; }
                
                .payslip-footer-total { margin-top: 20px; padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; display: flex; justify-content: space-between; font-size: 22px; font-weight: 800; color: #10b981; }
                
                .modal-actions { padding: 20px 25px; background: rgba(255,255,255,0.02); display: flex; justify-content: center; }
                
                .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .mt-30 { margin-top: 30px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .info-grid { grid-template-columns: 1fr; }
                    .payslip-footer-total { font-size: 18px; padding: 15px; }
                    .modal-actions button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default MySalaryPage;
