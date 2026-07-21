import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, CreditCard, User, FileText, Play, CheckCircle , DollarSign} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import { formatCurrency } from '../utils/currency';

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

    // Calculate dynamic KPIs
    const totalGross = salaries.reduce((sum, s) => sum + (s.basicSalary || 0) + (s.allowances || 0), 0);
    const totalNet = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
    const totalPF = salaries.reduce((sum, s) => sum + ((s.basicSalary || 0) * 0.12), 0); // Assuming 12% PF for KPI
    const totalTax = salaries.reduce((sum, s) => sum + (s.deductions || 0) - ((s.basicSalary || 0) * 0.12), 0); // Remaining deductions as Tax

    // Trend mock generator
    

    const getStatusBadge = (status) => {
        if (status === 'Paid') return <span className="ui-badge success"><div style={{width: 6, height: 6, borderRadius: '50%', background: '#059669'}}></div>Paid</span>;
        if (status === 'Approved') return <span className="ui-badge info"><div style={{width: 6, height: 6, borderRadius: '50%', background: '#2563EB'}}></div>Approved</span>;
        if (status === 'Awaiting Approval') return <span className="ui-badge warning"><div style={{width: 6, height: 6, borderRadius: '50%', background: '#D97706'}}></div>Pending</span>;
        return <span className="ui-badge default">{status}</span>;
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

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container"
        >
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Payroll Management</span>
                            <span className="rd-module-badge">HRMS</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <PastelKPIGrid>
                    <PastelKPICard title="Gross Payroll" value={formatCurrency(totalGross, 'short')} colorTheme="blue" icon={Briefcase} trendValue="Total payout" trendPositive={true} />
                    <PastelKPICard title="Net Payroll" value={formatCurrency(totalNet, 'short')} colorTheme="mint" icon={CreditCard} trendValue="After deductions" trendPositive={true} />
                    <PastelKPICard title="Provident Fund" value={formatCurrency(totalPF, 'short')} colorTheme="purple" icon={DollarSign} trendValue="12% PF" trendPositive={true} />
                    <PastelKPICard title="Tax & Deductions" value={formatCurrency(totalTax > 0 ? totalTax : 0, 'short')} colorTheme="peach" icon={FileText} trendValue="Other deductions" trendPositive={false} />
                </PastelKPIGrid>

                {/* Table Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rd-table-card"
                >
                    <div className="rd-table-header" style={{borderBottom: 'none', flexWrap: 'wrap', gap: 16}}>
                        <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', flex: 1}}>
                            <div className="rd-search-bar" style={{minWidth: 150, flexShrink: 1, background: '#fff', flex: 1}}>
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
                        <div className="rd-table-actions" style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', gap: 12 }}>
                            <button className="rd-btn-solid" style={{background: '#6366f1'}} onClick={() => navigate('/payroll/generate')}>
                                <DollarSign size={16} style={{marginRight: 8, verticalAlign: 'middle'}} />
                                Generate Payroll
                            </button>
                            <button className="rd-btn-solid" style={{background: '#10b981'}} onClick={handleProcessAll}>
                                <Play size={16} style={{marginRight: 8, verticalAlign: 'middle'}} fill="currentColor" />
                                Pay All Approved
                            </button>
                        </div>
                    </div>
                    
                    <div className="rd-table-wrapper">
                        <div className="rd-table-scroll">
                            <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                <th>Month</th>
                                <th style={{padding: '10px 12px'}}>Employee</th>
                                <th>Department</th>
                                <th style={{textAlign: 'right'}}>Basic</th>
                                <th style={{textAlign: 'right'}}>Allowances</th>
                                <th style={{textAlign: 'right'}}>Gross</th>
                                <th style={{textAlign: 'right'}}>Deductions</th>
                                <th style={{textAlign: 'right'}}>Net Pay</th>
                                <th>Status</th>
                                <th style={{textAlign: 'center', width: 80}}>Action</th>
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
                                            <td style={{padding: '11px 12px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                    <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: 'var(--rd-blue-grad)', flexShrink: 0}}>
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
                                            <td style={{color: '#64748b', textAlign: 'right'}}>{formatCurrency(record.basicSalary)}</td>
                                            <td style={{color: '#64748b', textAlign: 'right'}}>{formatCurrency(record.allowances)}</td>
                                            <td style={{fontWeight: 600, color: 'var(--rd-text-main)', textAlign: 'right'}}>{formatCurrency(gross)}</td>
                                            <td style={{color: '#ef4444', textAlign: 'right'}}>{formatCurrency(record.deductions)}</td>
                                            <td style={{fontWeight: 700, color: '#10b981', textAlign: 'right'}}>{formatCurrency(record.netSalary)}</td>
                                            <td>{getStatusBadge(record.status)}</td>
                                            <td style={{textAlign: 'center'}} data-label="Action">
                                                {record.status === 'Awaiting Approval' && (
                                                    <button onClick={() => handleApprove(record._id || record.id)} className="rd-btn-compact outline" style={{borderColor: '#3b82f6', color: '#3b82f6'}}>
                                                        Approve
                                                    </button>
                                                )}
                                                {record.status === 'Approved' && (
                                                    <button onClick={() => navigate(`/payroll/payment/${record._id || record.id}`)} className="rd-btn-compact primary" style={{background: '#10b981'}}>
                                                        Pay Now
                                                    </button>
                                                )}
                                                {record.status === 'Paid' && (
                                                    <CheckCircle size={16} color="#10b981" />
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
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Payroll;
