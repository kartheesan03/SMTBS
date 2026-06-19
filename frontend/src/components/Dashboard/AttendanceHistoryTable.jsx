import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import { Calendar, Search, Filter, Download, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import ExcelJS from 'exceljs';

const AttendanceHistoryTable = ({ isEmployeeView = false }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [filters, setFilters] = useState({
        fromDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        employeeName: '',
        department: 'All',
        status: 'All'
    });

    const [departments, setDepartments] = useState(['All']);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                status: filters.status
            };
            if (!isEmployeeView) {
                params.employeeName = filters.employeeName;
                params.department = filters.department;
            }

            const { data } = await API.get('/attendance/history', { params });
            setLogs(data);

            if (!isEmployeeView) {
                const depts = new Set(data.map(l => l.employee?.department).filter(Boolean));
                setDepartments(['All', ...depts]);
            }
        } catch (error) {
            console.error('Error fetching attendance history:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, isEmployeeView]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance History');

        const headers = ['Date'];
        if (!isEmployeeView) {
            headers.push('Employee Name', 'Employee ID', 'Department');
        }
        headers.push('Check In', 'Check Out', 'Total Hours', 'Status');

        worksheet.addRow(headers);
        
        // Format header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

        logs.forEach(log => {
            const date = new Date(log.date).toLocaleDateString();
            const row = [date];
            if (!isEmployeeView) {
                row.push(
                    `${log.employee?.firstName || ''} ${log.employee?.lastName || ''}`.trim() || 'N/A',
                    log.employee?.employeeId || '-',
                    log.employee?.department || '-'
                );
            }
            row.push(
                formatTime(log.checkIn, log.date),
                formatTime(log.checkOut, log.date),
                calculateDuration(log.checkIn, log.checkOut, log.date),
                log.status || '-'
            );
            worksheet.addRow(row);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_History_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

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

    const formatTime = (timeStr, baseDateStr) => {
        if (!timeStr) return '-';
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
        if (diff < 0) return '-';
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="attendance-history-card glass-card">
            <div className="ah-header">
                <h3>{isEmployeeView ? 'My Attendance History' : 'Employee Attendance History'}</h3>
                <button className="btn-primary flex-center gap-10" onClick={handleExport} disabled={loading || logs.length === 0}>
                    <Download size={16} /> Export
                </button>
            </div>
            
            <div className="ah-filters">
                <div className="filter-group">
                    <Calendar size={16} className="filter-icon" />
                    <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} title="From Date" />
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} title="To Date" />
                </div>

                {!isEmployeeView && (
                    <>
                        <div className="filter-group search-group">
                            <Search size={16} className="filter-icon" />
                            <input type="text" name="employeeName" placeholder="Search employee..." value={filters.employeeName} onChange={handleFilterChange} />
                        </div>
                        <div className="filter-group">
                            <Filter size={16} className="filter-icon" />
                            <select name="department" value={filters.department} onChange={handleFilterChange}>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </>
                )}

                <div className="filter-group">
                    <Filter size={16} className="filter-icon" />
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="All">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Absent">Absent</option>
                    </select>
                </div>
            </div>

            <div className="ah-body">
                {loading ? (
                    <div className="flex-center p-30"><Loader size={24} className="spin-icon" /></div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">No attendance records found for this period.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    {!isEmployeeView && <th>Employee Name</th>}
                                    {!isEmployeeView && <th>Employee ID</th>}
                                    {!isEmployeeView && <th>Department</th>}
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Total Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => {
                                    const displayStatus = log.status || '-';
                                    const statusClass = displayStatus.toLowerCase().replace(' ', '-');
                                    return (
                                        <tr key={log._id || log.id}>
                                            <td>{new Date(log.date).toLocaleDateString()}</td>
                                            {!isEmployeeView && (
                                                <>
                                                    <td><strong>{`${log.employee?.firstName || ''} ${log.employee?.lastName || ''}`.trim() || 'N/A'}</strong></td>
                                                    <td>{log.employee?.employeeId || '-'}</td>
                                                    <td>{log.employee?.department || '-'}</td>
                                                </>
                                            )}
                                            <td>{formatTime(log.checkIn, log.date)}</td>
                                            <td>{formatTime(log.checkOut, log.date)}</td>
                                            <td>{calculateDuration(log.checkIn, log.checkOut, log.date)}</td>
                                            <td>
                                                <div className={displayStatus === '-' ? '' : `status-pill-flex ${statusClass}`}>
                                                    {displayStatus === 'Present' ? <CheckCircle size={14}/> : 
                                                     displayStatus === 'Late' ? <Clock size={14} style={{color: '#f59e0b'}}/> : 
                                                     displayStatus === '-' ? null :
                                                     <XCircle size={14}/>}
                                                    {displayStatus}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style jsx="true">{`
                .attendance-history-card {
                    margin-top: 30px;
                    border-radius: var(--radius-lg, 16px);
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                }
                .ah-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid var(--border);
                }
                .ah-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: var(--text-primary);
                }
                .ah-filters {
                    display: flex;
                    gap: 15px;
                    padding: 15px 20px;
                    background: var(--bg-body);
                    border-bottom: 1px solid var(--border);
                    flex-wrap: wrap;
                }
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    padding: 8px 12px;
                    border-radius: 8px;
                }
                .filter-icon {
                    color: var(--text-muted);
                }
                .filter-group input, .filter-group select {
                    border: none;
                    background: none;
                    outline: none;
                    color: var(--text-primary);
                    font-size: 13px;
                }
                .search-group {
                    flex: 1;
                    min-width: 200px;
                }
                .search-group input {
                    width: 100%;
                }
                .table-responsive {
                    overflow-x: auto;
                }
                .ah-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ah-table th {
                    padding: 12px 20px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    background: #f8fafc;
                    border-bottom: 1px solid var(--border);
                    white-space: nowrap;
                }
                .ah-table td {
                    padding: 14px 20px;
                    font-size: 13px;
                    border-bottom: 1px solid #f1f5f9;
                    color: var(--text-primary);
                    white-space: nowrap;
                }
                .ah-table tbody tr:hover td {
                    background: #fafbfd;
                }
                .status-pill-flex {
                    display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px;
                }
                .status-pill-flex.present { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill-flex.late { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill-flex.absent { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .status-pill-flex.on-leave { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                
                .empty-state {
                    padding: 40px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 14px;
                }
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AttendanceHistoryTable;
