import React, { useState, useEffect } from 'react';
import DataTable from '../components/Dashboard/DataTable';
import StatCard from '../components/Dashboard/StatCard';
import { Calendar, CheckCircle, XCircle, Search, Filter, Users, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Attendance = () => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterDept, setFilterDept] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const { data } = await API.get('/attendance');
                setAttendanceData(data);
                setAttendanceLogs(data.employeeAttendanceList || []);
            } catch (error) {
                console.error('Error fetching attendance logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

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
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Master Attendance Log</h1>
                    <p className="text-muted">Review and oversee daily check-ins across all departments.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar-sm glass-card">
                        <Search size={16}/>
                        <input 
                            type="text" 
                            placeholder="Search employee..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

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

            <div className="attendance-controls mt-30">
                <div className="date-selector glass-card flex-center gap-10">
                    <Calendar size={16}/>
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="date-input-clean"
                    />
                </div>
                <div className="dept-selector glass-card flex-center gap-10">
                    <Filter size={16}/>
                    <select 
                        value={filterDept} 
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="dept-select-clean"
                    >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="module-content mt-30">
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
                                    <div className={`status-pill-flex ${statusClass}`}>
                                          {displayStatus === 'Present' ? <CheckCircle size={14}/> : 
                                           displayStatus === 'Not Checked In' ? <Clock size={14} style={{color: '#64748b'}}/> : 
                                           displayStatus === 'Late' ? <CheckCircle size={14} style={{color: '#f59e0b'}}/> : 
                                         <XCircle size={14}/>}
                                        {displayStatus}
                                    </div>
                                </td>
                                <td>{formatTime(a.checkIn, a.date)}</td>
                                <td>{formatTime(a.checkOut, a.date, true, !!a.checkIn)}</td>
                                <td>{calculateDuration(a.checkIn, a.checkOut, a.date)}</td>
                                <td>
                                    <button 
                                        className="btn-icon view-btn" 
                                        title="View Details"
                                        onClick={() => navigate('/hrms')}
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    }}
                />
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; background-color: var(--bg-body); min-height: 100vh; font-family: 'Outfit', sans-serif; color: var(--text-primary); }
                .title-gradient { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
                .text-muted { color: var(--text-muted); }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
                .header-actions { width: 100%; max-width: 300px; }
                .search-bar-sm { display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-full, 9999px); box-shadow: var(--shadow-sm); transition: all 0.2s; }
                .search-bar-sm:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); }
                .search-bar-sm input { background: none; border: none; color: var(--text-primary); width: 100%; outline: none; font-size: 14px; }
                
                .attendance-controls { display: flex; gap: 15px; flex-wrap: wrap; }
                .date-selector, .dept-selector { padding: 12px 18px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md, 8px); box-shadow: var(--shadow-sm); color: var(--text-primary); transition: all 0.2s; }
                .date-selector:focus-within, .dept-selector:focus-within { border-color: var(--primary); }
                
                .date-input-clean, .dept-select-clean {
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 600;
                    outline: none;
                    cursor: pointer;
                    width: 100%;
                }
                .dept-select-clean { appearance: none; padding-right: 20px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right center; }
                .dept-select-clean option { background: var(--bg-body); color: var(--text-primary); }

                .status-pill-flex { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-pill-flex.present { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill-flex.not-checked-in { background: rgba(148, 163, 184, 0.1); color: #64748b; }
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
                    .module-container { padding: 16px; }
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
