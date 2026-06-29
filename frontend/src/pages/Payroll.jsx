import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, CreditCard, User, FileText, Play } from 'lucide-react';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import { HRMSKPICard } from '../components/HRMSShared';

const Payroll = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    // Mock data for tiny trend charts
    const trendData1 = [{v: 4},{v: 5},{v: 6},{v: 5},{v: 8},{v: 7},{v: 9},{v: 8}];
    const trendData2 = [{v: 2},{v: 4},{v: 3},{v: 5},{v: 6},{v: 5},{v: 7},{v: 6}];
    const trendData3 = [{v: 2},{v: 3},{v: 2},{v: 4},{v: 3},{v: 4},{v: 5},{v: 4}];
    const trendData4 = [{v: 1},{v: 2},{v: 1},{v: 3},{v: 2},{v: 3},{v: 2},{v: 4}];

    const payrollData = [
        { id: 'EMP-011', name: 'Ritu Agarwal', role: 'Jr. Engineer', dept: 'Engineering', basic: '₹24,000', hra: '₹9,600', gross: '₹48,000', net: '₹38,400', status: 'Processed' },
        { id: 'EMP-016', name: 'Lata Mishra', role: 'Jr. Finance Analyst', dept: 'Finance', basic: '₹22,500', hra: '₹9,000', gross: '₹45,000', net: '₹36,000', status: 'Processed' },
    ];

    const getStatusBadge = (status) => {
        if (status === 'Processed') return <span className="rd-status-badge rd-status-green"><span className="rd-legend-dot" style={{background: '#10b981', display:'inline-block', marginRight: 6}}></span>Processed</span>;
        if (status === 'Pending') return <span className="rd-status-badge rd-status-orange"><span className="rd-legend-dot" style={{background: '#f59e0b', display:'inline-block', marginRight: 6}}></span>Pending</span>;
        return <span className="rd-status-badge rd-status-blue">{status}</span>;
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => {}} />

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
                    <HRMSKPICard title="Total Gross Payroll" val="₹2.7L" sub="↗ Gross this cycle" color="blue" data={trendData1} icon={Briefcase} />
                    <HRMSKPICard title="Total Net Pay" val="₹2.2L" sub="↗ After deductions" color="green" data={trendData2} icon={CreditCard} />
                    <HRMSKPICard title="PF Contributions" val="₹33K" sub="↗ 12% of basic salary" color="orange" data={trendData3} icon={User} />
                    <HRMSKPICard title="Tax Deducted" val="₹22K" sub="↘ TDS this month" color="red" data={trendData4} icon={FileText} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: 'none'}}>
                        <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
                            <div className="rd-search-bar" style={{width: 250, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search employee..." />
                            </div>
                            <select style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}>
                                <option>Jun 2026</option>
                                <option>May 2026</option>
                                <option>Apr 2026</option>
                            </select>
                            <select style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}>
                                <option>All Depts</option>
                                <option>Engineering</option>
                                <option>Finance</option>
                            </select>
                        </div>
                        <div className="rd-table-actions">
                            <button className="rd-btn-solid" style={{background: '#10b981'}}>
                                <Play size={16} style={{marginRight: 8, verticalAlign: 'middle'}} fill="currentColor" />
                                Process All
                            </button>
                        </div>
                    </div>
                    
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th style={{width: 40}}>
                                    <input type="checkbox" />
                                </th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Basic</th>
                                <th>HRA</th>
                                <th>Gross</th>
                                <th>Net Pay</th>
                                <th>Status</th>
                                <th style={{width: 40}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollData.map((emp, i) => (
                                <tr key={i}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                            <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: emp.name === 'Ritu Agarwal' ? 'var(--rd-orange-grad)' : 'var(--rd-purple-grad)'}}>
                                                {getInitials(emp.name)}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{emp.name}</div>
                                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{emp.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{background: emp.dept === 'Finance' ? '#fdf2f8' : '#eff6ff', color: emp.dept === 'Finance' ? '#db2777' : '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600}}>
                                            {emp.dept}
                                        </span>
                                    </td>
                                    <td style={{color: '#64748b'}}>{emp.basic}</td>
                                    <td style={{color: '#64748b'}}>{emp.hra}</td>
                                    <td style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{emp.gross}</td>
                                    <td style={{fontWeight: 700, color: '#10b981'}}>{emp.net}</td>
                                    <td>{getStatusBadge(emp.status)}</td>
                                    <td>
                                        <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}>•••</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
