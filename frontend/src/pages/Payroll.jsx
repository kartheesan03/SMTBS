import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { DollarSign, FileText, Download, TrendingUp, X, CheckCircle, Clock, Loader, User, AlertCircle, Check } from 'lucide-react';

const Payroll = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenModal, setShowGenModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';
    const isHR = userInfo.role === 'HR';

    const [formData, setFormData] = useState({
        employeeId: '',
        month: `${new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`,
        basicSalary: '',
        allowances: 0,
        deductions: 0
    });

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
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error generating payroll');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await API.put(`/salaries/${id}/approve`);
            fetchData();
            if (selectedSalary?._id === id) setShowViewModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving payroll');
        }
    };

    const handleViewDetails = (s) => {
        setSelectedSalary(s);
        setShowViewModal(true);
    };

    const stats = {
        total: salaries.reduce((acc, curr) => acc + curr.netSalary, 0),
        processed: salaries.filter(s => s.status === 'Paid' || s.status === 'Approved').length,
        pending: salaries.filter(s => s.status === 'Awaiting Approval').length
    };

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Payroll Management</h1>
                    <p className="text-muted">Process monthly salaries, deductions, and financial disbursements.</p>
                </div>
                {(isAdmin || isHR) && (
                    <div className="header-actions">
                        <button className="btn-primary flex-center gap-10" onClick={() => setShowGenModal(true)}>
                            <TrendingUp size={18} /> Generate Monthly Payroll
                        </button>
                    </div>
                )}
            </header>

            <div className="payroll-summary-grid">
                <div className="glass-card p-stat">
                    <p>Total Net Disbursement</p>
                    <h3>${stats.total.toLocaleString()}</h3>
                </div>
                <div className="glass-card p-stat">
                    <p>Approved/Paid</p>
                    <h3>{stats.processed} / {salaries.length}</h3>
                </div>
                <div className="glass-card p-stat">
                    <p>Pending Admin Approval</p>
                    <h3 className={stats.pending > 0 ? "text-warning" : ""}>{stats.pending}</h3>
                </div>
            </div>

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
                                            <strong>{s.employee?.userId?.name || 'Unknown'}</strong>
                                            <p className="text-muted small">{s.employee?.department || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{s.month}</td>
                                <td>${s.basicSalary.toLocaleString()}</td>
                                <td>
                                    <div className="adj-cell">
                                        <span className="text-success">+{s.allowances}</span>
                                        <span className="text-danger">-{s.deductions}</span>
                                    </div>
                                </td>
                                <td><strong className="text-primary">${s.netSalary.toLocaleString()}</strong></td>
                                <td>
                                    <div className={`status-pill ${s.status.toLowerCase().replace(' ', '-')}`}>
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
                                    </div>
                                </td>
                            </tr>
                        )}
                    />
                )}
            </div>

            {/* Generation Modal */}
            {showGenModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop">
                        <div className="modal-header">
                            <h3>Generate New Payroll Entry</h3>
                            <button className="close-btn" onClick={() => setShowGenModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-30">
                            <div className="form-group">
                                <label>Select Employee</label>
                                <select required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                                    <option value="">Choose...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.userId?.name} ({emp.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-grid mt-20">
                                <div className="form-group">
                                    <label>Month / Period</label>
                                    <input type="text" required value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Basic Salary</label>
                                    <input type="number" required value={formData.basicSalary} onChange={e => setFormData({...formData, basicSalary: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div className="form-grid mt-20">
                                <div className="form-group">
                                    <label>Allowances</label>
                                    <input type="number" value={formData.allowances} onChange={e => setFormData({...formData, allowances: Number(e.target.value)})} />
                                </div>
                                <div className="form-group">
                                    <label>Deductions</label>
                                    <input type="number" value={formData.deductions} onChange={e => setFormData({...formData, deductions: Number(e.target.value)})} />
                                </div>
                            </div>
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

            {/* Details Modal */}
            {showViewModal && selectedSalary && (
                <div className="modal-overlay">
                    <div className="glass-card payslip-modal-admin animate-pop">
                        <div className="modal-header">
                            <div className="flex-center gap-10">
                                <FileText className="text-primary" />
                                <h3>Payroll Details: {selectedSalary.employee?.userId?.name}</h3>
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
                                    <p className="val">${selectedSalary.basicSalary.toLocaleString()}</p>
                                </div>
                                <div className="ps-box">
                                    <p className="label">Allowances</p>
                                    <p className="val text-success">+${selectedSalary.allowances.toLocaleString()}</p>
                                </div>
                                <div className="ps-box">
                                    <p className="label">Deductions</p>
                                    <p className="val text-danger">-${selectedSalary.deductions.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="ps-total-row">
                                <div>
                                    <p className="label">NET PAYABLE</p>
                                    <h2>${selectedSalary.netSalary.toLocaleString()}</h2>
                                </div>
                                <div className={`status-tag ${selectedSalary.status.toLowerCase().replace(' ', '-')}`}>
                                    {selectedSalary.status}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary flex-center gap-10" onClick={() => handleDownload(selectedSalary)} disabled={downloading}>
                                <Download size={18} /> {downloading ? 'Generating...' : 'Download PDF'}
                            </button>
                            {isAdmin && selectedSalary.status === 'Awaiting Approval' && (
                                <button className="btn-primary" style={{background: '#10b981', borderColor: '#10b981'}} onClick={() => handleApprove(selectedSalary._id)}>
                                    Approve Now
                                </button>
                            )}
                            <button className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
                
                .payroll-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .p-stat { padding: 25px; }
                .p-stat p { font-size: 13px; color: var(--text-muted); margin-bottom: 5px; }
                .p-stat h3 { font-size: 26px; }
                
                .emp-cell { display: flex; align-items: center; gap: 12px; }
                .emp-avatar { width: 32px; height: 32px; border-radius: 50%; background: rgba(99, 102, 241, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; }
                .small { font-size: 11px; }

                .adj-cell { display: flex; flex-direction: column; font-size: 12px; font-weight: 600; }
                
                .status-pill { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; width: fit-content; }
                .status-pill.paid { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.approved { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
                .status-pill.awaiting-approval { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

                .btn-table-action { background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border); font-size: 12px; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
                .approve-btn { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
                
                .mt-20 { margin-top: 20px; }
                .mt-30 { margin-top: 30px; }
                .p-30 { padding: 30px; }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { width: 90%; max-width: 550px; }
                .payslip-modal-admin { width: 90%; max-width: 600px; }
                .modal-header { padding: 20px 25px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .close-btn { background: none; color: var(--text-muted); cursor: pointer; font-size: 20px; }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
                .form-group input, .form-group select { padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; color: white; }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group select option { background: #1e293b; color: white; }
                .form-group input::placeholder { color: rgba(255,255,255,0.4); }
                
                .modal-body { padding: 30px; }
                .ps-section { margin-bottom: 20px; }
                .label { font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
                .val { font-size: 16px; font-weight: 600; }
                .ps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
                .ps-box { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid var(--border); }
                
                .ps-total-row { background: rgba(99, 102, 241, 0.05); padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
                .ps-total-row h2 { font-size: 28px; color: var(--primary); }
                .status-tag { font-size: 12px; font-weight: 800; text-transform: uppercase; }
                .status-tag.awaiting-approval { color: #f59e0b; }
                .status-tag.approved { color: var(--primary); }
                .status-tag.paid { color: #10b981; }

                .modal-footer { padding: 20px 25px; background: rgba(255,255,255,0.02); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
                .btn-cancel { background: transparent; color: white; border: 1px solid var(--border); padding: 10px 20px; border-radius: 8px; cursor: pointer; }
                
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }
                .gap-5 { gap: 5px; }
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default Payroll;
