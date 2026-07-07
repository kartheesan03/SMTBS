import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
    Search, CheckCircle, XCircle, Clock, Home, ChevronDown,
    Calendar, BarChart2, History, Download, RefreshCw, Edit2,
    Check, X, ChevronLeft, ChevronRight, Filter, Users,
    AlertCircle, TrendingUp, FileText, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

/* ─── Helper Utilities ─────────────────────────── */
const formatTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const calcHours = (ci, co) => {
    if (!ci || !co) return '—';
    const h = (new Date(co) - new Date(ci)) / 36e5;
    return h > 0 ? `${h.toFixed(1)}h` : '—';
};
const getInitials = (fn, ln) =>
    `${(fn || '')[0] || ''}${(ln || '')[0] || ''}`.toUpperCase() || '??';

const MONTHS = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

/* ─── Status Badge ─────────────────────────────── */
const StatusBadge = ({ status }) => {
    const map = {
        Present: { bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
        Late:    { bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04' },
        Absent:  { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
        'On Leave': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
        '-':     { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    };
    const s = map[status] || map['-'];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 20,
            background: s.bg, color: s.color,
            fontSize: 12, fontWeight: 600
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
            {status === '-' ? 'Not Checked In' : status}
        </span>
    );
};

/* ─── Edit Modal ───────────────────────────────── */
const EditModal = ({ record, onClose, onSave }) => {
    const [status, setStatus] = useState(record?.status || '-');
    const [checkIn, setCheckIn] = useState(record?.checkIn ? new Date(record.checkIn).toTimeString().slice(0,5) : '');
    const [checkOut, setCheckOut] = useState(record?.checkOut ? new Date(record.checkOut).toTimeString().slice(0,5) : '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const date = record.date;
            const toISO = (timeStr) => {
                if (!timeStr) return null;
                const [h, m] = timeStr.split(':');
                const d = new Date(date);
                d.setHours(+h, +m, 0, 0);
                return d.toISOString();
            };
            await API.put('/attendance/edit', {
                recordId: record._id || record.id,
                status,
                checkInTime: toISO(checkIn),
                checkOutTime: toISO(checkOut),
            });
            onSave();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: 28, width: 400,
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>
                        Edit Attendance
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Employee
                    </p>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>
                        {record.employee?.firstName} {record.employee?.lastName}
                        <span style={{ marginLeft: 8, color: '#94a3b8', fontWeight: 400, fontSize: 13 }}>
                            · {formatDate(record.date)}
                        </span>
                    </p>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#f8fafc' }}>
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="On Leave">On Leave</option>
                        <option value="-">Not Checked In</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Check In</label>
                        <input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Check Out</label>
                        <input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose}
                        style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── DAILY TAB ────────────────────────────────── */
const DailyTab = ({ canEdit }) => {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, notCheckedInToday: 0, absentToday: 0, onLeaveToday: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [editRecord, setEditRecord] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/attendance', { params: { date: selectedDate } });
            setStats({
                totalEmployees: res.data.totalEmployees || 0,
                presentToday: res.data.presentToday || 0,
                notCheckedInToday: res.data.notCheckedInToday || 0,
                absentToday: res.data.absentToday || 0,
                onLeaveToday: res.data.onLeaveToday || 0,
            });
            setData(res.data.employeeAttendanceList || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const departments = ['All', ...new Set(data.map(r => r.employee?.department).filter(Boolean))];

    const filtered = data.filter(r => {
        const emp = r.employee || {};
        const name = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        const ms = !search || name.includes(search.toLowerCase()) || (emp.employeeId || '').toLowerCase().includes(search.toLowerCase());
        const md = deptFilter === 'All' || emp.department === deptFilter;
        let mst = true;
        if (statusFilter !== 'All') {
            if (statusFilter === 'Present') mst = r.status === 'Present' || r.status === 'Late';
            else mst = r.status === statusFilter;
        }
        return ms && md && mst;
    });

    const exportCSV = () => {
        const rows = [['Employee', 'Emp ID', 'Department', 'Check In', 'Check Out', 'Hours', 'Status']];
        filtered.forEach(r => {
            const e = r.employee || {};
            rows.push([
                `${e.firstName || ''} ${e.lastName || ''}`.trim(),
                e.employeeId || '', e.department || '',
                formatTime(r.checkIn), formatTime(r.checkOut),
                calcHours(r.checkIn, r.checkOut), r.status || '-'
            ]);
        });
        const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `attendance_${selectedDate}.csv`;
        a.click();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <PastelKPIGrid>
                <PastelKPICard title="Present Today" value={stats.presentToday} colorTheme="mint" icon={CheckCircle} trendValue={stats.totalEmployees > 0 ? `${Math.round((stats.presentToday/stats.totalEmployees)*100)}% workforce` : '—'} trendPositive={true} />
                <PastelKPICard title="Not Checked In" value={stats.notCheckedInToday} colorTheme="peach" icon={Clock} trendValue="Expected today" trendPositive={false} />
                <PastelKPICard title="Absent" value={stats.absentToday} colorTheme="pink" icon={XCircle} trendValue="No record" trendPositive={false} />
                <PastelKPICard title="On Leave" value={stats.onLeaveToday} colorTheme="purple" icon={Users} trendValue="Approved leave" trendPositive={true} />
            </PastelKPIGrid>

            <div className="rd-table-card">
                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Date Picker */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', background: '#f8fafc' }}>
                            <Calendar size={15} color="#64748b" />
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1e293b', fontWeight: 500 }} />
                        </div>

                        <div className="rd-search-bar" style={{ minWidth: 220, background: '#f8fafc' }}>
                            <Search size={15} color="#94a3b8" />
                            <input className="rd-search-input" placeholder="Search..."
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>

                        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#64748b', fontSize: 13, outline: 'none' }}>
                            {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
                        </select>

                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#64748b', fontSize: 13, outline: 'none' }}>
                            <option value="All">All Status</option>
                            <option value="Present">Present / Late</option>
                            <option value="-">Not Checked In</option>
                            <option value="Absent">Absent</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={fetchData}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button onClick={exportCSV}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', borderRadius: 8, background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Count bar */}
                <div style={{ padding: '8px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    Showing <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> of {data.length} employees
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="rd-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Emp ID</th>
                                <th>Department</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Hours</th>
                                <th>Status</th>
                                <th style={{ width: 80, textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading attendance data…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No records match your filters</td></tr>
                            ) : filtered.map((r, i) => {
                                const emp = r.employee || {};
                                return (
                                    <tr key={r._id || r.id || i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="rd-avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--rd-orange-grad)', flexShrink: 0 }}>
                                                    {getInitials(emp.firstName, emp.lastName)}
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#94a3b8', fontSize: 13 }}>{emp.employeeId || '—'}</td>
                                        <td style={{ color: '#64748b' }}>{emp.department || '—'}</td>
                                        <td style={{ fontWeight: 500, color: '#1e293b' }}>{formatTime(r.checkIn)}</td>
                                        <td style={{ fontWeight: 500, color: '#1e293b' }}>{formatTime(r.checkOut)}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: '#3b82f6' }}>{calcHours(r.checkIn, r.checkOut)}</span>
                                        </td>
                                        <td><StatusBadge status={r.status} /></td>
                                        <td style={{ textAlign: 'center' }}>
                                            {canEdit && (
                                                <button onClick={() => setEditRecord(r)}
                                                    style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                                                    <Edit2 size={12} /> Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {editRecord && (
                <EditModal record={editRecord} onClose={() => setEditRecord(null)} onSave={fetchData} />
            )}
        </motion.div>
    );
};

/* ─── MONTHLY SUMMARY TAB ──────────────────────── */
const MonthlyTab = () => {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/attendance/monthly-summary', { params: { year, month } });
            setData(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const filtered = data.filter(r =>
        !search || r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.id?.toLowerCase().includes(search.toLowerCase()) ||
        r.dept?.toLowerCase().includes(search.toLowerCase())
    );

    const exportCSV = () => {
        const rows = [['Employee', 'Emp ID', 'Department', 'Work Days', 'Present', 'Absent', 'Leave', 'Attendance %']];
        filtered.forEach(r => {
            rows.push([r.name, r.id, r.dept, r.workDays, r.present, r.absent, r.leaves, `${Math.round((r.rate || 0) * 100)}%`]);
        });
        const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `monthly_summary_${year}_${String(month).padStart(2,'0')}.csv`;
        a.click();
    };

    const avgRate = filtered.length > 0 ? filtered.reduce((s, r) => s + (r.rate || 0), 0) / filtered.length : 0;

    return (
        <>
            {/* Summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Employees', val: filtered.length, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Avg Attendance', val: `${Math.round(avgRate * 100)}%`, color: '#10b981', bg: '#f0fdf4' },
                    { label: 'Perfect Attendance', val: filtered.filter(r => r.absent === 0).length, color: '#8b5cf6', bg: '#f5f3ff' },
                    { label: 'Needs Attention', val: filtered.filter(r => (r.rate || 0) < 0.75).length, color: '#ef4444', bg: '#fef2f2' },
                ].map(k => (
                    <div key={k.label} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</p>
                        <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: k.color }}>{k.val}</p>
                    </div>
                ))}
            </div>

            <div className="rd-table-card">
                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {/* Month Navigator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                            <button onClick={prevMonth} style={{ padding: '7px 10px', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                <ChevronLeft size={15} />
                            </button>
                            <span style={{ padding: '0 12px', fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                                {MONTHS[month - 1]} {year}
                            </span>
                            <button onClick={nextMonth} style={{ padding: '7px 10px', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                <ChevronRight size={15} />
                            </button>
                        </div>

                        <div className="rd-search-bar" style={{ minWidth: 220, background: '#f8fafc' }}>
                            <Search size={15} color="#94a3b8" />
                            <input className="rd-search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={fetchData}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button onClick={exportCSV}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', borderRadius: 8, background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="rd-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Emp ID</th>
                                <th>Department</th>
                                <th style={{ textAlign: 'center' }}>Work Days</th>
                                <th style={{ textAlign: 'center' }}>Present</th>
                                <th style={{ textAlign: 'center' }}>Absent</th>
                                <th style={{ textAlign: 'center' }}>Leave</th>
                                <th style={{ textAlign: 'center' }}>Attendance %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading monthly data…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No records found</td></tr>
                            ) : filtered.map((r, i) => {
                                const pct = Math.round((r.rate || 0) * 100);
                                const barColor = pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444';
                                return (
                                    <tr key={r.id || i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="rd-avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--rd-blue-grad)', flexShrink: 0 }}>
                                                    {(r.name || '??')[0].toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.name || '—'}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#94a3b8', fontSize: 13 }}>{r.id || '—'}</td>
                                        <td style={{ color: '#64748b' }}>{r.dept || '—'}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{r.workDays || 0}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>{r.present || 0}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ color: '#ef4444', fontWeight: 700 }}>{r.absent || 0}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ color: '#3b82f6', fontWeight: 700 }}>{r.leaves || 0}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                                <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
                                                </div>
                                                <span style={{ fontWeight: 700, color: barColor, minWidth: 36, fontSize: 13 }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

/* ─── HISTORY TAB ──────────────────────────────── */
const HistoryTab = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [page, setPage] = useState(1);
    const PER_PAGE = 20;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/attendance/history', {
                params: { fromDate, toDate, department: deptFilter !== 'All' ? deptFilter : undefined, status: statusFilter !== 'All' ? statusFilter : undefined, employeeName: search || undefined }
            });
            setData(Array.isArray(res.data) ? res.data : []);
            setPage(1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, deptFilter, statusFilter, search]);

    useEffect(() => { fetchData(); }, []);

    const totalPages = Math.ceil(data.length / PER_PAGE);
    const paginated = data.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const exportCSV = () => {
        const rows = [['Date', 'Employee', 'Emp ID', 'Department', 'Check In', 'Check Out', 'Hours', 'Status']];
        data.forEach(r => {
            const e = r.employee || {};
            rows.push([
                formatDate(r.date),
                `${e.firstName || ''} ${e.lastName || ''}`.trim(),
                e.employeeId || '', e.department || '',
                formatTime(r.checkIn), formatTime(r.checkOut),
                calcHours(r.checkIn, r.checkOut), r.status || '-'
            ]);
        });
        const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `attendance_history_${fromDate}_${toDate}.csv`;
        a.click();
    };

    return (
        <>
            <div className="rd-table-card">
                {/* Filters */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>From</label>
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                                style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f8fafc', color: '#1e293b' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>To</label>
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                                style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f8fafc', color: '#1e293b' }} />
                        </div>

                        <div className="rd-search-bar" style={{ minWidth: 200, background: '#f8fafc', alignSelf: 'flex-end' }}>
                            <Search size={15} color="#94a3b8" />
                            <input className="rd-search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>

                        <div style={{ alignSelf: 'flex-end' }}>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#64748b', fontSize: 13, outline: 'none' }}>
                                <option value="All">All Status</option>
                                <option value="Present">Present</option>
                                <option value="Late">Late</option>
                                <option value="Absent">Absent</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>

                        <button onClick={fetchData}
                            style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', borderRadius: 8, background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <Filter size={14} /> Apply
                        </button>
                    </div>

                    <button onClick={exportCSV}
                        style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', borderRadius: 8, background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>

                {/* Count */}
                <div style={{ padding: '8px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    <strong style={{ color: '#1e293b' }}>{data.length}</strong> records found · Page {page} of {totalPages || 1}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="rd-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Employee</th>
                                <th>Emp ID</th>
                                <th>Department</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading history…</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No records found for the selected range</td></tr>
                            ) : paginated.map((r, i) => {
                                const emp = r.employee || {};
                                return (
                                    <tr key={r._id || i}>
                                        <td style={{ fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="rd-avatar" style={{ width: 30, height: 30, fontSize: 11, background: 'var(--rd-purple-grad)', flexShrink: 0 }}>
                                                    {getInitials(emp.firstName, emp.lastName)}
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#94a3b8', fontSize: 13 }}>{emp.employeeId || '—'}</td>
                                        <td style={{ color: '#64748b' }}>{emp.department || '—'}</td>
                                        <td style={{ fontWeight: 500 }}>{formatTime(r.checkIn)}</td>
                                        <td style={{ fontWeight: 500 }}>{formatTime(r.checkOut)}</td>
                                        <td><span style={{ fontWeight: 700, color: '#3b82f6' }}>{calcHours(r.checkIn, r.checkOut)}</span></td>
                                        <td><StatusBadge status={r.status} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: page === 1 ? '#cbd5e1' : '#1e293b', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                            const p = page <= 3 ? idx + 1 : page + idx - 2;
                            if (p < 1 || p > totalPages) return null;
                            return (
                                <button key={p} onClick={() => setPage(p)}
                                    style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: p === page ? '#1e293b' : '#f8fafc', color: p === page ? '#fff' : '#1e293b', fontWeight: p === page ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>
                                    {p}
                                </button>
                            );
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: page === totalPages ? '#cbd5e1' : '#1e293b', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

/* ─── MAIN COMPONENT ───────────────────────────── */
const MasterAttendance = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('daily');
    const canEdit = user?.role === 'Admin' || user?.email === 'admin@smtbms.com';

    const tabs = [
        { id: 'daily',   label: 'Daily View',        icon: Calendar  },
        { id: 'monthly', label: 'Monthly Summary',   icon: BarChart2 },
        { id: 'history', label: 'Attendance History', icon: History   },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rd-container"
        >
            <div className="rd-content">
                {/* Page Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Master Attendance</span>
                            <span className="rd-module-badge">HRMS</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                            Full attendance oversight for all employees · Logged in as <strong>{user?.role}</strong>
                        </p>
                    </div>
                </div>

                {/* Tab Bar */}
                <div style={{
                    display: 'flex', gap: 4, background: '#f1f5f9',
                    borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 24
                }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: activeTab === t.id ? '#ffffff' : 'transparent',
                                color: activeTab === t.id ? '#1e293b' : '#64748b',
                                fontWeight: activeTab === t.id ? 700 : 500,
                                fontSize: 13,
                                boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s ease'
                            }}>
                            <t.icon size={15} />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'daily'   && <DailyTab canEdit={canEdit} />}
                        {activeTab === 'monthly' && <MonthlyTab />}
                        {activeTab === 'history' && <HistoryTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default MasterAttendance;
