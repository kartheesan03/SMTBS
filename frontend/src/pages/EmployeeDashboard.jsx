import React, { useEffect, useState, useCallback, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import {
    CheckCircle, Clock, Calendar, FileText,
    Bell, Play, Square, LogIn, LogOut,
    TrendingUp, User as UserIcon, ArrowRight, Loader, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function EmployeeDashboard() {
    const { user } = useContext(AuthContext);
    const { unreadCount: unread } = useContext(NotificationContext);
    const navigate = useNavigate();

    const [status, setStatus] = useState(null); // today's attendance record
    const [history, setHistory] = useState([]); // last 7 attendance records
    const [balance, setBalance] = useState(null); // leave balance
    const [myLeaves, setMyLeaves] = useState([]); // recent leave requests
    const [salary, setSalary] = useState(null); // latest salary
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [timer, setTimer] = useState('0h 0m 0s');
    const [toast, setToast] = useState(null);

    // ── helpers ─────────────────────────────────────────────────────────────
    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
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

    const fmt = (timeStr, baseDateStr) => {
        if (!timeStr) return '—';
        const d = parseDateTime(timeStr, baseDateStr);
        if (!d) return '—';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calcDuration = (ci, co, baseDateStr) => {
        if (!ci || !co) return null;
        const start = parseDateTime(ci, baseDateStr);
        const end = parseDateTime(co, baseDateStr);
        if (!start || !end) return null;
        const d = end - start;
        return `${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m`;
    };

    // ── fetch all data ───────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            const [statusRes, histRes, balRes, leavesRes, salRes] = await Promise.all([
                API.get('/attendance/status'),
                API.get('/attendance/my-history'),
                API.get('/leaves/balance'),
                API.get('/leaves/my'),
                API.get('/salaries/summary')
            ]);
            setStatus(statusRes.data);
            setHistory(Array.isArray(histRes.data) ? histRes.data : []);
            setBalance(balRes.data?.balance || null);
            setMyLeaves(Array.isArray(leavesRes.data) ? leavesRes.data.slice(0, 5) : []);
            setSalary(salRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── live session timer ───────────────────────────────────────────────────
    useEffect(() => {
        let iv;
        if (status?.checkIn && !status?.checkOut) {
            iv = setInterval(() => {
                const start = parseDateTime(status.checkIn, status.date);
                if (!start) return;
                const d = Date.now() - start.getTime();
                const h = Math.floor(d / 3600000);
                const m = Math.floor((d % 3600000) / 60000);
                const s = Math.floor((d % 60000) / 1000);
                setTimer(`${h}h ${m}m ${s}s`);
            }, 1000);
        } else if (status?.checkOut) {
            setTimer(calcDuration(status.checkIn, status.checkOut, status.date) || '0h 0m');
        } else {
            setTimer('0h 0m 0s');
        }
        return () => clearInterval(iv);
    }, [status]);

    // ── attendance actions ───────────────────────────────────────────────────
    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            const { data } = await API.post('/attendance/check-in');
            setStatus(data);
            showToast('✓ Checked in successfully!');
            fetchAll();
        } catch (err) {
            showToast(err.response?.data?.message || 'Check-in failed', false);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            const { data } = await API.post('/attendance/check-out');
            setStatus(data);
            showToast('✓ Checked out. Have a great day!');
            fetchAll();
        } catch (err) {
            showToast(err.response?.data?.message || 'Check-out failed', false);
        } finally {
            setActionLoading(false);
        }
    };

    // ── derived chart data ───────────────────────────────────────────────────
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = weekDays.map(d => {
        const rec = Array.isArray(history) ? history.find(h => {
            const day = weekDays[new Date(h.date).getDay()];
            return day === d;
        }) : null;

        if (!rec || !rec.checkIn || !rec.checkOut) return { d, h: 0 };
        const start = parseDateTime(rec.checkIn, rec.date);
        const end = parseDateTime(rec.checkOut, rec.date);
        if (!start || !end) return { d, h: 0 };
        const hrs = (end - start) / 3600000;
        return { d, h: parseFloat(hrs.toFixed(1)) };
    });

    // ── stat cards ───────────────────────────────────────────────────────────
    const isActive = status?.checkIn && !status?.checkOut;
    const isCompleted = status?.checkIn && status?.checkOut;

    if (loading) return (
        <div className="emp-loading-wrapper">
            <div className="dash-spinner"></div>
            <p>Loading your workspace…</p>
        </div>
    );

    const stats = [
        {
            title: 'Today\'s Status',
            value: isCompleted ? 'Done' : isActive ? 'Active' : 'Absent',
            icon: <CheckCircle size={22} />,
            color: isCompleted ? '#10b981' : isActive ? '#2563eb' : '#ef4444',
            bgColor: isCompleted ? '#ecfdf5' : isActive ? '#eff6ff' : '#fef2f2',
            onClick: () => navigate('/my-attendance')
        },
        {
            title: 'Salary Status',
            value: salary?.status === 'Not Generated' ? 'Not Generated'
                : salary?.status === 'Paid' ? 'Paid'
                    : salary?.status === 'Approved' ? 'Approved'
                        : salary?.status === 'Awaiting Approval' ? 'Pending Approval'
                            : salary?.status || 'Not Generated',
            icon: <DollarSign size={22} />,
            color: salary?.status === 'Paid' ? '#10b981'
                : salary?.status === 'Approved' ? '#6366f1'
                    : salary?.status === 'Not Generated' || !salary?.status ? '#94a3b8'
                        : '#f59e0b',
            bgColor: salary?.status === 'Paid' ? '#ecfdf5'
                : salary?.status === 'Approved' ? '#eef2ff'
                    : salary?.status === 'Not Generated' || !salary?.status ? '#f8fafc'
                        : '#fffbeb',
            onClick: () => navigate('/my-salary')
        },
        {
            title: 'Leave Balance',
            value: balance ? `${balance.Annual.remaining}d` : '—',
            icon: <Calendar size={22} />,
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            onClick: () => navigate('/leave-management')
        },
        {
            title: 'My Tasks',
            value: '5',
            icon: <FileText size={22} />,
            color: '#0ea5e9',
            bgColor: '#f0f9ff',
            onClick: () => navigate('/my-tasks')
        },
        {
            title: 'Assigned Projects',
            value: '2',
            icon: <TrendingUp size={22} />,
            color: '#f59e0b',
            bgColor: '#fffbeb',
            onClick: () => {}
        }
    ];

    return (
        <div className="emp-workspace">

            {/* ── Toast ── */}
            {toast && (
                <div className={`emp-toast ${toast.ok ? 'ok' : 'err'}`}>
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <header className="emp-header">
                <div>
                    <p className="emp-greeting">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},</p>
                    <h1 className="emp-name">{user?.name || 'Employee User'} 👋</h1>
                    <p className="emp-date text-muted">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    className="notif-btn"
                    onClick={() => navigate('/notifications')}
                    title="Notifications"
                >
                    <Bell size={20} />
                    {unread > 0 && <span className="notif-count">{unread}</span>}
                </button>
            </header>

            {/* ── Stat Cards ── */}
            <section className="emp-stats">
                {stats.map((s, i) => (
                    <div
                        key={i}
                        className={`emp-stat-card ${s.onClick ? 'clickable' : ''}`}
                        onClick={s.onClick}
                    >
                        <div
                            className="stat-icon-box"
                            style={{ color: s.color, backgroundColor: s.bgColor }}
                        >
                            {s.icon}
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">{s.title}</span>
                            <span className="stat-value">{s.value}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* ── Main Grid ── */}
            <div className="emp-main-grid">

                {/* ══ LEFT: Attendance Section ══ */}
                <div className="emp-left">
                    <div className="white-card attend-card">
                        <div className="attend-card-header">
                            <div>
                                <h3>Attendance & Time Tracking</h3>
                                <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                            <button className="view-details-btn" onClick={() => navigate('/my-attendance')}>
                                Full Log <ArrowRight size={14} />
                            </button>
                        </div>

                        {/* ── Timer Ring ── */}
                        <div className="timer-ring-wrap">
                            <div className={`timer-ring ${isActive ? 'active' : isCompleted ? 'done' : ''}`}>
                                <Clock size={28} />
                                <span className="ring-timer">{timer}</span>
                                <span className="ring-label">
                                    {isCompleted ? 'Shift Complete' : isActive ? 'Session Active' : 'Not Started'}
                                </span>
                            </div>
                        </div>

                        {/* ── Check-in / Check-out Times ── */}
                        <div className="time-pills">
                            <div className="time-pill">
                                <LogIn size={14} className="pill-icon in" />
                                <span className="pill-label">In</span>
                                <span className="pill-value">{fmt(status?.checkIn, status?.date)}</span>
                            </div>
                            <div className="time-divider" />
                            <div className="time-pill">
                                <LogOut size={14} className="pill-icon out" />
                                <span className="pill-label">Out</span>
                                <span className="pill-value">{fmt(status?.checkOut, status?.date)}</span>
                            </div>
                            {isCompleted && (
                                <>
                                    <div className="time-divider" />
                                    <div className="time-pill">
                                        <TrendingUp size={14} className="pill-icon" style={{ color: '#10b981' }} />
                                        <span className="pill-label">Total</span>
                                        <span className="pill-value">{calcDuration(status?.checkIn, status?.checkOut, status?.date)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── ACTION BUTTONS ── */}
                        <div className="attend-actions">
                            {isCompleted ? (
                                <div className="shift-done-badge">
                                    <CheckCircle size={18} /> Shift Completed — See you tomorrow!
                                </div>
                            ) : isActive ? (
                                <button
                                    id="btn-checkout"
                                    className="attend-btn checkout-btn"
                                    onClick={handleCheckOut}
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? <Loader size={18} className="spin-icon" />
                                        : <Square size={18} />}
                                    Check Out
                                </button>
                            ) : (
                                <button
                                    id="btn-checkin"
                                    className="attend-btn checkin-btn"
                                    onClick={handleCheckIn}
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? <Loader size={18} className="spin-icon" />
                                        : <Play size={18} />}
                                    Check In
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Weekly Chart ── */}
                    <div className="white-card weekly-card">
                        <div className="attend-card-header">
                            <h3>Weekly Hours</h3>
                            <span className="text-muted" style={{ fontSize: 12 }}>This week</span>
                        </div>
                        <div style={{ height: 150, marginTop: 16 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={24}>
                                    <XAxis dataKey="d" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                                        formatter={(v) => [`${v}h`, 'Hours']} />
                                    <Bar dataKey="h" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ══ RIGHT: Leave & Quick Actions ══ */}
                <div className="emp-right">

                    {/* ── Leave Balance ── */}
                    <div className="white-card leave-balance-card">
                        <div className="attend-card-header">
                            <h3>Leave Balance</h3>
                            <button className="view-details-btn" onClick={() => navigate('/leave-management')}>
                                Apply <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="balance-list">
                            {balance && Object.entries(balance).filter(([k]) => k !== 'Unpaid').map(([type, b]) => (
                                <div key={type} className="balance-row">
                                    <span className="bal-type">{type}</span>
                                    <div className="bal-bar-wrap">
                                        <div
                                            className="bal-bar"
                                            style={{ width: `${(b.remaining / b.total) * 100}%` }} />
                                    </div>
                                    <span className="bal-count">{b.remaining}<small>/{b.total}</small></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Recent Leave Requests ── */}
                    <div className="white-card recent-leaves-card">
                        <div className="attend-card-header">
                            <h3>Recent Leaves</h3>
                            <button className="view-details-btn" onClick={() => navigate('/leave-management')}>
                                All <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="leave-mini-list">
                            {myLeaves.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: 13, padding: '12px 0' }}>No leave requests yet.</p>
                            ) : myLeaves.map(l => (
                                <div key={l._id} className="leave-mini-row">
                                    <div>
                                        <span className="lm-type">{l.type}</span>
                                        <span className="lm-dates text-muted">
                                            {new Date(l.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            {' – '}
                                            {new Date(l.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <span className={`lm-status ${l.status.toLowerCase()}`}>{l.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* ── Notifications Feed ── */}
                    <div className="white-card notifications-feed-card">
                        <div className="attend-card-header">
                            <h3>Notifications Feed</h3>
                            <button className="view-details-btn" onClick={() => navigate('/notifications')}>
                                All <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="leave-mini-list">
                            <div className="leave-mini-row">
                                <div>
                                    <span className="lm-type" style={{fontSize: '13px'}}>HR published holiday list</span>
                                    <span className="lm-dates text-muted">2 hours ago</span>
                                </div>
                            </div>
                            <div className="leave-mini-row">
                                <div>
                                    <span className="lm-type" style={{fontSize: '13px'}}>Your leave was approved</span>
                                    <span className="lm-dates text-muted">Yesterday</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ── Quick Actions ── */}
                    <div className="white-card quick-card">
                        <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
                        <div className="quick-grid">
                            <button className="q-btn" onClick={() => navigate('/leave-management')}>
                                <Calendar size={20} /><span>Apply Leave</span>
                            </button>
                            <button className="q-btn" onClick={() => navigate('/my-attendance')}>
                                <Clock size={20} /><span>Attendance Log</span>
                            </button>
                            <button className="q-btn" onClick={() => navigate('/my-tasks')}>
                                <FileText size={20} /><span>My Tasks</span>
                            </button>
                            <button className="q-btn" onClick={() => navigate('/my-salary')}>
                                <DollarSign size={20} /><span>My Salary</span>
                            </button>
                            <button className="q-btn" onClick={() => navigate('/notifications')}>
                                <Bell size={20} /><span>Notifications</span>
                                {unread > 0 && <span className="q-badge">{unread}</span>}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                .emp-workspace { 
                    padding: 30px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 28px; 
                    position: relative; 
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    color: var(--text-primary);
                }

                /* ── Toast ── */
                .emp-toast { position: fixed; bottom: 28px; right: 28px; padding: 12px 22px; border-radius: var(--radius-md, 12px); font-size: 13px; font-weight: 600; z-index: 9999; animation: slideUp 0.3s ease; box-shadow: var(--shadow-lg); }
                .emp-toast.ok  { background: var(--success-light); border: 1px solid var(--success); color: var(--success); }
                .emp-toast.err { background: #fef2f2; border: 1px solid var(--danger); color: var(--danger); }
                @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

                /* ── Header ── */
                .emp-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .emp-greeting { font-size: 14px; color: var(--text-secondary); font-weight: 600; }
                .emp-name { font-size: 30px; font-weight: 800; margin: 4px 0 6px; color: var(--text-primary); letter-spacing: -0.5px; }
                .emp-date { font-size: 13px; color: var(--text-muted); font-weight: 500; }
                
                .notif-btn { 
                    position: relative; 
                    width: 46px; 
                    height: 46px; 
                    border-radius: 50%; 
                    background: var(--bg-card); 
                    border: 1px solid var(--border); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: var(--text-secondary); 
                    cursor: pointer; 
                    transition: all 0.25s ease; 
                    box-shadow: var(--shadow-xs);
                }
                .notif-btn:hover { background: var(--bg-hover); color: var(--text-primary); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
                .notif-count { position: absolute; top: -4px; right: -4px; background: var(--danger); color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 20px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); }

                /* ── Stat Cards Overhaul ── */
                .emp-stats { 
                    display: grid; 
                    grid-template-columns: repeat(5, 1fr); 
                    gap: 20px; 
                }
                .emp-stat-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.25s ease;
                }
                .emp-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--border-hover);
                }
                .emp-stat-card.clickable {
                    cursor: pointer;
                }
                .stat-icon-box {
                    width: 46px;
                    height: 46px;
                    border-radius: var(--radius-md, 12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.2s ease;
                }
                .emp-stat-card:hover .stat-icon-box {
                    transform: scale(1.05);
                }
                .stat-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .stat-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                /* ── White Cards Overhaul ── */
                .white-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                    color: var(--text-primary);
                }

                /* ── Main grid ── */
                .emp-main-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
                .emp-left  { display: flex; flex-direction: column; gap: 24px; }
                .emp-right { display: flex; flex-direction: column; gap: 24px; }

                /* ── Attendance card ── */
                .attend-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .attend-card-header h3 { font-size: 16px; font-weight: 800; color: var(--text-primary); }
                .view-details-btn { 
                    display: flex; 
                    align-items: center; 
                    gap: 6px; 
                    background: var(--bg-hover); 
                    border: 1px solid var(--border); 
                    color: var(--text-secondary); 
                    font-size: 12px; 
                    font-weight: 700; 
                    padding: 8px 14px;
                    border-radius: var(--radius-md, 10px);
                    cursor: pointer; 
                    transition: all 0.2s;
                }
                .view-details-btn:hover { background: var(--border); color: var(--text-primary); }

                /* ── Timer ring ── */
                .timer-ring-wrap { display: flex; justify-content: center; margin-bottom: 28px; }
                .timer-ring {
                    width: 170px; height: 170px; border-radius: 50%;
                    border: 4px solid var(--border);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    gap: 8px; color: var(--text-secondary);
                    transition: all 0.4s;
                    background: var(--bg-body);
                }
                .timer-ring.active {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: var(--primary-50);
                    box-shadow: 0 0 24px rgba(37, 99, 235, 0.15);
                }
                .timer-ring.done { 
                    border-color: var(--success); 
                    color: var(--success); 
                    background: var(--success-light); 
                    box-shadow: 0 0 24px rgba(16, 185, 129, 0.15); 
                }
                .ring-timer { font-size: 24px; font-weight: 800; font-variant-numeric: tabular-nums; color: inherit; }
                .ring-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

                /* ── Time pills ── */
                .time-pills { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 24px; }
                .time-pill { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 64px; }
                .pill-icon { color: var(--text-muted); }
                .pill-icon.in  { color: var(--success); }
                .pill-icon.out { color: var(--danger); }
                .pill-label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.5px; }
                .pill-value { font-size: 16px; font-weight: 800; color: var(--text-primary); }
                .time-divider { width: 1px; height: 36px; background: var(--border); }

                /* ── Attendance action buttons ── */
                .attend-actions { display: flex; justify-content: center; }
                .attend-btn {
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    width: 100%; max-width: 260px;
                    padding: 16px 24px; border-radius: var(--radius-md, 12px);
                    font-size: 15px; font-weight: 700;
                    cursor: pointer; transition: all 0.25s;
                    border: none;
                }
                .checkin-btn  { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
                .checkin-btn:hover  { transform: translateY(-2px); background: #1d4ed8; box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35); }
                .checkout-btn { background: var(--danger); color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25); }
                .checkout-btn:hover { transform: translateY(-2px); background: #dc2626; box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35); }
                .attend-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                .shift-done-badge {
                    display: flex; align-items: center; gap: 10px;
                    background: var(--success-light); border: 1px solid var(--success);
                    color: var(--success); padding: 14px 24px; border-radius: var(--radius-md, 12px); font-weight: 600; font-size: 14px;
                }

                /* ── Weekly card ── */
                .weekly-card { padding: 24px; }

                /* ── Leave balance card ── */
                .leave-balance-card { padding: 24px; }
                .balance-list { display: flex; flex-direction: column; gap: 16px; margin-top: 4px; }
                .balance-row { display: flex; align-items: center; gap: 12px; }
                .bal-type { width: 64px; font-size: 13px; font-weight: 600; color: var(--text-secondary); }
                .bal-bar-wrap { flex: 1; height: 8px; background: var(--bg-body); border-radius: 10px; overflow: hidden; }
                .bal-bar { height: 100%; background: linear-gradient(90deg, var(--primary), #8b5cf6); border-radius: 10px; transition: width 0.6s ease; }
                .bal-count { font-size: 14px; font-weight: 800; min-width: 44px; text-align: right; color: var(--text-primary); }
                .bal-count small { font-size: 11px; color: var(--text-muted); font-weight: 500; }

                /* ── Recent leaves card ── */
                .recent-leaves-card { padding: 24px; }
                .leave-mini-list { display: flex; flex-direction: column; gap: 14px; margin-top: 4px; }
                .leave-mini-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
                .leave-mini-row:last-child { border-bottom: none; }
                .lm-type { font-size: 14px; font-weight: 700; margin-right: 8px; color: var(--text-primary); }
                .lm-dates { font-size: 12px; color: var(--text-muted); }
                .lm-status { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
                .lm-status.pending  { background: var(--warning-light);  color: var(--warning); }
                .lm-status.approved { background: var(--success-light);  color: var(--success); }
                .lm-status.rejected { background: #fef2f2;  color: var(--danger); }
                .lm-status.cancelled { background: var(--bg-body); color: var(--text-muted); }

                /* ── Quick actions ── */
                .quick-card { padding: 24px; }
                .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .q-btn {
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                    padding: 16px; border-radius: var(--radius-md, 12px);
                    background: var(--bg-body); border: 1px solid var(--border);
                    color: var(--text-secondary); font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s ease; position: relative;
                }
                .q-btn:hover { background: var(--primary-50); border-color: var(--primary); color: var(--primary); }
                .q-badge { position: absolute; top: -6px; right: -6px; background: var(--danger); color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); }

                /* ── Loading ── */
                .emp-loading-wrapper {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    color: var(--text-muted);
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .dash-spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid var(--primary-100);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 1100px) {
                    .emp-main-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .emp-workspace { padding: 20px; gap: 20px; }
                    .emp-header { flex-direction: column; gap: 15px; }
                    .emp-name { font-size: 24px; }
                    .notif-btn { display: none; }
                    .emp-stats { grid-template-columns: repeat(2, 1fr); gap: 16px; }
                    .attend-card { padding: 20px; }
                    .timer-ring { width: 150px; height: 150px; }
                    .ring-timer { font-size: 20px; }
                    .time-pills { gap: 10px; }
                    .time-pill { min-width: 50px; }
                    .pill-value { font-size: 14px; }
                    .quick-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 480px) {
                    .emp-stats { grid-template-columns: 1fr; }
                    .quick-grid { grid-template-columns: 1fr; }
                    .time-pills { flex-wrap: wrap; }
                }
            `}</style>
        </div>
    );
}

export default EmployeeDashboard;
