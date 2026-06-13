import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { 
    DollarSign, FileText, Download, TrendingUp, X, CheckCircle, 
    Clock, Loader, User, AlertCircle, Check, CreditCard, Banknote, 
    Send, Wallet, ArrowRight, BadgeCheck, Receipt, Search, Bell, ChevronDown, Activity, Users, Layers, Calendar
} from 'lucide-react';
import { generatePayslipPDF } from '../utils/pdfGenerator';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const Payroll = () => {
    // ─── STATE MANAGEMENT ───
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

    // ─── DERIVED DATA / CHARTS ───
    const stats = {
        total: salaries.reduce((acc, curr) => acc + (curr.netSalary || 0), 0),
        paid: salaries.filter(s => s.status === 'Paid').length,
        approved: salaries.filter(s => s.status === 'Approved').length,
        pending: salaries.filter(s => s.status === 'Awaiting Approval').length,
        approvedTotal: salaries.filter(s => s.status === 'Approved').reduce((acc, s) => acc + (s.netSalary || 0), 0),
        paidTotal: salaries.filter(s => s.status === 'Paid').reduce((acc, s) => acc + (s.netSalary || 0), 0),
        thisMonth: salaries.filter(s => s.month.includes(new Date().getFullYear().toString())).reduce((acc, s) => acc + (s.netSalary || 0), 0)
    };
    
    const averageSalary = salaries.length > 0 ? (stats.total / salaries.length) : 0;

    // Simulated Chart Data (since we don't have historical API)
    const monthlyTrendData = [
        { name: 'Jan', amount: 120000 },
        { name: 'Feb', amount: 125000 },
        { name: 'Mar', amount: 124500 },
        { name: 'Apr', amount: 130000 },
        { name: 'May', amount: 132000 },
        { name: 'Jun', amount: stats.thisMonth || 135000 },
    ];

    const deptDistributionData = [
        { name: 'Engineering', value: 45, color: '#3b82f6' },
        { name: 'Sales', value: 30, color: '#10b981' },
        { name: 'HR & Admin', value: 15, color: '#8b5cf6' },
        { name: 'Operations', value: 10, color: '#f59e0b' },
    ];

    const statusOverviewData = [
        { name: 'Paid', count: stats.paid, fill: '#10b981' },
        { name: 'Approved', count: stats.approved, fill: '#3b82f6' },
        { name: 'Pending', count: stats.pending, fill: '#f59e0b' },
    ];

    return (
        <div className="admin-dashboard-layout">

            {/* Toast */}
            {toast && (
                <div className={`pay-toast ${toast.ok ? 'ok' : 'err'}`}>
                    {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            <div className="main-content">
                <div className="header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="page-title">Payroll Management</h1>
                        <p className="page-subtitle">Process salaries, approvals, and payment tracking</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', gap: '8px' }}>
                            <Search size={18} color="#94a3b8" />
                            <input type="text" placeholder="Search payroll records..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', width: '200px' }} />
                        </div>
                        
                        <div className="date-filter" style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                            <Calendar size={16} color="#64748b" />
                            <span>This Month</span>
                            <ChevronDown size={14} color="#64748b" />
                        </div>

                        {canPay && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {stats.approved > 0 && (
                                    <button className="btn-secondary flex-center" onClick={() => setShowPayAllModal(true)} style={{gap: '8px', padding: '8px 16px', height: '100%'}}>
                                        <Banknote size={16} color="#10b981" /> <span>Pay All Approved ({stats.approved})</span>
                                    </button>
                                )}
                                <button className="btn-primary flex-center" onClick={() => setShowGenModal(true)} style={{gap: '8px', height: '100%'}}>
                                    <TrendingUp size={16} /> Generate Payroll
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* KPIs */}
                <div className="kpi-grid-6">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Wallet size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Disbursement</span>
                            <h3 className="kpi-value">₹{stats.total.toLocaleString()}</h3>
                            <span className="kpi-subtext">All time</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}><Users size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Paid Employees</span>
                            <h3 className="kpi-value">{stats.paid}</h3>
                            <span className="kpi-subtext text-success">₹{stats.paidTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Pending Approval</span>
                            <h3 className="kpi-value">{stats.pending}</h3>
                            <span className="kpi-subtext text-warning">Requires Action</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><CheckCircle size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Ready to Pay</span>
                            <h3 className="kpi-value">{stats.approved}</h3>
                            <span className="kpi-subtext text-primary">₹{stats.approvedTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><Activity size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">This Month Payroll</span>
                            <h3 className="kpi-value">₹{stats.thisMonth.toLocaleString()}</h3>
                            <span className="kpi-subtext">Current period</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f8fafc', color: '#64748b' }}><DollarSign size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Average Salary</span>
                            <h3 className="kpi-value">₹{Math.round(averageSalary).toLocaleString()}</h3>
                            <span className="kpi-subtext">Per employee</span>
                        </div>
                    </div>
                </div>

                {/* Analytics Row */}
                <div className="charts-grid-3">
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><TrendingUp size={16} /> Monthly Payroll Trend</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Layers size={16} /> Salary Distribution by Dept</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={deptDistributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                                        {deptDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={16} /> Payroll Status Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusOverviewData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                                        {statusOverviewData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bento-card mt-16">
                    <div className="bento-card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                        <div className="bento-card-title"><FileText size={18} /> Employee Salary Ledger</div>
                    </div>
                    <div className="bento-card-body" style={{ padding: 0 }}>
                        {loading ? (
                            <div className="flex-center p-50"><Loader size={30} className="spin-icon"/></div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left', background: '#f8fafc' }}>
                                        <th style={{ padding: '16px 24px' }}>Employee</th>
                                        <th style={{ padding: '16px 24px' }}>Department</th>
                                        <th style={{ padding: '16px 24px' }}>Month</th>
                                        <th style={{ padding: '16px 24px' }}>Base Salary</th>
                                        <th style={{ padding: '16px 24px' }}>Adjustments</th>
                                        <th style={{ padding: '16px 24px' }}>Net Pay</th>
                                        <th style={{ padding: '16px 24px' }}>Status</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaries.map(s => (
                                        <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                        <User size={14}/>
                                                    </div>
                                                    <strong style={{ color: '#0f172a' }}>{s.employee ? `${s.employee.firstName || ''} ${s.employee.lastName || ''}`.trim() : 'Unknown'}</strong>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#64748b' }}>{s.employee?.department || 'N/A'}</td>
                                            <td style={{ padding: '16px 24px', color: '#334155', fontWeight: 500 }}>{s.month}</td>
                                            <td style={{ padding: '16px 24px', color: '#334155' }}>₹{(s.basicSalary || 0).toLocaleString()}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', fontWeight: 600 }}>
                                                    <span style={{color: '#10b981'}}>+₹{(s.allowances || 0).toLocaleString()}</span>
                                                    <span style={{color: '#ef4444'}}>-₹{(s.deductions || 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}><strong style={{color: '#3b82f6', fontSize: '14px'}}>₹{(s.netSalary || 0).toLocaleString()}</strong></td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ 
                                                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', 
                                                    padding: '6px 10px', borderRadius: '20px', width: 'fit-content', letterSpacing: '0.5px',
                                                    background: s.status === 'Paid' ? '#ecfdf5' : s.status === 'Approved' ? '#eff6ff' : '#fffbeb',
                                                    color: s.status === 'Paid' ? '#059669' : s.status === 'Approved' ? '#3b82f6' : '#d97706'
                                                }}>
                                                    {s.status === 'Paid' ? <CheckCircle size={14}/> : s.status === 'Approved' ? <Check size={14}/> : <Clock size={14}/>}
                                                    {s.status}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                                    <button className="btn-icon-action" onClick={() => handleViewDetails(s)} title="Details"><FileText size={15} /></button>
                                                    {isAdmin && s.status === 'Awaiting Approval' && (
                                                        <button className="btn-icon-action approve" onClick={() => handleApprove(s._id)} title="Approve"><Check size={15} /></button>
                                                    )}
                                                    {canPay && (s.status === 'Approved' || s.status === 'Awaiting Approval') && (
                                                        <button className="btn-icon-action pay" onClick={() => handleOpenPayModal(s)} title="Pay">
                                                            <CreditCard size={15} />
                                                        </button>
                                                    )}
                                                    {s.status === 'Paid' && (
                                                        <button className="btn-icon-action download" onClick={() => handleDownload(s)} title="Download Payslip">
                                                            <Download size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {salaries.length === 0 && (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                                No payroll records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Recent Activity & Upcoming */}
                <div className="charts-grid-2 mt-16" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '16px' }}>
                    <div className="bento-card">
                        <div className="bento-card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                            <div className="bento-card-title"><Activity size={16} /> Recent Payroll Activities</div>
                        </div>
                        <div className="bento-card-body" style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={16} /></div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#334155', fontWeight: 600 }}>Bulk Disbursed 14 Salaries</p>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>2 hours ago by HR Admin</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={16} /></div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#334155', fontWeight: 600 }}>Generated June Payrolls</p>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Yesterday by System</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={16} /></div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#334155', fontWeight: 600 }}>Approval Requested: 3 Employees</p>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>2 days ago by Manager</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bento-card">
                        <div className="bento-card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                            <div className="bento-card-title"><Calendar size={16} /> Upcoming Salary Payments</div>
                        </div>
                        <div className="bento-card-body" style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>June 2026 Salary</span>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>Due in 4 days</span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>Est. ₹140,000</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Bonus Payouts Q2</span>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>Due in 15 days</span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>Est. ₹45,000</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════ MODALS KEEP UNCHANGED ═══════════════════ */}
            
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
                                    {submitting ? 'Processing...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PAY INDIVIDUAL MODAL */}
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

            {/* PAY ALL MODAL */}
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
                                            <div className="emp-avatar sm" style={{background: '#e2e8f0', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><User size={10}/></div>
                                            <span style={{fontSize: '13px'}}>{s.employee?.userId?.name || s.employee?.firstName || 'Employee'}</span>
                                        </div>
                                        <strong style={{fontSize: '13px'}}>₹{(s.netSalary || 0).toLocaleString()}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className="bulk-warning" style={{display: 'flex', gap: '8px', background: '#fffbeb', color: '#b45309', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '13px'}}>
                                <AlertCircle size={16} />
                                <span>This will mark <strong>{stats.approved}</strong> records as paid.</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowPayAllModal(false)}>Cancel</button>
                            <button className="btn-pay-confirm" onClick={handlePayAll} disabled={paying}>
                                {paying ? 'Processing...' : `Pay All ₹${stats.approvedTotal.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECEIPT MODAL */}
            {showReceiptModal && paymentReceipt && (
                <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
                    <div className="glass-card modal-content animate-pop receipt-modal" onClick={e => e.stopPropagation()}>
                        <div className="receipt-header" style={{textAlign: 'center', padding: '30px 20px', background: '#ecfdf5', borderRadius: '16px 16px 0 0'}}>
                            <div style={{width: '64px', height: '64px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                                <CheckCircle size={32} />
                            </div>
                            <h2 style={{margin: '0 0 8px', color: '#064e3b', fontSize: '20px'}}>Payment Successful!</h2>
                            <p style={{margin: 0, color: '#047857', fontSize: '14px'}}>Salary has been disbursed</p>
                        </div>
                        <div className="receipt-body" style={{padding: '30px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px'}}>
                                <span style={{color: '#64748b'}}>Employee</span>
                                <strong style={{color: '#0f172a'}}>{paymentReceipt.employeeName}</strong>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px'}}>
                                <span style={{color: '#64748b'}}>Period</span>
                                <strong style={{color: '#0f172a'}}>{paymentReceipt.month}</strong>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px'}}>
                                <span style={{color: '#64748b'}}>Amount</span>
                                <strong style={{color: '#10b981'}}>₹{paymentReceipt.netSalary.toLocaleString()}</strong>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px'}}>
                                <span style={{color: '#64748b'}}>Method</span>
                                <strong style={{color: '#0f172a'}}>{paymentReceipt.paymentMethod}</strong>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px'}}>
                                <span style={{color: '#64748b'}}>Transaction ID</span>
                                <strong style={{color: '#0f172a'}}>{paymentReceipt.transactionId}</strong>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px'}}>
                                <span style={{color: '#64748b'}}>Date</span>
                                <strong style={{color: '#0f172a'}}>{paymentReceipt.paymentDate}</strong>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" style={{width: '100%', justifyContent: 'center'}} onClick={() => setShowReceiptModal(false)}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {showViewModal && selectedSalary && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="glass-card modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="flex-center gap-10">
                                <FileText className="text-primary" />
                                <h3>Payroll Details: {selectedSalary.employee?.userId?.name || selectedSalary.employee?.firstName}</h3>
                            </div>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>✕</button>
                        </div>
                        <div className="p-30">
                            <div style={{marginBottom: '20px'}}>
                                <p style={{fontSize: '12px', color: '#64748b', margin: '0 0 4px'}}>Month</p>
                                <p style={{fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0}}>{selectedSalary.month}</p>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px'}}>
                                <div style={{background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9'}}>
                                    <p style={{fontSize: '12px', color: '#64748b', margin: '0 0 4px'}}>Basic</p>
                                    <p style={{fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0}}>₹{(selectedSalary.basicSalary || 0).toLocaleString()}</p>
                                </div>
                                <div style={{background: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #d1fae5'}}>
                                    <p style={{fontSize: '12px', color: '#047857', margin: '0 0 4px'}}>Allowances</p>
                                    <p style={{fontSize: '15px', fontWeight: 600, color: '#10b981', margin: 0}}>+₹{(selectedSalary.allowances || 0).toLocaleString()}</p>
                                </div>
                                <div style={{background: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fee2e2'}}>
                                    <p style={{fontSize: '12px', color: '#b91c1c', margin: '0 0 4px'}}>Deductions</p>
                                    <p style={{fontSize: '15px', fontWeight: 600, color: '#ef4444', margin: 0}}>-₹{(selectedSalary.deductions || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                                <div>
                                    <p style={{fontSize: '12px', fontWeight: 700, color: '#64748b', margin: '0 0 4px'}}>NET PAYABLE</p>
                                    <h2 style={{margin: 0, fontSize: '24px', color: '#3b82f6'}}>₹{(selectedSalary.netSalary || 0).toLocaleString()}</h2>
                                </div>
                                <div style={{ 
                                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                                    background: selectedSalary.status === 'Paid' ? '#ecfdf5' : selectedSalary.status === 'Approved' ? '#eff6ff' : '#fffbeb',
                                    color: selectedSalary.status === 'Paid' ? '#059669' : selectedSalary.status === 'Approved' ? '#3b82f6' : '#d97706'
                                }}>
                                    {selectedSalary.status}
                                </div>
                            </div>
                            {selectedSalary.transactionId && (
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', color: '#64748b', fontSize: '13px', background: '#f8fafc', padding: '12px', borderRadius: '8px'}}>
                                    <Receipt size={16} />
                                    <span>Transaction: <strong>{selectedSalary.transactionId}</strong></span>
                                    {selectedSalary.paymentDate && (
                                        <span>• Paid on {new Date(selectedSalary.paymentDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            {selectedSalary.status === 'Paid' ? (
                                <button className="btn-primary flex-center" style={{gap: '8px', background: '#8b5cf6', borderColor: '#8b5cf6'}} onClick={() => handleDownload(selectedSalary)} disabled={downloading}>
                                    <Download size={16} /> {downloading ? 'Generating...' : 'Download Payslip'}
                                </button>
                            ) : (
                                <span style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', fontSize: '13px', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', fontWeight: 600}}>
                                    <Clock size={14} /> Payslip available after payment
                                </span>
                            )}
                            <div style={{marginLeft: 'auto', display: 'flex', gap: '12px'}}>
                                <button className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
                                {isAdmin && selectedSalary.status === 'Awaiting Approval' && (
                                    <button className="btn-primary" style={{background: '#10b981', borderColor: '#10b981'}} onClick={() => handleApprove(selectedSalary._id)}>
                                        Approve Now
                                    </button>
                                )}
                                {canPay && (selectedSalary.status === 'Approved' || selectedSalary.status === 'Awaiting Approval') && (
                                    <button className="btn-primary flex-center" style={{gap: '8px'}} onClick={() => { setShowViewModal(false); handleOpenPayModal(selectedSalary); }}>
                                        <CreditCard size={16} /> Pay Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .admin-dashboard-layout {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .main-content {
                    padding: 20px 24px;
                    height: 100vh;
                    overflow-y: auto;
                }

                /* Top Nav Bar */
                .top-nav-bar {
                    display: flex; align-items: center; justify-content: space-between;
                    padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9;
                }
                .search-bar {
                    display: flex; align-items: center; gap: 8px;
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 8px 12px; width: 300px;
                }
                .search-bar input { border: none; outline: none; width: 100%; font-size: 13px; color: #0f172a; }
                .search-bar input::placeholder { color: #94a3b8; }
                .nav-actions { display: flex; align-items: center; gap: 16px; }
                .date-filter {
                    display: flex; align-items: center; gap: 6px; cursor: pointer;
                    background: #ffffff; border: 1px solid #e2e8f0; padding: 6px 12px;
                    border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;
                }
                .icon-btn {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 50%;
                    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #64748b; position: relative;
                }
                .notification-btn .notif-badge {
                    position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
                    background: #ef4444; border-radius: 50%; border: 2px solid #fff;
                }

                .page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0; }
                .page-subtitle { font-size: 13px; color: #64748b; margin: 0; }

                .kpi-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px; }
                .kpi-card {
                    background: #ffffff; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;
                }
                .kpi-icon-wrapper { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
                .kpi-label { display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 2px; }
                .kpi-value { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }
                .kpi-subtext { font-size: 10px; color: #94a3b8; font-weight: 500; }

                .charts-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

                .bento-card {
                    background: #ffffff; border-radius: 10px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .bento-card-header { padding: 12px 14px 0; }
                .bento-card-title { font-size: 13px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px; }
                .bento-card-body { padding: 14px; flex: 1; overflow-y: auto; }

                .mt-16 { margin-top: 16px; }
                
                .btn-primary { background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; border: 1px solid #3b82f6; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-primary:hover { background: #2563eb; }
                .btn-secondary { background: #ffffff; color: #334155; padding: 8px 16px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-secondary:hover { background: #f8fafc; }
                .btn-cancel { background: white; color: #64748b; padding: 8px 16px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; font-weight: 600; cursor: pointer; }
                .btn-cancel:hover { background: #f8fafc; color: #334155; }
                .flex-center { display: flex; align-items: center; justify-content: center; }

                .table-row-hover:hover { background: #f8fafc; }
                .btn-icon-action { width: 28px; height: 28px; border-radius: 6px; border: 1px solid transparent; background: transparent; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: #64748b; }
                .btn-icon-action:hover { background: #f1f5f9; border-color: #e2e8f0; }
                .btn-icon-action.approve { color: #10b981; }
                .btn-icon-action.approve:hover { background: #ecfdf5; border-color: #a7f3d0; }
                .btn-icon-action.pay { color: #3b82f6; }
                .btn-icon-action.pay:hover { background: #eff6ff; border-color: #bfdbfe; }
                .btn-icon-action.download { color: #8b5cf6; }
                .btn-icon-action.download:hover { background: #f3e8ff; border-color: #ddd6fe; }

                .pay-toast { position: fixed; bottom: 20px; right: 20px; padding: 12px 20px; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 13px; z-index: 9999; animation: slideUp 0.3s; }
                .pay-toast.ok { background: #10b981; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
                .pay-toast.err { background: #ef4444; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }

                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                /* MODAL STYLES RE-IMPLEMENTED FOR CLEANLINESS */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-content { background: #ffffff; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
                .modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; }
                .close-btn { background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px; border-radius: 4px; }
                .close-btn:hover { background: #f1f5f9; color: #0f172a; }
                .p-30 { padding: 24px; overflow-y: auto; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #475569; }
                .form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #0f172a; outline: none; transition: border 0.2s; }
                .form-group input:focus, .form-group select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .modal-actions, .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid #f1f5f9; background: #f8fafc; }
                
                .pay-emp-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; }
                .pay-emp-avatar { width: 48px; height: 48px; border-radius: 50%; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; }
                .pay-emp-info { flex: 1; }
                .pay-emp-info h4 { margin: 0 0 4px 0; font-size: 15px; color: #0f172a; }
                .pay-emp-info span { font-size: 12px; color: #64748b; }
                .pay-emp-amount .label { display: block; font-size: 11px; font-weight: 600; color: #64748b; text-align: right; }
                .pay-emp-amount h2 { margin: 0; font-size: 20px; color: #10b981; }

                .pay-breakdown { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
                .pay-break-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #475569; }
                .pay-break-row.total { border-top: 1px dashed #cbd5e1; margin-top: 8px; padding-top: 12px; font-weight: 700; color: #0f172a; font-size: 14px; }
                
                .pay-method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .pay-method-btn { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 10px; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
                .pay-method-btn:hover { background: #f8fafc; }
                .pay-method-btn.active { border-color: #3b82f6; background: #eff6ff; color: #2563eb; }

                .btn-pay-confirm { background: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                .btn-pay-confirm:hover { background: #2563eb; }
                .btn-pay-confirm:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default Payroll;
