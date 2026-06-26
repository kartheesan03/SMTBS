import React, { useState, useEffect } from 'react';
import DataTable from '../components/Dashboard/DataTable';
import StatCard from '../components/Dashboard/StatCard';
import { Calendar, CheckCircle, XCircle, Search, Filter, Users, Clock, Eye, History, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import AttendanceHistoryTable from '../components/Dashboard/AttendanceHistoryTable';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { toast } from 'react-hot-toast';

const Attendance = () => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterDept, setFilterDept] = useState('All');
    const [viewMode, setViewMode] = useState('today'); // 'today' or 'history'
    const [editRecord, setEditRecord] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const canEdit = user?.role === 'Admin' || user?.role === 'HR';

    const fetchAttendance = async () => {
        try {
            const { data } = await API.get('/attendance/all'); // Updated alias
            setAttendanceData(data);
            setAttendanceLogs(data.employeeAttendanceList || []);
        } catch (error) {
            console.error('Error fetching attendance logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleSaveEdit = async () => {
        try {
            await API.put('/attendance/edit', { recordId: editRecord._id || editRecord.id, status: editStatus });
            toast.success('Record updated');
            setEditRecord(null);
            fetchAttendance();
        } catch(e) {
            toast.error('Failed to update record');
        }
    };

    const filteredLogs = attendanceLogs.filter(log => {
        const empName = `${log.employee?.firstName || ''} ${log.employee?.lastName || ''}`.trim();
        const matchesSearch = empName.toLowerCase().includes(searchQuery.toLowerCase());
        const logDate = new Date(log.date).toISOString().split('T')[0];
        const matchesDate = !filterDate || logDate === filterDate;
        const matchesDept = filterDept === 'All' || log.employee?.department === filterDept;
        return matchesSearch && matchesDate && matchesDept;
    });

    const departments = ['All', ...new Set(attendanceLogs.map(l => l.employee?.department).filter(Boolean))];

    const parseDateTime = (timeStr, baseDateStr) => {
        if (!timeStr) return null;
        if (timeStr.includes('T') || (timeStr.includes('-') && timeStr.includes(':') && timeStr.length > 10)) {
            const d = new Date(timeStr);
            if (!isNaN(d.getTime())) return d;
        }
        const datePart = baseDateStr ? baseDateStr.split('T')[0] : new Date().toISOString().split('T')[0];
        const combined = `${datePart} ${timeStr}`;
        const d = new Date(combined);
        if (!isNaN(d.getTime())) return d;
        
        const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (match) {
            let [_, hours, minutes, ampm] = match;
            hours = parseInt(hours, 10);
            minutes = parseInt(minutes, 10);
            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
            const d = new Date(datePart);
            d.setHours(hours, minutes, 0, 0);
            return d;
        }
        
        const fallback = new Date(timeStr);
        return isNaN(fallback.getTime()) ? null : fallback;
    };

    const formatTime = (timeStr, baseDateStr, isCheckOut = false, hasCheckIn = false) => {
        if (!timeStr) {
            return (isCheckOut && hasCheckIn) ? 'Active' : '-';
        }
        const d = parseDateTime(timeStr, baseDateStr);
        if (!d) return '-';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (checkIn, checkOut, baseDateStr) => {
        if (!checkIn || !checkOut) return '-';
        const start = parseDateTime(checkIn, baseDateStr);
        const end = parseDateTime(checkOut, baseDateStr);
        if (!start || !end) return '-';
        const diff = end - start;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    const getDisplayStatus = (status) => {
        return status || '-';
    };

    if (loading) return <div className="p-30 text-center">Loading records...</div>;

    const totalCount = attendanceData?.totalEmployees || 0;
    const presentCount = attendanceData?.presentToday || 0;
    const absentCount = attendanceData?.absentToday || 0;
    const leaveCount = attendanceData?.onLeaveToday || 0;

    return (
        <div className="page-container">
            <header className="page-header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <h1 className="page-title">Master Attendance Log</h1>
                        <p className="page-subtitle">Review and oversee daily check-ins across all departments.</p>
                    </div>
                    <div className="tab-group" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button 
                            className={`tab-btn ${viewMode === 'today' ? 'active' : ''}`}
                            onClick={() => setViewMode('today')}
                        >
                            <Calendar size={16}/> Today's Log
                        </button>
                        <button 
                            className={`tab-btn ${viewMode === 'history' ? 'active' : ''}`}
                            onClick={() => setViewMode('history')}
                        >
                            <History size={16}/> Attendance History
                        </button>
                    </div>
                </div>
                {viewMode === 'today' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                            <Search size={16} color="var(--text-muted)" />
                            <input 
                                type="text" 
                                placeholder="Search employee..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-heading)', marginLeft: '4px', width: '180px' }}
                            />
                        </div>
                    </div>
                )}
            </header>

            {viewMode === 'history' ? (
                <AttendanceHistoryTable isEmployeeView={false} />
            ) : (
                <>
                    <div className="attendance-dashboard-grid mt-30">
                <StatCard 
                    title="Total Employees" 
                    value={totalCount} 
                    icon={<Users />} 
                    color="primary" 
                    trend={{ value: 100, isPositive: true, label: "Active" }} 
                />
                <StatCard 
                    title="Present Today" 
                    value={presentCount} 
                    icon={<CheckCircle />} 
                    color="success" 
                />
                <StatCard 
                    title="Absent" 
                    value={absentCount} 
                    icon={<XCircle />} 
                    color="danger" 
                />
                <StatCard 
                    title="On Leave" 
                    value={leaveCount} 
                    icon={<Calendar />} 
                    color="purple" 
                />
            </div>

            <div className="attendance-controls mt-30" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div className="premium-card flex-center gap-10" style={{ padding: '12px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={16}/>
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="date-input-clean"
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}
                    />
                </div>
                <div className="premium-card flex-center gap-10" style={{ padding: '12px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <Filter size={16}/>
                    <select 
                        value={filterDept} 
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="dept-select-clean"
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}
                    >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="premium-card">
                <DataTable 
                    title="All Employees Attendance"
                    headers={['Employee Name', 'Employee ID', 'Department', 'Today\'s Status', 'Check In Time', 'Check Out Time', 'Total Hours', 'Action/View']}
                    data={filteredLogs}
                    emptyText="No attendance records found."
                    renderRow={(a, index) => {
                        const displayStatus = getDisplayStatus(a.status);
                        const statusClass = displayStatus.toLowerCase().replace(' ', '-');
                        
                        return (
                            <tr key={a._id || index}>
                                <td><strong>{`${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`.trim() || 'N/A'}</strong></td>
                                <td>{a.employee?.employeeId || '-'}</td>
                                <td>{a.employee?.department || '-'}</td>
                                <td>
                                    <div className={displayStatus === '-' ? '' : `status-pill-flex ${statusClass}`}>
                                          {displayStatus === 'Present' ? <CheckCircle size={14}/> : 
                                           displayStatus === 'Late' ? <CheckCircle size={14} style={{color: '#f59e0b'}}/> : 
                                           displayStatus === '-' ? null :
                                         <XCircle size={14}/>}
                                        {displayStatus}
                                    </div>
                                </td>
                                <td>{formatTime(a.checkIn, a.date)}</td>
                                <td>{formatTime(a.checkOut, a.date, true, !!a.checkIn)}</td>
                                <td>{calculateDuration(a.checkIn, a.checkOut, a.date)}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="btn-icon view-btn" 
                                            title="View Details"
                                            onClick={() => navigate('/hrms')}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        {canEdit && (
                                            <button 
                                                className="btn-icon" 
                                                title="Edit Record"
                                                onClick={() => {
                                                    setEditRecord(a);
                                                    setEditStatus(a.status || 'Present');
                                                }}
                                                style={{ color: 'var(--primary)', background: 'var(--bg-hover)' }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    }}
                />
            </div>
            </>
            )}

            {editRecord && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '400px', background: 'white', padding: '24px', borderRadius: '8px' }}>
                        <h3>Edit Attendance Status</h3>
                        <p>Editing for {editRecord.employee?.firstName || 'Employee'}</p>
                        <select 
                            value={editStatus} 
                            onChange={(e) => setEditStatus(e.target.value)}
                            style={{ width: '100%', padding: '8px', margin: '16px 0', borderRadius: '4px', }}
                        >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Half-day">Half-day</option>
                            <option value="Late">Late</option>
                        </select>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .tab-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid var(--border-subtle); background: var(--bg-surface); color: var(--text-muted); transition: all 0.2s; }
                .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
                .tab-btn:hover:not(.active) { background: var(--bg-hover); color: var(--text-primary); }

                .dept-select-clean { appearance: none; padding-right: 20px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right center; }
                .dept-select-clean option { background: var(--bg-body); color: var(--text-primary); }

                .status-pill-flex { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-pill-flex.present { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill-flex.half-day { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill-flex.absent { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .status-pill-flex.on-leave { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .status-pill-flex.late { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

                .attendance-dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .btn-icon {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-icon.view-btn:hover {
                    background: var(--primary-light);
                    color: var(--primary);
                }

                .mt-30 { margin-top: 30px; }
                .mt-20 { margin-top: 20px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .page-container { padding: 16px 12px; }
                    .module-header { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .header-actions { max-width: 100%; }
                    .attendance-controls { flex-direction: column; width: 100%; }
                    .date-selector, .dept-selector { width: 100%; justify-content: flex-start; }
                    .date-input-clean, .dept-select-clean { width: 100%; }
                    .attendance-dashboard-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Attendance;
