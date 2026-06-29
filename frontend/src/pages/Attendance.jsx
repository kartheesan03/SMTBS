import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Clock, Home, Check } from 'lucide-react';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import { HRMSKPICard } from '../components/HRMSShared';

const Attendance = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    // Mock data for tiny trend charts
    const trendData1 = [{v: 4},{v: 5},{v: 4},{v: 6},{v: 7},{v: 6},{v: 8},{v: 9}];
    const trendData2 = [{v: 0},{v: 1},{v: 0},{v: 0},{v: 1},{v: 0},{v: 0},{v: 0}];
    const trendData3 = [{v: 2},{v: 1},{v: 3},{v: 2},{v: 1},{v: 1},{v: 0},{v: 0}];
    const trendData4 = [{v: 1},{v: 0},{v: 2},{v: 1},{v: 1},{v: 0},{v: 1},{v: 1}];

    const attendanceData = [
        { id: 'EMP-011', name: 'Ritu Agarwal', dept: 'Engineering', checkIn: '05:29 PM', checkOut: '05:29 PM', hours: '9h', status: 'Present' },
        { id: 'EMP-015', name: 'Neha Chatterjee', dept: 'Operations', checkIn: '01:13 PM', checkOut: '01:13 PM', hours: '—', status: 'Present' },
    ];

    const getStatusBadge = (status) => {
        if (status === 'Present') return <span className="rd-status-badge rd-status-green"><span className="rd-legend-dot" style={{background: '#10b981', display:'inline-block', marginRight: 6}}></span>Present</span>;
        if (status === 'Absent') return <span className="rd-status-badge rd-status-red"><span className="rd-legend-dot" style={{background: '#ef4444', display:'inline-block', marginRight: 6}}></span>Absent</span>;
        return <span className="rd-status-badge rd-status-orange">{status}</span>;
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => {}} />

            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>AT</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Attendance Tracker</span>
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>HRMS</span>
                        </div>
                        <div className="rd-module-desc">Daily attendance for 26 May 2026</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <HRMSKPICard title="Present" val="5" sub="↗ 100% attendance rate" color="green" data={trendData1} icon={CheckCircle} />
                    <HRMSKPICard title="Absent" val="0" sub="↘ Unplanned absences" color="red" data={trendData2} icon={XCircle} />
                    <HRMSKPICard title="Late Arrivals" val="0" sub="↘ Arrived after 9 AM" color="orange" data={trendData3} icon={Clock} />
                    <HRMSKPICard title="On Leave" val="0" sub="↗ Approved leaves today" color="blue" data={trendData4} icon={Home} />
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
                                <option>All Depts</option>
                                <option>Engineering</option>
                                <option>Operations</option>
                            </select>
                            <select style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}>
                                <option>All Status</option>
                                <option>Present</option>
                                <option>Absent</option>
                            </select>
                        </div>
                        <div className="rd-table-actions">
                            <button className="rd-btn-solid" style={{background: '#10b981'}}>
                                <Check size={16} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                                Mark All Present
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
                                <th>EMP ID</th>
                                <th>Department</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Hours</th>
                                <th>Status</th>
                                <th style={{width: 100}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.map((emp, i) => (
                                <tr key={i}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                            <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: 'var(--rd-orange-grad)'}}>
                                                {getInitials(emp.name)}
                                            </div>
                                            <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{emp.name}</div>
                                        </div>
                                    </td>
                                    <td style={{color: '#94a3b8'}}>{emp.id}</td>
                                    <td style={{color: '#64748b'}}>{emp.dept}</td>
                                    <td style={{fontWeight: 500}}>{emp.checkIn}</td>
                                    <td style={{fontWeight: 500}}>{emp.checkOut}</td>
                                    <td>
                                        <span style={{fontWeight: 700, color: 'var(--rd-blue)'}}>{emp.hours}</span>
                                    </td>
                                    <td>{getStatusBadge(emp.status)}</td>
                                    <td>
                                        <button style={{background: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 16}}>
                                            Check In
                                        </button>
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

export default Attendance;
