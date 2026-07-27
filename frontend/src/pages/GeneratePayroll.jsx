import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
    ArrowLeft, CheckCircle, AlertCircle, Loader, Calculator,
    User, Briefcase, Calendar, Hash, IndianRupee, Clock,
    TrendingUp, TrendingDown, BadgeCheck, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';

/* ────── Inline Styles Object ────── */
const s = {
    wrapper: {
        position: 'relative',
    },
    toast: (ok) => ({
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 22px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#fff',
        background: ok ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
        boxShadow: ok
            ? '0 8px 24px rgba(16,185,129,0.3)'
            : '0 8px 24px rgba(239,68,68,0.3)',
        animation: 'slideIn 0.3s ease',
    }),
    backBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        fontSize: '13px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        padding: '6px 10px 6px 0',
        transition: 'all 0.2s ease',
    },
    splitGrid: {
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: '0',
        maxWidth: '960px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
    },
    /* ── LEFT PANEL ── */
    leftPanel: {
        background: 'linear-gradient(160deg, #4F46E5 0%, #6366f1 50%, #818cf8 100%)',
        padding: '36px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
    },
    leftOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
    },
    avatar: (hasSelection) => ({
        width: '88px',
        height: '88px',
        borderRadius: '50%',
        background: hasSelection ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
        border: '3px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        transition: 'all 0.4s ease',
        position: 'relative',
        zIndex: 1,
    }),
    avatarInitials: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '1px',
        fontFamily: "'Outfit', sans-serif",
    },
    empName: {
        fontSize: '18px',
        fontWeight: 700,
        color: '#fff',
        marginBottom: '2px',
        textAlign: 'center',
        fontFamily: "'Outfit', sans-serif",
        position: 'relative',
        zIndex: 1,
    },
    empId: {
        fontSize: '12px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '24px',
        letterSpacing: '0.5px',
        position: 'relative',
        zIndex: 1,
    },
    divider: {
        width: '100%',
        height: '1px',
        background: 'rgba(255,255,255,0.15)',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1,
    },
    detailRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '10px 14px',
        marginBottom: '6px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.2s ease',
        position: 'relative',
        zIndex: 1,
    },
    detailIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    detailLabel: {
        fontSize: '11px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    detailValue: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#fff',
    },
    placeholderText: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 1.6,
        position: 'relative',
        zIndex: 1,
        marginTop: '16px',
    },

    /* ── RIGHT PANEL ── */
    rightPanel: {
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
    },
    formTitle: {
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--text-heading)',
        marginBottom: '4px',
        fontFamily: "'Outfit', sans-serif",
    },
    formSubtitle: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginBottom: '28px',
    },
    formLabel: {
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
    },
    formInput: {
        width: '100%',
        padding: '11px 14px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-input)',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--text-heading)',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    formSelect: {
        width: '100%',
        padding: '11px 40px 11px 14px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-input)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        backgroundSize: '16px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--text-heading)',
        outline: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    autoCalcBtn: {
        padding: '0 16px',
        whiteSpace: 'nowrap',
        background: 'var(--bg-hover)',
        color: 'var(--text-heading)',
        fontWeight: 600,
        fontSize: '12px',
        border: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    calcStatsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        fontSize: '12px',
    },
    calcStat: (color) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '10px 12px',
        background: color === '#10b981' ? 'var(--success-bg)' :
            color === '#ef4444' ? 'var(--danger-bg)' :
                color === '#f59e0b' ? 'var(--warning-bg)' : 'var(--bg-hover)',
    }),
    netPayable: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
        border: '1px solid #c7d2fe',
    },
    actionBar: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        borderTop: '1px solid var(--border-light)',
        paddingTop: '24px',
        marginTop: 'auto',
    },
    cancelBtn: {
        padding: '10px 22px',
        fontSize: '13px',
        fontWeight: 600,
        background: 'var(--bg-hover)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    submitBtn: (disabled) => ({
        padding: '10px 28px',
        fontSize: '13px',
        fontWeight: 600,
        background: disabled ? '#a5b4fc' : 'linear-gradient(135deg, #4F46E5, #6366f1)',
        color: '#fff',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.8 : 1,
        transition: 'all 0.25s',
        boxShadow: disabled ? 'none' : '0 4px 14px rgba(79,70,229,0.3)',
    }),
};

const GeneratePayroll = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [calcStats, setCalcStats] = useState(null);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        employeeId: '',
        month: `${new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date())} ${new Date().getFullYear()}`,
        basicSalary: '',
        allowances: 0,
        deductions: 0
    });

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    const selectedEmployee = useMemo(() => {
        if (!formData.employeeId) return null;
        return employees.find(emp => String(emp._id || emp.id) === formData.employeeId) || null;
    }, [formData.employeeId, employees]);

    const netPayable = useMemo(() => {
        return (Number(formData.basicSalary) || 0) + (Number(formData.allowances) || 0) - (Number(formData.deductions) || 0);
    }, [formData.basicSalary, formData.allowances, formData.deductions]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const { data } = await API.get('/employees');
                setEmployees(Array.isArray(data) ? data : (data?.employees || []));
            } catch (err) {
                console.error('Fetch Employees Error:', err);
                showToast(err.response?.data?.message || 'Failed to load employees', false);
                setEmployees([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

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

    const handleGenerate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/salaries', formData);
            showToast('Payroll entry generated successfully.');
            setTimeout(() => {
                navigate('/payroll');
            }, 1500);
        } catch (err) {
            showToast(err.response?.data?.message || 'Error generating payroll', false);
            setSubmitting(false);
        }
    };

    const getInitials = (emp) => {
        if (!emp) return '';
        const f = emp.firstName?.[0] || '';
        const l = emp.lastName?.[0] || '';
        return (f + l).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="page-container flex-center" style={{ minHeight: '100vh' }}>
                <Loader size={30} className="spin-icon" color="var(--primary)" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={s.wrapper}
        >
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, x: 40, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 40, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        style={s.toast(toast.ok)}
                    >
                        {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="page-container" style={{ width: '100%', paddingBottom: '60px' }}>

                {/* Back + Header */}
                <div style={{ marginBottom: '20px', maxWidth: '960px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <button
                            onClick={() => navigate('/payroll')}
                            style={s.backBtn}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-heading)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            <ArrowLeft size={14} /> Back to Payroll
                        </button>
                    </div>
                    <PageHeader title="Generate New Payroll Entry" badge="HRMS" subtitle="Create employee salary record for selected month" />
                </div>

                {/* ═══ SPLIT LAYOUT ═══ */}
                <div style={s.splitGrid}>

                    {/* ── LEFT: Employee Details Panel ── */}
                    <div style={s.leftPanel}>
                        <div style={s.leftOverlay} />

                        <AnimatePresence mode="wait">
                            {selectedEmployee ? (
                                <motion.div
                                    key={selectedEmployee._id || selectedEmployee.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
                                >
                                    {/* Avatar */}
                                    <div style={s.avatar(true)}>
                                        <span style={s.avatarInitials}>{getInitials(selectedEmployee)}</span>
                                    </div>

                                    {/* Name & ID */}
                                    <div style={s.empName}>
                                        {selectedEmployee.firstName} {selectedEmployee.lastName || ''}
                                    </div>
                                    <div style={s.empId}>
                                        {selectedEmployee.employeeId || 'No ID'}
                                    </div>

                                    <div style={s.divider} />

                                    {/* Detail Rows */}
                                    {selectedEmployee.department && (
                                        <div style={s.detailRow}>
                                            <div style={s.detailIcon}><Building2 size={14} color="rgba(255,255,255,0.8)" /></div>
                                            <div>
                                                <div style={s.detailLabel}>Department</div>
                                                <div style={s.detailValue}>{selectedEmployee.department}</div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedEmployee.designation && (
                                        <div style={s.detailRow}>
                                            <div style={s.detailIcon}><Briefcase size={14} color="rgba(255,255,255,0.8)" /></div>
                                            <div>
                                                <div style={s.detailLabel}>Designation</div>
                                                <div style={s.detailValue}>{selectedEmployee.designation}</div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedEmployee.joiningDate && (
                                        <div style={s.detailRow}>
                                            <div style={s.detailIcon}><Calendar size={14} color="rgba(255,255,255,0.8)" /></div>
                                            <div>
                                                <div style={s.detailLabel}>Joining Date</div>
                                                <div style={s.detailValue}>{formatDate(selectedEmployee.joiningDate)}</div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedEmployee.salary != null && (
                                        <div style={s.detailRow}>
                                            <div style={s.detailIcon}><IndianRupee size={14} color="rgba(255,255,255,0.8)" /></div>
                                            <div>
                                                <div style={s.detailLabel}>Base Salary</div>
                                                <div style={s.detailValue}>₹{Number(selectedEmployee.salary).toLocaleString('en-IN')}</div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}
                                >
                                    <div style={s.avatar(false)}>
                                        <User size={36} color="rgba(255,255,255,0.35)" />
                                    </div>
                                    <div style={s.placeholderText}>
                                        Select an employee from<br />the form to see their profile
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── RIGHT: Salary Form ── */}
                    <div style={s.rightPanel}>
                        <div style={s.formTitle}>Salary Details</div>
                        <div style={s.formSubtitle}>Fill in the compensation for this period</div>

                        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

                            {/* Employee Select */}
                            <div>
                                <label style={s.formLabel}>Employee</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        required
                                        value={formData.employeeId}
                                        onChange={e => {
                                            const selectedEmp = employees.find(emp => String(emp._id || emp.id) === e.target.value);
                                            setFormData({
                                                ...formData,
                                                employeeId: e.target.value,
                                                basicSalary: selectedEmp?.salary || formData.basicSalary
                                            });
                                            setCalcStats(null);
                                        }}
                                        style={{
                                            ...s.formSelect,
                                            background: 'var(--bg-surface)',
                                            backgroundImage: 'none',
                                            boxShadow: 'none',
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring-focus)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                                    >
                                        <option value="">Choose employee...</option>
                                        {employees.length === 0 ? (
                                            <option value="" disabled>No employees available</option>
                                        ) : (
                                            employees.map(emp => (
                                                <option key={emp._id || emp.id} value={emp._id || emp.id}>
                                                    {emp.firstName} {emp.lastName || ''} — {emp.employeeId || 'No ID'}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <div style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Month + Basic Salary */}
                            <div style={s.twoCol}>
                                <div>
                                    <label style={s.formLabel}>Month / Period</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.month}
                                        onChange={e => setFormData({ ...formData, month: e.target.value })}
                                        style={s.formInput}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring-focus)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Basic Salary (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.basicSalary}
                                        onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                                        placeholder="Enter amount"
                                        style={s.formInput}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring-focus)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Allowances + Deductions */}
                            <div style={s.twoCol}>
                                <div>
                                    <label style={s.formLabel}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <TrendingUp size={12} color="var(--success)" /> Allowances (₹)
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.allowances}
                                        onChange={e => setFormData({ ...formData, allowances: Number(e.target.value) })}
                                        style={s.formInput}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring-focus)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <label style={s.formLabel}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <TrendingDown size={12} color="var(--danger)" /> Deductions (₹)
                                        </span>
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                                        <input
                                            type="number"
                                            style={{ ...s.formInput, flex: 1 }}
                                            value={formData.deductions}
                                            onChange={e => setFormData({ ...formData, deductions: Number(e.target.value) })}
                                            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring-focus)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                        <button
                                            type="button"
                                            style={s.autoCalcBtn}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-active)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                            onClick={handleCalculateDeductions}
                                            disabled={calculating}
                                        >
                                            <Calculator size={13} />
                                            {calculating ? '...' : 'Auto'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Stats (after auto-calc) */}
                            <AnimatePresence>
                                {calcStats && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div style={s.calcStatsGrid}>
                                            <div style={s.calcStat('#64748b')}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Days</span>
                                                <strong style={{ color: 'var(--text-heading)', fontSize: '16px' }}>{calcStats.daysInMonth}</strong>
                                            </div>
                                            <div style={s.calcStat('#10b981')}>
                                                <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>Present</span>
                                                <strong style={{ color: 'var(--success)', fontSize: '16px' }}>{calcStats.presentDays}</strong>
                                            </div>
                                            <div style={s.calcStat('#ef4444')}>
                                                <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>Absent</span>
                                                <strong style={{ color: 'var(--danger)', fontSize: '16px' }}>{calcStats.absentDays}</strong>
                                            </div>
                                            <div style={s.calcStat('#f59e0b')}>
                                                <span style={{ color: 'var(--warning-text)', fontWeight: 600 }}>Late</span>
                                                <strong style={{ color: 'var(--warning)', fontSize: '16px' }}>{calcStats.lateDays}</strong>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Net Payable */}
                            <AnimatePresence>
                                {formData.basicSalary > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.2 }}
                                        style={s.netPayable}
                                    >
                                        <span style={{ color: '#1e3a8a', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <BadgeCheck size={16} color="#4F46E5" /> Net Payable
                                        </span>
                                        <strong style={{ color: '#4F46E5', fontSize: '22px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                                            ₹{netPayable.toLocaleString('en-IN')}
                                        </strong>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div style={s.actionBar}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/payroll')}
                                    style={s.cancelBtn}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-active)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={s.submitBtn(submitting)}
                                    onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)'; } }}
                                    onMouseLeave={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.3)'; } }}
                                >
                                    {submitting ? 'Generating...' : 'Generate Payroll'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GeneratePayroll;
