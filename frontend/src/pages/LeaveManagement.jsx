import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import { HRMSKPICard } from '../components/HRMSShared';

const LeaveManagement = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    // Mock data for tiny trend charts
    const trendData1 = [{v: 4},{v: 5},{v: 6},{v: 5},{v: 8},{v: 7},{v: 9},{v: 8}];
    const trendData2 = [{v: 2},{v: 1},{v: 3},{v: 4},{v: 2},{v: 1},{v: 3},{v: 2}];
    const trendData3 = [{v: 2},{v: 4},{v: 3},{v: 3},{v: 6},{v: 5},{v: 5},{v: 6}];
    const trendData4 = [{v: 0},{v: 0},{v: 0},{v: 1},{v: 0},{v: 1},{v: 1},{v: 0}];

    const leaveData = [
        { id: 'LV-001', name: 'Tarun Bose', dept: 'IT', type: 'Casual Leave', from: '2026-06-14', to: '2026-06-14', days: '1d', status: 'Pending' },
        { id: 'LV-002', name: 'Ritu Agarwal', dept: 'Engineering', type: 'Sick Leave', from: '2026-05-30', to: '2026-05-31', days: '2d', status: 'Approved' },
    ];

    const getStatusBadge = (status) => {
        if (status === 'Approved') return <span className="rd-status-badge rd-status-green"><span className="rd-legend-dot" style={{background: '#10b981', display:'inline-block', marginRight: 6}}></span>Approved</span>;
        if (status === 'Rejected') return <span className="rd-status-badge rd-status-red"><span className="rd-legend-dot" style={{background: '#ef4444', display:'inline-block', marginRight: 6}}></span>Rejected</span>;
        if (status === 'Pending') return <span className="rd-status-badge rd-status-orange"><span className="rd-legend-dot" style={{background: '#f59e0b', display:'inline-block', marginRight: 6}}></span>Pending</span>;
        return <span className="rd-status-badge rd-status-blue">{status}</span>;
    };

    const getTypePill = (type) => {
        if (type === 'Casual Leave') return <span style={{background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>{type}</span>;
        if (type === 'Sick Leave') return <span style={{background: '#fdf2f8', color: '#ec4899', border: '1px solid #fbcfe8', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>{type}</span>;
        return <span style={{background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>{type}</span>;
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => {}} />

            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>LM</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Leave Management</span>
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>HRMS</span>
                        </div>
                        <div className="rd-module-desc">Apply, approve and track employee leave requests</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <HRMSKPICard title="Total Requests" val="7" sub="↗ All leave applications" color="blue" data={trendData1} icon={FileText} />
                    <HRMSKPICard title="Pending" val="2" sub="↘ Action required" color="orange" data={trendData2} icon={Clock} />
                    <HRMSKPICard title="Approved" val="4" sub="↗ 57% approval rate" color="green" data={trendData3} icon={CheckCircle} />
                    <HRMSKPICard title="Rejected" val="0" sub="↘ Not approved" color="red" data={trendData4} icon={XCircle} />
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
                                <option>All</option>
                                <option>Pending</option>
                                <option>Approved</option>
                            </select>
                        </div>
                        <div className="rd-table-actions">
                            <button className="rd-btn-solid" onClick={() => navigate('/leave/apply')}>
                                <Plus size={16} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                                Apply Leave
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
                                <th>Dept</th>
                                <th>Leave Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Days</th>
                                <th>Status</th>
                                <th style={{width: 40}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveData.map((emp, i) => (
                                <tr key={i}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                            <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: emp.name === 'Tarun Bose' ? 'var(--rd-purple-grad)' : 'var(--rd-orange-grad)'}}>
                                                {getInitials(emp.name)}
                                            </div>
                                            <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{emp.name}</div>
                                        </div>
                                    </td>
                                    <td style={{color: '#64748b'}}>{emp.dept}</td>
                                    <td>{getTypePill(emp.type)}</td>
                                    <td style={{fontWeight: 500}}>{emp.from}</td>
                                    <td style={{fontWeight: 500}}>{emp.to}</td>
                                    <td>
                                        <span style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{emp.days}</span>
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

export default LeaveManagement;
