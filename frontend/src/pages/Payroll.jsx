import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, CreditCard, User, FileText, Play, CheckCircle } from 'lucide-react';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { HRMSKPICard } from '../components/HRMSShared';

const Payroll = () => {
    const navigate = useNavigate();
    
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('All');
    const [deptFilter, setDeptFilter] = useState('All');

    const fetchSalaries = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/salaries');
            setSalaries(res.data || []);
        } catch (err) {
            console.error('Failed to fetch salaries:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalaries();
    }, [fetchSalaries]);

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '₹0';
        // Check if amount is >= 1,00,000 for 'L' format in KPIs, else format normally
        if (amount >= 100000 && arguments[1] === 'short') {
            return `₹${(amount / 100000).toFixed(1)}L`;
        }
        if (amount >= 1000 && arguments[1] === 'short') {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate dynamic KPIs
    const totalGross = salaries.reduce((sum, s) => sum + (s.basicSalary || 0) + (s.allowances || 0), 0);
    const totalNet = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
    const totalPF = salaries.reduce((sum, s) => sum + ((s.basicSalary || 0) * 0.12), 0); // Assuming 12% PF for KPI
    const totalTax = salaries.reduce((sum, s) => sum + (s.deductions || 0) - ((s.basicSalary || 0) * 0.12), 0); // Remaining deductions as Tax

    // Trend mock generator
    const makeTrend = (base) => Array.from({length: 8}, () => ({v: Math.max(0, base + Math.floor(Math.random() * 4 - 2))}));

    const getStatusBadge = (status) => {
        if (status === 'Paid') return <span className="rd-status-badge rd-status-green"><span className="rd-legend-dot" style={{background: '#10b981', display:'inline-block', marginRight: 6}}></span>Paid</span>;
        if (status === 'Approved') return <span className="rd-status-badge rd-status-blue"><span className="rd-legend-dot" style={{background: '#3b82f6', display:'inline-block', marginRight: 6}}></span>Approved</span>;
        if (status === 'Awaiting Approval') return <span className="rd-status-badge rd-status-orange"><span className="rd-legend-dot" style={{background: '#f59e0b', display:'inline-block', marginRight: 6}}></span>Pending</span>;
        return <span className="rd-status-badge rd-status-blue">{status}</span>;
    };

    const getInitials = (firstName, lastName) => `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??';

    // Filters setup
    const departments = ['All', ...new Set(salaries.map(s => s.employee?.department).filter(Boolean))];
    const months = ['All', ...new Set(salaries.map(s => s.month).filter(Boolean))];

    const filteredSalaries = salaries.filter(record => {
        const emp = record.employee || {};
        const name = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        
        const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
        const matchesMonth = monthFilter === 'All' || record.month === monthFilter;

        return matchesSearch && matchesDept && matchesMonth;
    });

    const handleProcessAll = async () => {
        if(window.confirm('Process payments for all Approved salary records?')) {
            try {
                await API.put('/salaries/pay-all');
                fetchSalaries();
            } catch (err) {
                alert(err.response?.data?.message || 'Error processing payroll');
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await API.put(`/salaries/${id}/approve`);
            fetchSalaries();
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving salary');
        }
    };

    const handlePay = async (id) => {
        try {
            await API.put(`/salaries/${id}/pay`);
            fetchSalaries();
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing payment');
        }
    };

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>PM</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Payroll Management</span>
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>HRMS</span>
                        </div>
                        <div className="rd-module-desc">Process salaries, view slips and manage deductions</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <HRMSKPICard title="Total Gross Payroll" val={formatCurrency(totalGross, 'short')} sub="↗ Gross across records" color="blue" data={makeTrend(8)} icon={Briefcase} />
                    <HRMSKPICard title="Total Net Pay" val={formatCurrency(totalNet, 'short')} sub="↗ After deductions" color="green" data={makeTrend(6)} icon={CreditCard} />
                    <HRMSKPICard title="Est. PF Contributions" val={formatCurrency(totalPF, 'short')} sub="↗ 12% of basic salary" color="orange" data={makeTrend(4)} icon={User} />
                    <HRMSKPICard title="Other Deductions" val={formatCurrency(totalTax > 0 ? totalTax : 0, 'short')} sub="↘ TDS/Other this cycle" color="red" data={makeTrend(3)} icon={FileText} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: 'none'}}>
                        <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
                            <div className="rd-search-bar" style={{width: 250, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" />
                                <input
                                    type="text"
                                    className="rd-search-input"
                                    placeholder="Search employee..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
                            </select>
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
                            </select>
                        </div>
                        <div className="rd-table-actions">
                            <button className="rd-btn-solid" style={{background: '#10b981'}} onClick={handleProcessAll}>
                                <Play size={16} style={{marginRight: 8, verticalAlign: 'middle'}} fill="currentColor" />
                                Pay All Approved
                            </button>
                        </div>
                    </div>
                    
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Basic</th>
                                <th>Allowances</th>
                                <th>Gross</th>
                                <th>Deductions</th>
                                <th>Net Pay</th>
                                <th>Status</th>
                                <th style={{textAlign: 'center', width: 100}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading payroll data...</td>
                                </tr>
                            ) : filteredSalaries.length === 0 ? (
                                <tr>
                                    <td colSpan={10} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>No salary records match your criteria</td>
                                </tr>
                            ) : (
                                filteredSalaries.map((record, i) => {
                                    const emp = record.employee || {};
                                    const gross = (record.basicSalary || 0) + (record.allowances || 0);
                                    
                                    return (
                                        <tr key={record._id || record.id || i}>
                                            <td style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{record.month}</td>
                                            <td>
                                                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                    <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: 'var(--rd-blue-grad)'}}>
                                                        {getInitials(emp.firstName, emp.lastName)}
                                                    </div>
                                                    <div>
                                                        <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{`${emp.firstName || ''} ${emp.lastName || ''}`.trim()}</div>
                                                        <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{emp.designation || '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600}}>
                                                    {emp.department || '—'}
                                                </span>
                                            </td>
                                            <td style={{color: '#64748b'}}>{formatCurrency(record.basicSalary)}</td>
                                            <td style={{color: '#64748b'}}>{formatCurrency(record.allowances)}</td>
                                            <td style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{formatCurrency(gross)}</td>
                                            <td style={{color: '#ef4444'}}>{formatCurrency(record.deductions)}</td>
                                            <td style={{fontWeight: 700, color: '#10b981'}}>{formatCurrency(record.netSalary)}</td>
                                            <td>{getStatusBadge(record.status)}</td>
                                            <td style={{textAlign: 'center'}}>
                                                {record.status === 'Awaiting Approval' && (
                                                    <button onClick={() => handleApprove(record._id || record.id)} style={{background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer'}}>
                                                        Approve
                                                    </button>
                                                )}
                                                {record.status === 'Approved' && (
                                                    <button onClick={() => handlePay(record._id || record.id)} style={{background: '#10b981', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer'}}>
                                                        Pay Now
                                                    </button>
                                                )}
                                                {record.status === 'Paid' && (
                                                    <CheckCircle size={20} color="#10b981" />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
