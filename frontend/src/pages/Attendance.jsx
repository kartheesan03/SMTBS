import React, { useState, useEffect } from 'react';
import DataTable from '../components/Dashboard/DataTable';
import { Calendar, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import API from '../api/axios';

const Attendance = () => {
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterDept, setFilterDept] = useState('All');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const { data } = await API.get('/attendance');
                setAttendanceLogs(data);
            } catch (error) {
                console.error('Error fetching attendance logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const filteredLogs = attendanceLogs.filter(log => {
        const matchesSearch = log.employee?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const logDate = new Date(log.date).toISOString().split('T')[0];
        const matchesDate = !filterDate || logDate === filterDate;
        const matchesDept = filterDept === 'All' || log.employee?.department === filterDept;
        return matchesSearch && matchesDate && matchesDept;
    });

    const departments = ['All', ...new Set(attendanceLogs.map(l => l.employee?.department).filter(Boolean))];

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="p-30 text-center">Loading records...</div>;

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

            <div className="attendance-controls mt-20">
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
                    title="Daily Records"
                    headers={['Employee Name', 'Department', 'Current Status', 'Check-In', 'Check-Out']}
                    data={filteredLogs}
                    renderRow={(a) => (
                        <>
                            <td><strong>{a.employee?.userId?.name || 'N/A'}</strong></td>
                            <td>{a.employee?.department || 'N/A'}</td>
                            <td>
                                <div className={`status-pill-flex ${a.status ? a.status.toLowerCase() : ''}`}>
                                    {a.status === 'Present' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                    {a.status}
                                </div>
                            </td>
                            <td>{formatTime(a.checkIn)}</td>
                            <td>{formatTime(a.checkOut)}</td>
                        </>
                    )}
                />
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
                .header-actions { width: 100%; max-width: 300px; }
                .search-bar-sm { display: flex; align-items: center; gap: 10px; padding: 10px 20px; }
                .search-bar-sm input { background: none; border: none; color: white; width: 100%; }
                
                .attendance-controls { display: flex; gap: 15px; flex-wrap: wrap; }
                .date-selector, .dept-selector { padding: 8px 15px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 10px; }
                
                .date-input-clean, .dept-select-clean {
                    background: none;
                    border: none;
                    color: white;
                    font-family: inherit;
                    font-size: 13px;
                    outline: none;
                    cursor: pointer;
                }
                .dept-select-clean option { background: #0f172a; color: white; }

                .status-pill-flex { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
                .status-pill-flex.present { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill-flex.absent { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

                .mt-30 { margin-top: 30px; }
                .mt-20 { margin-top: 20px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .module-header { flex-direction: column; align-items: flex-start; }
                    .header-actions { max-width: 100%; }
                    .attendance-controls { flex-direction: column; }
                    .date-selector, .dept-selector { width: 100%; justify-content: flex-start; }
                    .date-input-clean, .dept-select-clean { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Attendance;
