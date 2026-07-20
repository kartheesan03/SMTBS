import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, CheckCircle, AlertCircle, Loader, Calculator, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

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

    if (loading) {
        return (
            <div className="page-container flex-center" style={{ minHeight: '100vh' }}>
                <Loader size={30} className="spin-icon" color="#3b82f6" />
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'relative' }}
        >
            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toast.ok ? '#10b981' : '#ef4444', animation: 'slideIn 0.3s ease' }}>
                    {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            <div className="page-container" style={{ width: '100%', paddingBottom: '60px' }}>
                
                <div style={{ marginBottom: '24px', maxWidth: '800px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <button 
                            onClick={() => navigate('/payroll')} 
                            style={{ 
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                fontSize: '13px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                padding: '6px 10px 6px 0',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <ArrowLeft size={14} /> Back to Payroll
                        </button>
                    </div>

                    <PageHeader title="Generate New Payroll Entry" badge="HRMS" subtitle="Create employee salary record for selected month" />
                </div>

                <div className="premium-card" style={{ maxWidth: '800px', padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>

                    <form onSubmit={handleGenerate}>
                        <div className="form-group mb-20" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Select Employee</label>
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
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', appearance: 'none', background: '#f8fafc' }}
                            >
                                <option value="">Choose...</option>
                                {employees.length === 0 ? (
                                    <option value="" disabled>No employees available</option>
                                ) : (
                                    employees.map(emp => (
                                        <option key={emp._id || emp.id} value={emp._id || emp.id}>
                                            {emp.firstName} {emp.lastName || ''} - {emp.employeeId || 'No ID'}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="form-grid mb-20" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Month / Period</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.month} 
                                    onChange={e => setFormData({...formData, month: e.target.value})} 
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Basic Salary (₹)</label>
                                <input 
                                    type="number" 
                                    required 
                                    value={formData.basicSalary} 
                                    onChange={e => setFormData({...formData, basicSalary: Number(e.target.value)})} 
                                    placeholder="Enter amount" 
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div className="form-grid mb-20" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Allowances (₹)</label>
                                <input 
                                    type="number" 
                                    value={formData.allowances} 
                                    onChange={e => setFormData({...formData, allowances: Number(e.target.value)})} 
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Deductions (₹)</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                                    <input 
                                        type="number" 
                                        style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} 
                                        value={formData.deductions} 
                                        onChange={e => setFormData({...formData, deductions: Number(e.target.value)})} 
                                    />
                                    <button 
                                        type="button" 
                                        style={{ 
                                            padding: '0 20px', 
                                            whiteSpace: 'nowrap',
                                            background: '#f1f5f9',
                                            color: '#334155',
                                            fontWeight: 600,
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }} 
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                                        onClick={handleCalculateDeductions} 
                                        disabled={calculating}
                                    >
                                        {calculating ? '...' : 'Auto-Calc'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {calcStats && (
                            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}>Total Days</span>
                                        <strong style={{ color: '#0f172a', fontSize: '15px' }}>{calcStats.daysInMonth}</strong>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}>Present</span>
                                        <strong style={{ color: '#10b981', fontSize: '15px' }}>{calcStats.presentDays}</strong>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}>Absent</span>
                                        <strong style={{ color: '#ef4444', fontSize: '15px' }}>{calcStats.absentDays}</strong>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600 }}>Late</span>
                                        <strong style={{ color: '#f59e0b', fontSize: '15px' }}>{calcStats.lateDays}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.basicSalary > 0 && (
                            <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '16px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#1e3a8a', fontWeight: 600, fontSize: '14px' }}>Net Payable:</span>
                                <strong style={{ color: '#1d4ed8', fontSize: '20px', fontWeight: 800 }}>
                                    ₹{((formData.basicSalary || 0) + (formData.allowances || 0) - (formData.deductions || 0)).toLocaleString()}
                                </strong>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                            <button 
                                type="button" 
                                className="btn-cancel" 
                                onClick={() => navigate('/payroll')}
                                style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                style={{
                                    padding: '10px 32px',
                                    background: '#6366f1',
                                    border: 'none',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    opacity: submitting ? 0.7 : 1,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
                                }}
                                onMouseEnter={(e) => { if(!submitting) { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                                onMouseLeave={(e) => { if(!submitting) { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'translateY(0)'; }}}
                            >
                                {submitting ? 'Generating...' : 'Submit Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default GeneratePayroll;
