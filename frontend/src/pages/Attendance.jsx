import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Clock, Home, Check } from 'lucide-react';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { HRMSKPICard } from '../components/HRMSShared';

const Attendance = () => {
    const navigate = useNavigate();

    // Data states
    const [attendanceData, setAttendanceData] = useState([]);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        notCheckedInToday: 0,
        absentToday: 0,
        onLeaveToday: 0
    });
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/attendance');
            setStats({
                totalEmployees: res.data.totalEmployees || 0,
                presentToday: res.data.presentToday || 0,
                notCheckedInToday: res.data.notCheckedInToday || 0,
                absentToday: res.data.absentToday || 0,
                onLeaveToday: res.data.onLeaveToday || 0
            });
            setAttendanceData(res.data.employeeAttendanceList || []);
        } catch (err) {
            console.error('Failed to fetch attendance data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Trend mock generator (for UI purposes since no historical trend API exists)
    

    const getStatusBadge = (status) => {
        if (status === 'Present' || status === 'Late') return <span className="rd-status-badge rd-status-green"><span className="rd-legend-dot" style={{background: '#10b981', display:'inline-block', marginRight: 6}}></span>{status}</span>;
        if (status === 'Absent') return <span className="rd-status-badge rd-status-red"><span className="rd-legend-dot" style={{background: '#ef4444', display:'inline-block', marginRight: 6}}></span>Absent</span>;
        if (status === 'On Leave') return <span className="rd-status-badge rd-status-blue"><span className="rd-legend-dot" style={{background: '#3b82f6', display:'inline-block', marginRight: 6}}></span>On Leave</span>;
        return <span className="rd-status-badge rd-status-orange">{status}</span>;
    };

    const getInitials = (firstName, lastName) => `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??';

    // Calculate hours worked
    const calculateHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '—';
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffMs = end - start;
        const diffHrs = diffMs / (1000 * 60 * 60);
        return diffHrs > 0 ? `${diffHrs.toFixed(1)}h` : '—';
    };

    const formatTime = (isoString) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Filter logic
    const departments = ['All', ...new Set(attendanceData.map(a => a.employee?.department).filter(Boolean))];

    const filteredData = attendanceData.filter(record => {
        const emp = record.employee || {};
        const name = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        
        const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
        
        let matchesStatus = true;
        if (statusFilter !== 'All') {
            if (statusFilter === 'Present') matchesStatus = (record.status === 'Present' || record.status === 'Late');
            else matchesStatus = record.status === statusFilter;
        }

        return matchesSearch && matchesDept && matchesStatus;
    });

    return (
        <div className="rd-container">
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
                        <div className="rd-module-desc">Daily attendance overview and records</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <HRMSKPICard title="Present / Late" val={stats.presentToday} sub={`${stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}% of workforce`} color="green" icon={CheckCircle} />
                    <HRMSKPICard title="Not Checked In" val={stats.notCheckedInToday} sub="Action needed" color="orange" icon={Clock} />
                    <HRMSKPICard title="Absent" val={stats.absentToday} sub="Marked absent" color="red" icon={XCircle} />
                    <HRMSKPICard title="On Leave" val={stats.onLeaveToday} sub="Approved leaves" color="blue" icon={Home} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: 'none', flexWrap: 'wrap', gap: 16}}>
                        <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 250, flexShrink: 0, background: '#fff'}}>
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
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                <option value="All">All Status</option>
                                <option value="Present">Present (incl. Late)</option>
                                <option value="-">Not Checked In</option>
                                <option value="Absent">Absent</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>
                        <div className="rd-table-actions">
                            <button className="rd-btn-solid" style={{background: '#10b981'}} onClick={() => alert('Auto-mark absent logic runs automatically at 6 PM')}>
                                <Check size={16} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                                Attendance Runs Automatically
                            </button>
                        </div>
                    </div>
                    
                    <div style={{overflowX: 'auto'}}>
                        <table className="rd-table" style={{minWidth: 1000}}>
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
                            {loading ? (
                                <tr>
                                    <td colSpan={9} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading attendance data...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>No attendance records match your filters</td>
                                </tr>
                            ) : (
                                filteredData.map((record, i) => {
                                    const emp = record.employee || {};
                                    return (
                                        <tr key={record.id || record._id || i}>
                                            <td><input type="checkbox" /></td>
                                            <td>
                                                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                    <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: 'var(--rd-orange-grad)'}}>
                                                        {getInitials(emp.firstName, emp.lastName)}
                                                    </div>
                                                    <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{`${emp.firstName || ''} ${emp.lastName || ''}`.trim()}</div>
                                                </div>
                                            </td>
                                            <td style={{color: '#94a3b8'}}>{emp.employeeId || '—'}</td>
                                            <td style={{color: '#64748b'}}>{emp.department || '—'}</td>
                                            <td style={{fontWeight: 500}}>{formatTime(record.checkIn)}</td>
                                            <td style={{fontWeight: 500}}>{formatTime(record.checkOut)}</td>
                                            <td>
                                                <span style={{fontWeight: 700, color: 'var(--rd-blue)'}}>{calculateHours(record.checkIn, record.checkOut)}</span>
                                            </td>
                                            <td>{getStatusBadge(record.status)}</td>
                                            <td>
                                                <button onClick={() => navigate(`/employees/${record.employeeId}`)} style={{background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 16}}>
                                                    Profile
                                                </button>
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
        </div>
    );
};

export default Attendance;
