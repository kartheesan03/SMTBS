import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { DollarSign, Download, Eye, X, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { generatePayslipPDF } from '../utils/pdfGenerator';

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
            alert('Failed to generate payslip PDF');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="loading-state">
            <Loader2 className="spin" />
            <p>Loading payroll records...</p>
            <style jsx="true">{`
                .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 15px; color: var(--text-muted); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    return (
        <div className="module-container">
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Payslips</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Review employee payment history and download official payslips.</p>
                </div>
            </header>

            <div className="module-content">
                {history.length === 0 ? (
                    <div className="dashboard-card-3d no-salary-card">
                        <DollarSign size={48} className="no-salary-icon" />
                        <h3>No Salary Generated</h3>
                        <p>Payroll has not been generated yet.</p>
                    </div>
                ) : (
                <div className="dashboard-card-3d" style={{ overflow: 'hidden' }}>
                <DataTable 
                    title="Employee Payslips"
                    headers={['Employee', 'ID', 'Department', 'Month', 'Net Amount', 'Status', 'Actions']}
                    data={history}
                    renderRow={(s) => {
                        const employeeName = s.employee ? `${s.employee.firstName || ''} ${s.employee.lastName || ''}`.trim() : 'N/A';
                        const employeeId = s.employee?.employeeId || '—';
                        const department = s.employee?.department || '—';
                        
                        return (
                            <tr key={s._id}>
                                <td><strong>{employeeName}</strong></td>
                                <td>{employeeId}</td>
                                <td>{department}</td>
                                <td><strong>{s.month}</strong></td>
                                <td>₹{s.netSalary?.toLocaleString()}</td>
                                <td>
                                    <div className={`status-badge ${s.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {s.status === 'Paid' ? <CheckCircle size={14}/> : s.status === 'Approved' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                        {s.status}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-row">
                                        <button className="icon-btn" title="View Details" onClick={() => handleViewPayslip(s)}>
                                            <Eye size={16}/>
                                        </button>
                                        {s.status === 'Paid' && (
                                            <button className="icon-btn" title="Download" onClick={() => handleDownload(s)}>
                                                <Download size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    }}
                />
                </div>
                )}
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
                                    <p><span>Name:</span> {selectedPayslip.employee ? `${selectedPayslip.employee.firstName || ''} ${selectedPayslip.employee.lastName || ''}`.trim() : 'N/A'}</p>
                                    <p><span>ID:</span> {selectedPayslip.employee?.employeeId || 'N/A'}</p>
                                    <p><span>Designation:</span> {selectedPayslip.employee?.designation || 'Staff'}</p>
                                    <p><span>Department:</span> {selectedPayslip.employee?.department || '—'}</p>
                                </div>
                            </div>

                            <div className="payslip-group">
                                <h6>EARNINGS</h6>
                                <div className="row-between">
                                    <span>Basic Salary</span>
                                    <span>₹{selectedPayslip.basicSalary?.toLocaleString()}</span>
                                </div>
                                <div className="row-between">
                                    <span>Allowances</span>
                                    <span>+ ₹{selectedPayslip.allowances?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="payslip-group">
                                <h6>DEDUCTIONS</h6>
                                <div className="row-between negative">
                                    <span>Taxes & Deductions</span>
                                    <span>- ₹{selectedPayslip.deductions?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="payslip-footer-total">
                                <span>TOTAL NET PAY</span>
                                <span>₹{selectedPayslip.netSalary?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            {selectedPayslip.status === 'Paid' ? (
                                <button className="btn-download-payslip" onClick={() => handleDownload(selectedPayslip)} disabled={downloading}>
                                    <Download size={18} /> {downloading ? 'Generating...' : 'Download Payslip'}
                                </button>
                            ) : (
                                <div className="no-payslip-msg">
                                    <Clock size={16} />
                                    <span>Payslip will be available after salary is paid</span>
                                </div>
                            )}
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

                .no-salary-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 30px; background: var(--bg-card, #ffffff); border: 1px dashed var(--border, #e2e8f0); border-radius: 16px; text-align: center; }
                .no-salary-icon { color: #94a3b8; margin-bottom: 16px; }
                .no-salary-card h3 { font-size: 18px; color: var(--dash-text-main, #0f172a); margin-bottom: 8px; }
                .no-salary-card p { font-size: 14px; color: #64748b; max-width: 400px; line-height: 1.6; }

                .no-payslip-msg { display: flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 13px; font-weight: 600; background: rgba(245, 158, 11, 0.08); padding: 12px 20px; border-radius: 10px; border: 1px solid rgba(245, 158, 11, 0.2); }
                
                .action-row { display: flex; gap: 10px; }
                .icon-btn { background: rgba(255,255,255,0.05); color: var(--text-muted); padding: 8px; border-radius: 8px; border: none; cursor: pointer; }
                .icon-btn:hover { background: var(--primary); color: white; }

                .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-container-salary { width: 100%; max-width: 550px; padding: 0; overflow: hidden; border: 1px solid var(--border); max-height: 90vh; overflow-y: auto; background: var(--bg-card, #fff); }
                .modal-head { padding: 20px 25px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .btn-close { background: none; color: var(--text-muted); cursor: pointer; border: none; }
                
                .modal-body { padding: 25px; }
                .payslip-group { margin-bottom: 25px; }
                .payslip-group h6 { font-size: 11px; color: var(--primary); margin-bottom: 12px; letter-spacing: 1.5px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; }
                .info-grid p span { color: var(--text-muted); margin-right: 5px; }
                
                .row-between { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .row-between.negative { color: #ef4444; }
                
                .payslip-footer-total { margin-top: 20px; padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; display: flex; justify-content: space-between; font-size: 22px; font-weight: 800; color: #10b981; }
                
                .modal-actions { padding: 20px 25px; background: rgba(255,255,255,0.02); display: flex; justify-content: center; border-top: 1px solid var(--border); }
                
                .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .mt-30 { margin-top: 30px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

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

export default Payslips;
