import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownRight, Briefcase, Plus } from 'lucide-react';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import { HRMSKPICard } from '../components/HRMSShared';

const HRMS = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    // Mock data for tiny trend charts (bars)
    const trendData1 = [{v: 2},{v: 4},{v: 3},{v: 5},{v: 4},{v: 6},{v: 5},{v: 7}];
    const trendData2 = [{v: 5},{v: 4},{v: 6},{v: 5},{v: 8},{v: 6},{v: 9},{v: 8}];
    const trendData3 = [{v: 1},{v: 2},{v: 1},{v: 3},{v: 2},{v: 1},{v: 3},{v: 2}];
    const trendData4 = [{v: 4},{v: 3},{v: 5},{v: 2},{v: 4},{v: 3},{v: 2},{v: 1}];

    const employeesData = [
        { id: 'EMP-014', name: 'Tarun Bose', dept: 'IT', position: 'DevOps Engineer', email: 'tarun.b@smtbls.in', phone: '9876543223', level: 'Staff', status: 'Active' },
        { id: 'EMP-3DAB', name: 'Sameer Khan', dept: 'Sales', position: 'Sales Executive', email: 'sameer.k@smtbls.in', phone: '9876543221', level: 'Staff', status: 'Active' },
        { id: 'EMP-011', name: 'Ritu Agarwal', dept: 'Engineering', position: 'Frontend Developer', email: 'ritu.a@smtbls.in', phone: '9876543210', level: 'Senior', status: 'Active' },
        { id: 'EMP-015', name: 'Neha Chatterjee', dept: 'Operations', position: 'Operations Mgr', email: 'neha.c@smtbls.in', phone: '9876543244', level: 'Manager', status: 'On Leave' },
    ];

    const getStatusBadge = (status) => {
        if (status === 'Active') return <span className="rd-status-badge rd-status-green"><span className="rd-legend-dot" style={{background: '#10b981', display:'inline-block', marginRight: 6}}></span>Active</span>;
        if (status === 'On Leave') return <span className="rd-status-badge rd-status-orange"><span className="rd-legend-dot" style={{background: '#f59e0b', display:'inline-block', marginRight: 6}}></span>On Leave</span>;
        if (status === 'Inactive') return <span className="rd-status-badge rd-status-red"><span className="rd-legend-dot" style={{background: '#ef4444', display:'inline-block', marginRight: 6}}></span>Inactive</span>;
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
                        <span style={{fontSize: 24, fontWeight: 800}}>ED</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Employee Directory</span>
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>HRMS</span>
                        </div>
                        <div className="rd-module-desc">Manage all employee records, profiles and status</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <HRMSKPICard title="Total Employees" val="128" sub="↑ 4 this month" color="blue" data={trendData1} icon={Users} />
                    <HRMSKPICard title="Active" val="115" sub="↗ 90% of workforce" color="green" data={trendData2} icon={CheckCircle} />
                    <HRMSKPICard title="On Leave" val="8" sub="↘ 6% of total" color="orange" data={trendData3} icon={Clock} />
                    <HRMSKPICard title="Inactive" val="5" sub="↘ Marked inactive" color="red" data={trendData4} icon={XCircle} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: 'none'}}>
                        <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
                            <div className="rd-search-bar" style={{width: 250, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search employees..." />
                            </div>
                            <select style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}>
                                <option>All Depts</option>
                                <option>IT</option>
                                <option>Sales</option>
                            </select>
                            <select style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}>
                                <option>All Status</option>
                                <option>Active</option>
                                <option>On Leave</option>
                            </select>
                        </div>
                        <div className="rd-table-actions">
                            <button className="rd-btn-solid" onClick={() => navigate('/employees/new')}>
                                <Plus size={16} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                                Add Employee
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
                                <th>Position</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Level</th>
                                <th>Status</th>
                                <th style={{width: 40}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeesData.map(emp => (
                                <tr key={emp.id}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                            <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: 'var(--rd-purple-grad)'}}>
                                                {getInitials(emp.name)}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{emp.name}</div>
                                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{emp.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600}}>
                                            {emp.dept}
                                        </span>
                                    </td>
                                    <td style={{fontWeight: 500}}>{emp.position}</td>
                                    <td style={{color: 'var(--rd-blue)'}}>{emp.email}</td>
                                    <td style={{color: '#64748b'}}>{emp.phone}</td>
                                    <td>
                                        <span style={{background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>
                                            {emp.level}
                                        </span>
                                    </td>
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

export default HRMS;
