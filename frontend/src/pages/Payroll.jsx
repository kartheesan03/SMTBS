import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { 
    DollarSign, FileText, Download, TrendingUp, X, CheckCircle, 
    Clock, Loader, User, AlertCircle, Check, CreditCard, Banknote, 
    Send, Wallet, ArrowRight, BadgeCheck, Receipt, Search, Bell, ChevronDown, Activity, Users, Layers, Calendar,
    Eye, Trash2, XCircle, Pencil
} from 'lucide-react';
import { generatePayslipPDF } from '../utils/pdfGenerator';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Payroll = () => {
    // ─── STATE MANAGEMENT ───
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';
    const isHR = userInfo.role === 'HR';
    const isManager = userInfo.role === 'Manager';
    const canPay = isAdmin || isHR || isManager;

    const navigate = useNavigate();

    const [payForm, setPayForm] = useState({
        paymentMethod: 'UPI',
        paymentDetails: {
            paymentDate: new Date().toISOString().split('T')[0]
        }
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [salaryToDelete, setSalaryToDelete] = useState(null);
    const [editForm, setEditForm] = useState({
        basicSalary: '',
        allowances: '',
        deductions: '',
        status: ''
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
        navigate(`/payroll/payment/${s._id}`);
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

    const handleOpenEditModal = (s) => {
        if (s.status === 'Paid') {
            return showToast('Cannot edit a paid salary record', false);
        }
        setSelectedSalary(s);
        setEditForm({
            basicSalary: s.basicSalary || 0,
            allowances: s.allowances || 0,
            deductions: s.deductions || 0,
            status: s.status || 'Pending'
        });
        setShowEditModal(true);
    };

    const handleUpdateSalary = async (e) => {
        e.preventDefault();
        if (!selectedSalary) return;
        setSubmitting(true);
        try {
            await API.put(`/salaries/${selectedSalary._id}`, editForm);
            setShowEditModal(false);
            showToast('Salary record updated successfully');
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error updating salary', false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (id) => {
        const s = salaries.find(sal => sal._id === id);
        if (s && s.status === 'Paid') {
            showToast('Cannot delete a paid salary record', false);
            return;
        }
        setSalaryToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!salaryToDelete) return;
        try {
            const { data } = await API.delete(`/salaries/${salaryToDelete}`);
            setShowDeleteModal(false);
            setSalaryToDelete(null);
            fetchData();
            showToast(data.message || 'Payroll record deleted successfully.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error deleting salary', false);
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

    const isPayFormValid = () => {
        const method = payForm.paymentMethod;
        const pd = payForm.paymentDetails || {};
        if (method === 'UPI') return pd.upiId && pd.transactionId && pd.paymentDate;
        if (method === 'Bank Transfer') return pd.bankName && pd.accountNumber && pd.ifscCode && pd.transactionReference && pd.paymentDate;
        if (method === 'Cheque') return pd.chequeNumber && pd.bankName && pd.chequeDate;
        if (method === 'Cash') return pd.receivedBy && pd.paymentDate;
        return false;
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

    // Dynamic department salary distribution from real payroll data
    const DEPT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
    const deptAggregation = salaries.reduce((acc, s) => {
        const dept = s.employee?.department || 'Others';
        if (!acc[dept]) acc[dept] = { total: 0, count: 0 };
        acc[dept].total += Number(s.netSalary || 0);
        acc[dept].count += 1;
        return acc;
    }, {});
    const totalPayroll = Object.values(deptAggregation).reduce((sum, d) => sum + d.total, 0);
    const deptDistributionData = Object.entries(deptAggregation)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([name, data], idx) => ({
            name,
            value: data.total,
            count: data.count,
            pct: totalPayroll > 0 ? ((data.total / totalPayroll) * 100).toFixed(1) : '0.0',
            color: DEPT_COLORS[idx % DEPT_COLORS.length],
        }));
    const totalDeptCount = deptDistributionData.length;

    const statusOverviewData = [
        { name: 'Paid', count: stats.paid, fill: '#10b981' },
        { name: 'Approved', count: stats.approved, fill: '#3b82f6' },
        { name: 'Pending', count: stats.pending, fill: '#f59e0b' },
    ];

    return (
        <div style={{ position: 'relative' }}>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toast.ok ? '#10b981' : '#ef4444', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', animation: 'slideIn 0.3s ease' }}>
                    {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'scaleIn 0.2s ease' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trash2 size={20} color="#ef4444" /> Delete Payroll Record
                            </h2>
                            <button onClick={() => setShowDeleteModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '24px', fontSize: '14px', color: '#475569' }}>
                            Are you sure you want to delete this payroll record? This action cannot be undone.
                        </div>
                        <div style={{ padding: '16px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
                            <button type="button" onClick={confirmDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="module-container">
                {/* Header */}
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Payroll Management</h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Process salaries, approvals, and payment tracking</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px', gap: '8px' }}>
                            <Search size={16} color="#94a3b8" />
                            <input type="text" placeholder="Search payroll..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', width: '160px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                            <Calendar size={14} color="#64748b" />
                            <span>This Month</span>
                            <ChevronDown size={14} color="#64748b" />
                        </div>
                        {canPay && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {stats.approved > 0 && (
                                    <button className="btn-secondary flex-center" onClick={() => setShowPayAllModal(true)} style={{gap: '8px', padding: '8px 16px'}}>
                                        <Banknote size={16} color="#10b981" /> Pay All ({stats.approved})
                                    </button>
                                )}
                                <button className="btn-primary flex-center" onClick={() => navigate('/payroll/generate')} style={{gap: '8px'}}>
                                    <TrendingUp size={16} /> Generate Payroll
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== KPI ROW (3 per row, 2 rows) ===== */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Disbursement', value: `₹${stats.total.toLocaleString()}`, sub: 'All time', icon: Wallet, iconBg: '#eff6ff', iconColor: '#3b82f6' },
                        { label: 'Paid Employees', value: stats.paid, sub: `₹${stats.paidTotal.toLocaleString()}`, icon: Users, iconBg: '#ecfdf5', iconColor: '#10b981', subColor: '#10b981' },
                        { label: 'Pending Approval', value: stats.pending, sub: 'Requires Action', icon: Clock, iconBg: '#fef3c7', iconColor: '#d97706', subColor: '#d97706' },
                        { label: 'Ready to Pay', value: stats.approved, sub: `₹${stats.approvedTotal.toLocaleString()}`, icon: CheckCircle, iconBg: '#f3e8ff', iconColor: '#9333ea', subColor: '#3b82f6' },
                        { label: 'Current Month Payroll', value: `₹${stats.thisMonth.toLocaleString()}`, sub: 'Current period', icon: Activity, iconBg: '#f0fdf4', iconColor: '#16a34a' },
                        { label: 'Average Salary', value: `₹${Math.round(averageSalary).toLocaleString()}`, sub: 'Per employee', icon: DollarSign, iconBg: '#f8fafc', iconColor: '#64748b' },
                    ].map((kpi, idx) => (
                        <div key={idx} className="dashboard-card-3d" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: kpi.iconBg, color: kpi.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <kpi.icon size={18} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{kpi.label}</div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1, marginBottom: '4px' }}>{kpi.value}</div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: kpi.subColor || 'var(--text-muted)' }}>{kpi.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== ANALYTICS ROW: Trend (5fr) + Distribution (3fr) + Status (4fr) ===== */}
                <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr 4fr', gap: '16px', marginBottom: '24px' }}>

                    {/* Monthly Payroll Trend */}
                    <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', minHeight: '280px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16} /> Monthly Payroll Trend</h3>
                        </div>
                        <div style={{ flex: 1, padding: '0 18px 18px 18px', overflow: 'hidden' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Salary Distribution by Department */}
                    <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', minHeight: '280px', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px', height: '44px', display: 'flex', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Layers size={15} /> Salary Distribution by Department</h3>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 16px 0 16px', overflow: 'hidden' }}>
                            {deptDistributionData.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>No payroll data available</div>
                            ) : (
                                <>
                                    {/* Donut with center label */}
                                    <div style={{ position: 'relative', flex: 1, minHeight: '140px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                                <Pie data={deptDistributionData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={deptDistributionData.length > 1 ? 4 : 0} dataKey="value" stroke="none">
                                                    {deptDistributionData.map((entry, index) => (
                                                        <Cell key={`dept-cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    content={({ active, payload }) => {
                                                        if (!active || !payload || !payload.length) return null;
                                                        const d = payload[0].payload;
                                                        return (
                                                            <div style={{ background: '#fff', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: 'none', fontSize: '12px', lineHeight: 1.6, minWidth: '160px' }}>
                                                                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }}></span>
                                                                    {d.name}
                                                                </div>
                                                                <div style={{ color: '#64748b' }}>Employees: <strong style={{ color: '#0f172a' }}>{d.count}</strong></div>
                                                                <div style={{ color: '#64748b' }}>Total Salary: <strong style={{ color: '#3b82f6' }}>₹{d.value.toLocaleString()}</strong></div>
                                                                <div style={{ color: '#64748b' }}>Contribution: <strong style={{ color: '#0f172a' }}>{d.pct}%</strong></div>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center label */}
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>₹{totalPayroll.toLocaleString()}</div>
                                            <div style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>Total Payroll</div>
                                        </div>
                                    </div>
                                    {/* Rich Legend */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px', paddingBottom: '6px', flexShrink: 0 }}>
                                        {deptDistributionData.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569' }}>
                                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color, flexShrink: 0 }}></span>
                                                <span style={{ fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                                <span style={{ fontWeight: 500, color: '#94a3b8', flexShrink: 0, whiteSpace: 'nowrap' }}>₹{item.value.toLocaleString()} ({item.pct}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Footer */}
                        <div style={{ padding: '8px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8' }}>Departments: {totalDeptCount}</span>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8' }}>Total: ₹{totalPayroll.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Payroll Status Overview */}
                    <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', minHeight: '280px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Payroll Status Overview</h3>
                        </div>
                        <div style={{ flex: 1, padding: '0 18px 18px 18px', overflow: 'hidden' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusOverviewData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {statusOverviewData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ===== TABLE: Employee Salary Ledger ===== */}
                <div className="dashboard-card-3d" style={{ overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={15} /> Employee Salary Ledger</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{salaries.length} record{salaries.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ maxHeight: '420px', overflowY: 'auto', overflowX: 'auto' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}><Loader size={24} className="spin-icon"/></div>
                        ) : (
                            <div className="enterprise-table-container">
                            <table className="enterprise-table">
                                <colgroup>
                                    <col style={{ width: '12%' }} /> {/* Employee Name */}
                                    <col style={{ width: '8%' }} />  {/* Employee ID */}
                                    <col style={{ width: '10%' }} /> {/* Department */}
                                    <col style={{ width: '8%' }} />  {/* Month */}
                                    <col style={{ width: '9%' }} />  {/* Base Salary */}
                                    <col style={{ width: '9%' }} />  {/* Adjustments */}
                                    <col style={{ width: '9%' }} />  {/* Net Pay */}
                                    <col style={{ width: '8%' }} />  {/* Pay Method */}
                                    <col style={{ width: '8%' }} />  {/* Pay Date */}
                                    <col style={{ width: '8%' }} />  {/* Status */}
                                    <col style={{ width: '11%' }} /> {/* Actions */}
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Emp ID</th>
                                        <th>Department</th>
                                        <th>Month</th>
                                        <th style={{ textAlign: 'right' }}>Base Salary</th>
                                        <th style={{ textAlign: 'right' }}>Adjustments</th>
                                        <th style={{ textAlign: 'right' }}>Net Pay</th>
                                        <th>Method</th>
                                        <th>Date</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaries.map(s => (
                                        <tr key={s._id}>
                                            <td style={{ padding: '8px 14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 700 }}>
                                                        {(s.employee?.firstName?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {s.employee ? `${s.employee.firstName || ''} ${s.employee.lastName || ''}`.trim() : 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '8px 14px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>{s.employee?.employeeId || '—'}</td>
                                            <td style={{ padding: '8px 14px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.employee?.department || 'N/A'}</td>
                                            <td style={{ padding: '8px 14px', color: '#334155', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap' }}>{s.month}</td>
                                            <td style={{ padding: '8px 14px', color: '#334155', fontWeight: 600, fontSize: '12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>₹{(s.basicSalary || 0).toLocaleString()}</td>
                                            <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px', fontSize: '11px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                                    <span style={{ color: '#10b981' }}>+₹{(s.allowances || 0).toLocaleString()}</span>
                                                    <span style={{ color: '#ef4444' }}>-₹{(s.deductions || 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '8px 14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                                <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 700 }}>₹{(s.netSalary || 0).toLocaleString()}</span>
                                            </td>
                                            <td style={{ padding: '8px 14px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>{s.paymentMethod || '—'}</td>
                                            <td style={{ padding: '8px 14px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>{s.paymentDate ? new Date(s.paymentDate).toLocaleDateString() : '—'}</td>
                                            <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', 
                                                    padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.3px', whiteSpace: 'nowrap',
                                                    background: s.status === 'Paid' ? '#eff6ff' : s.status === 'Approved' ? '#ecfdf5' : s.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
                                                    color: s.status === 'Paid' ? '#2563eb' : s.status === 'Approved' ? '#059669' : s.status === 'Rejected' ? '#dc2626' : '#d97706'
                                                }}>
                                                    {s.status === 'Paid' ? <CheckCircle size={10}/> : s.status === 'Approved' ? <Check size={10}/> : s.status === 'Rejected' ? <AlertCircle size={10}/> : <Clock size={10}/>}
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                    {/* View Payslip — always visible */}
                                                    <button onClick={() => handleViewDetails(s)} title="View Payslip"
                                                        style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e293b', transition: 'all 0.2s', padding: 0, lineHeight: 0 }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}>
                                                        <Eye size={20} strokeWidth={2.25} />
                                                    </button>

                                                    {/* Edit Salary — not for Paid */}
                                                    {s.status !== 'Paid' && (
                                                        <button onClick={() => handleOpenEditModal(s)} title="Edit Salary"
                                                            style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e293b', transition: 'all 0.2s', padding: 0, lineHeight: 0 }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#fffbeb'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}>
                                                            <Pencil size={20} strokeWidth={2.25} />
                                                        </button>
                                                    )}

                                                    {/* Approve / Reject — only for Awaiting Approval */}
                                                    {isAdmin && s.status === 'Awaiting Approval' && (
                                                        <>
                                                            <button onClick={() => handleApprove(s._id)} title="Approve Payroll"
                                                                style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e293b', transition: 'all 0.2s', padding: 0, lineHeight: 0 }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}>
                                                                <CheckCircle size={20} strokeWidth={2.25} />
                                                            </button>
                                                            <button onClick={() => console.log('Reject', s._id)} title="Reject Payroll"
                                                                style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e293b', transition: 'all 0.2s', padding: 0, lineHeight: 0 }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}>
                                                                <XCircle size={20} strokeWidth={2.25} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Pay Button — for Awaiting Approval, Ready To Pay, Approved */}
                                                    {canPay && ['Awaiting Approval', 'Ready To Pay', 'Approved'].includes(s.status) && (
                                                        <button onClick={() => handleOpenPayModal(s)} title="Process Payment"
                                                            style={{ height: '34px', padding: '0 12px', borderRadius: '8px', border: 'none', background: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(16,185,129,0.2)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                            <CreditCard size={16} strokeWidth={2.25} /> Pay
                                                        </button>
                                                    )}

                                                    {/* Download Payslip — only for Paid */}
                                                    {s.status === 'Paid' && (
                                                        <button onClick={() => handleDownload(s)} title="Download Payslip"
                                                            style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e293b', transition: 'all 0.2s', padding: 0, lineHeight: 0 }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.color = '#16a34a'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}>
                                                            <Download size={20} strokeWidth={2.25} />
                                                        </button>
                                                    )}

                                                    {/* Delete — for Awaiting Approval, Approved or Rejected */}
                                                    {canPay && (s.status === 'Approved' || s.status === 'Rejected' || s.status === 'Awaiting Approval') && (
                                                        <button onClick={() => handleDeleteClick(s._id)} title="Delete Record"
                                                            style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e293b', transition: 'all 0.2s', padding: 0, lineHeight: 0 }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}>
                                                            <Trash2 size={20} strokeWidth={2.25} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {salaries.length === 0 && (
                                        <tr>
                                            <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '12px' }}>
                                                No payroll records found. Click "Generate Payroll" to create entries.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== BOTTOM ROW: Recent Activity + Upcoming Payments ===== */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    {/* Recent Payroll Activities */}
                    <div className="dashboard-card-3d" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Recent Payroll Activities</h3>
                        </div>
                        <div style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {[
                                    { icon: CheckCircle, bg: '#ecfdf5', color: '#10b981', title: `${stats.paid} Salaries Disbursed`, time: 'Recently' },
                                    { icon: TrendingUp, bg: '#eff6ff', color: '#3b82f6', title: `${salaries.length} Payroll Entries Generated`, time: 'Current cycle' },
                                    { icon: Clock, bg: '#fffbeb', color: '#d97706', title: `${stats.pending} Awaiting Approval`, time: 'Pending review' },
                                ].map((act, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: act.bg, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <act.icon size={15} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{act.title}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{act.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Salary Payments */}
                    <div className="dashboard-card-3d" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Upcoming Salary Payments</h3>
                        </div>
                        <div style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Next Month Salary</span>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>Due in ~30 days</span>
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#3b82f6' }}>Est. ₹{stats.thisMonth > 0 ? stats.thisMonth.toLocaleString() : '—'}</div>
                                </div>
                                {stats.approved > 0 && (
                                    <div style={{ background: '#f0fdf4', padding: '14px 16px', borderRadius: '10px', border: '1px solid #dcfce7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Approved & Ready</span>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>{stats.approved} employees</span>
                                        </div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>₹{stats.approvedTotal.toLocaleString()}</div>
                                    </div>
                                )}
                                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Bonus Payouts Q2</span>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>Due in 15 days</span>
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#8b5cf6' }}>Est. ₹45,000</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════ MODALS KEEP UNCHANGED ═══════════════════ */}
            


            {/* PAY INDIVIDUAL MODAL */}
            {showPayModal && selectedSalary && (
                <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
                    <div className="glass-card modal-content animate-pop pay-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header pay-header">
                            <div className="flex-center gap-10">
                                <div className="pay-header-icon" style={{background: '#d1fae5', color: '#10b981'}}><CreditCard size={20} /></div>
                                <div>
                                    <h3>Confirm Payment</h3>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setShowPayModal(false)}>✕</button>
                        </div>
                        <div className="p-30">
                            <h2 style={{fontSize: '20px', color: '#0f172a', marginBottom: '8px', fontWeight: 700, textAlign: 'center'}}>
                                Pay ₹{(selectedSalary.netSalary || 0).toLocaleString()} to {selectedSalary.employee ? `${selectedSalary.employee.firstName || ''} ${selectedSalary.employee.lastName || ''}`.trim() : 'Employee'}
                            </h2>
                            <p style={{color: '#64748b', fontSize: '13px', margin: 0, textAlign: 'center', marginBottom: '24px'}}>This will process the salary for {selectedSalary.month}.</p>

                            <div className="form-group mb-20">
                                <label>Payment Method</label>
                                <div className="pay-method-grid">
                                    {['UPI', 'Bank Transfer', 'Cheque', 'Cash'].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`pay-method-btn ${payForm.paymentMethod === m ? 'active' : ''}`}
                                            onClick={() => setPayForm({ paymentMethod: m, paymentDetails: { paymentDate: new Date().toISOString().split('T')[0], chequeDate: m==='Cheque'?new Date().toISOString().split('T')[0]:'' } })}
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

                            <div className="payment-details-container" style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                                {payForm.paymentMethod === 'UPI' && (
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>UPI ID *</label>
                                            <input type="text" placeholder="e.g. name@upi" value={payForm.paymentDetails?.upiId || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, upiId: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Transaction ID *</label>
                                            <input type="text" placeholder="TXN123456" value={payForm.paymentDetails?.transactionId || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, transactionId: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Date *</label>
                                            <input type="date" value={payForm.paymentDetails?.paymentDate || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, paymentDate: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Remarks</label>
                                            <input type="text" placeholder="Optional" value={payForm.paymentDetails?.remarks || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, remarks: e.target.value}})} />
                                        </div>
                                    </div>
                                )}
                                {payForm.paymentMethod === 'Bank Transfer' && (
                                    <div className="form-grid">
                                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                            <label>Bank Name *</label>
                                            <input type="text" placeholder="HDFC, SBI, etc." value={payForm.paymentDetails?.bankName || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, bankName: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Account Number *</label>
                                            <input type="text" placeholder="Account No" value={payForm.paymentDetails?.accountNumber || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, accountNumber: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>IFSC Code *</label>
                                            <input type="text" placeholder="IFSC" value={payForm.paymentDetails?.ifscCode || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, ifscCode: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Transaction Ref *</label>
                                            <input type="text" placeholder="Ref Number" value={payForm.paymentDetails?.transactionReference || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, transactionReference: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Date *</label>
                                            <input type="date" value={payForm.paymentDetails?.paymentDate || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, paymentDate: e.target.value}})} />
                                        </div>
                                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                            <label>Remarks</label>
                                            <input type="text" placeholder="Optional" value={payForm.paymentDetails?.remarks || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, remarks: e.target.value}})} />
                                        </div>
                                    </div>
                                )}
                                {payForm.paymentMethod === 'Cheque' && (
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Cheque Number *</label>
                                            <input type="text" placeholder="000123" value={payForm.paymentDetails?.chequeNumber || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, chequeNumber: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Bank Name *</label>
                                            <input type="text" placeholder="HDFC, SBI, etc." value={payForm.paymentDetails?.bankName || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, bankName: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Cheque Date *</label>
                                            <input type="date" value={payForm.paymentDetails?.chequeDate || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, chequeDate: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Remarks</label>
                                            <input type="text" placeholder="Optional" value={payForm.paymentDetails?.remarks || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, remarks: e.target.value}})} />
                                        </div>
                                    </div>
                                )}
                                {payForm.paymentMethod === 'Cash' && (
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Received By *</label>
                                            <input type="text" placeholder="Person receiving cash" value={payForm.paymentDetails?.receivedBy || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, receivedBy: e.target.value}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Date *</label>
                                            <input type="date" value={payForm.paymentDetails?.paymentDate || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, paymentDate: e.target.value}})} />
                                        </div>
                                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                            <label>Remarks</label>
                                            <input type="text" placeholder="Optional" value={payForm.paymentDetails?.remarks || ''} onChange={e => setPayForm({...payForm, paymentDetails: {...payForm.paymentDetails, remarks: e.target.value}})} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer" style={{justifyContent: 'flex-end', gap: '12px', background: '#f8fafc', borderTop: '1px solid #e2e8f0'}}>
                            <button className="btn-cancel" onClick={() => setShowPayModal(false)}>Cancel</button>
                            <button className="btn-pay-confirm" onClick={handlePaySalary} disabled={paying || !isPayFormValid()} style={{background: !isPayFormValid() ? '#94a3b8' : '#10b981', borderColor: !isPayFormValid() ? '#94a3b8' : '#10b981', color: '#fff', padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: !isPayFormValid() ? 'not-allowed' : 'pointer'}}>
                                {paying ? (
                                    <><Loader size={16} className="spin-icon" /> Processing...</>
                                ) : (
                                    <><CreditCard size={16} /> Confirm Payment</>
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
                                            <span >{s.employee?.userId?.name || s.employee?.firstName || 'Employee'}</span>
                                        </div>
                                        <strong >₹{(s.netSalary || 0).toLocaleString()}</strong>
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

            {/* EDIT MODAL */}
            {showEditModal && selectedSalary && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="glass-card modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="flex-center gap-10">
                                <Pencil className="text-primary" size={20} />
                                <h3>Edit Salary Record</h3>
                            </div>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateSalary}>
                            <div className="p-30">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Employee Name</label>
                                        <input type="text" value={selectedSalary.employee ? `${selectedSalary.employee.firstName || ''} ${selectedSalary.employee.lastName || ''}`.trim() : 'Employee'} disabled style={{background: '#f8fafc', color: '#64748b'}} />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input type="text" value={selectedSalary.employee?.department || 'N/A'} disabled style={{background: '#f8fafc', color: '#64748b'}} />
                                    </div>
                                </div>
                                <div className="form-grid mt-20">
                                    <div className="form-group">
                                        <label>Month</label>
                                        <input type="text" value={selectedSalary.month} disabled style={{background: '#f8fafc', color: '#64748b'}} />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                                            <option value="Pending">Pending</option>
                                            <option value="Awaiting Approval">Awaiting Approval</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Ready To Pay">Ready To Pay</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid mt-20">
                                    <div className="form-group">
                                        <label>Basic Salary (₹)</label>
                                        <input type="number" required value={editForm.basicSalary} onChange={e => setEditForm({...editForm, basicSalary: Number(e.target.value)})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Allowances (₹)</label>
                                        <input type="number" value={editForm.allowances} onChange={e => setEditForm({...editForm, allowances: Number(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="form-grid mt-20">
                                    <div className="form-group">
                                        <label>Deductions (₹)</label>
                                        <input type="number" value={editForm.deductions} onChange={e => setEditForm({...editForm, deductions: Number(e.target.value)})} />
                                    </div>
                                    <div className="form-group" style={{background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0'}}>
                                        <label style={{color: '#16a34a', margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Calculated Net Pay</label>
                                        <div style={{fontSize: '20px', fontWeight: 700, color: '#15803d'}}>
                                            ₹{((Number(editForm.basicSalary) || 0) + (Number(editForm.allowances) || 0) - (Number(editForm.deductions) || 0)).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions mt-10 p-20" style={{borderTop: '1px solid #f1f5f9'}}>
                                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
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
