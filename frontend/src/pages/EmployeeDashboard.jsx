import React, { useEffect, useState, useCallback, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import {
    CheckCircle, Clock, Calendar, FileText,
    Bell, Play, Square, LogIn, LogOut,
    TrendingUp, User as UserIcon, ArrowRight, Loader, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/Dashboard/StatCard';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [status,      setStatus]      = useState(null);   // today's attendance record
    const [history,     setHistory]     = useState([]);      // last 7 attendance records
    const [balance,     setBalance]     = useState(null);    // leave balance
    const [unread,      setUnread]      = useState(0);       // notification count
    const [myLeaves,    setMyLeaves]    = useState([]);      // recent leave requests
    const [salary,      setSalary]      = useState(null);    // latest salary
    const [loading,     setLoading]     = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [timer,       setTimer]       = useState('0h 0m 0s');
    const [toast,       setToast]       = useState(null);

    // ── helpers ─────────────────────────────────────────────────────────────
    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const fmt = (iso) => iso
        ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '—';

    const calcDuration = (ci, co) => {
        if (!ci || !co) return null;
        const d = new Date(co) - new Date(ci);
        return `${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m`;
    };

    // ── fetch all data ───────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            const [statusRes, histRes, balRes, notifRes, leavesRes, salRes] = await Promise.all([
                API.get('/attendance/status'),
                API.get('/attendance/my-history'),
                API.get('/leaves/balance'),
                API.get('/notifications'),
                API.get('/leaves/my'),
                API.get('/salaries/summary')
            ]);
            setStatus(statusRes.data);
            setHistory(Array.isArray(histRes.data) ? histRes.data : []);
            setBalance(balRes.data?.balance || null);
            setUnread(notifRes.data?.unreadCount || 0);
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
                const d = Date.now() - new Date(status.checkIn).getTime();
                const h = Math.floor(d / 3600000);
                const m = Math.floor((d % 3600000) / 60000);
                const s = Math.floor((d % 60000) / 1000);
                setTimer(`${h}h ${m}m ${s}s`);
            }, 1000);
        } else if (status?.checkOut) {
            setTimer(calcDuration(status.checkIn, status.checkOut) || '0h 0m');
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
        const hrs = (new Date(rec.checkOut) - new Date(rec.checkIn)) / 3600000;
        return { d, h: parseFloat(hrs.toFixed(1)) };
    });

    // ── stat cards ───────────────────────────────────────────────────────────
    const isActive    = status?.checkIn && !status?.checkOut;
    const isCompleted = status?.checkIn && status?.checkOut;

    if (loading) return (
        <div className="emp-loading">
            <div className="loader-spin"><Loader size={32} /></div>
            <p>Loading your workspace…</p>
        </div>
    );

    const stats = [
        {
            title: 'Today\'s Status',
            value: isCompleted ? 'Done' : isActive ? 'Active' : 'Absent',
            icon: <CheckCircle />,
            color: isCompleted ? '#10b981' : isActive ? '#6366f1' : '#ef4444',
            onClick: () => navigate('/my-attendance')
        },
        {
            title: 'Salary Status',
            value: salary?.status || 'Pending',
            icon: <DollarSign />,
            color: salary?.status === 'Paid' ? '#10b981' : '#f59e0b',
            onClick: () => navigate('/my-salary')
        },
        {
            title: 'Leave Balance',
            value: balance ? `${balance.Annual.remaining}d` : '—',
            icon: <Calendar />,
            color: '#8b5cf6',
            onClick: () => navigate('/leave-management')
        },
        {
            title: 'Notifications',
            value: unread,
            icon: <Bell />,
            color: unread > 0 ? '#f59e0b' : '#64748b',
            onClick: () => navigate('/notifications')
        },
    ];

    return (
        <div className="emp-wrapper">

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
                    <h1 className="emp-name">{user?.name} 👋</h1>
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
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </section>

            {/* ── Main Grid ── */}
            <div className="emp-main-grid">

                {/* ══ LEFT: Attendance Section ══ */}
                <div className="emp-left">
                    <div className="glass-card attend-card">
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
                                <span className="pill-value">{fmt(status?.checkIn)}</span>
                            </div>
                            <div className="time-divider" />
                            <div className="time-pill">
                                <LogOut size={14} className="pill-icon out" />
                                <span className="pill-label">Out</span>
                                <span className="pill-value">{fmt(status?.checkOut)}</span>
                            </div>
                            {isCompleted && (
                                <>
                                    <div className="time-divider" />
                                    <div className="time-pill">
                                        <TrendingUp size={14} className="pill-icon" style={{ color: '#10b981' }} />
                                        <span className="pill-label">Total</span>
                                        <span className="pill-value">{calcDuration(status?.checkIn, status?.checkOut)}</span>
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
                                        : <Square size={18} />
                                    }
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
                                        : <Play size={18} />
                                    }
                                    Check In
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Weekly Chart ── */}
                    <div className="glass-card weekly-card">
                        <div className="attend-card-header">
                            <h3>Weekly Hours</h3>
                            <span className="text-muted" style={{ fontSize: 12 }}>This week</span>
                        </div>
                        <div style={{ height: 150, marginTop: 16 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={24}>
                                    <XAxis dataKey="d" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                                        formatter={(v) => [`${v}h`, 'Hours']}
                                    />
                                    <Bar dataKey="h" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ══ RIGHT: Leave & Quick Actions ══ */}
                <div className="emp-right">

                    {/* ── Leave Balance ── */}
                    <div className="glass-card leave-balance-card">
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
                                            style={{ width: `${(b.remaining / b.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="bal-count">{b.remaining}<small>/{b.total}</small></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Recent Leave Requests ── */}
                    <div className="glass-card recent-leaves-card">
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

                    {/* ── Quick Actions ── */}
                    <div className="glass-card quick-card">
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
                .emp-wrapper { padding: 30px; display: flex; flex-direction: column; gap: 28px; position: relative; }

                /* ── Toast ── */
                .emp-toast { position: fixed; bottom: 28px; right: 28px; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 9999; animation: slideUp 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
                .emp-toast.ok  { background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; }
                .emp-toast.err { background: rgba(239,68,68,0.15);  border: 1px solid #ef4444; color: #ef4444; }
                @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

                /* ── Header ── */
                .emp-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .emp-greeting { font-size: 14px; color: var(--text-muted); }
                .emp-name { font-size: 30px; font-weight: 800; margin: 4px 0 6px; }
                .emp-date { font-size: 13px; }
                .notif-btn { position: relative; width: 46px; height: 46px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
                .notif-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .notif-count { position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 10px; font-weight: 800; padding: 2px 5px; border-radius: 20px; }

                /* ── Stats ── */
                .emp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; }

                /* ── Main grid ── */
                .emp-main-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
                .emp-left  { display: flex; flex-direction: column; gap: 20px; }
                .emp-right { display: flex; flex-direction: column; gap: 20px; }

                /* ── Attendance card ── */
                .attend-card { padding: 26px; }
                .attend-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
                .attend-card-header h3 { font-size: 16px; font-weight: 700; }
                .view-details-btn { display: flex; align-items: center; gap: 5px; background: none; color: var(--primary); font-size: 12px; font-weight: 600; cursor: pointer; }
                .view-details-btn:hover { text-decoration: underline; }

                /* ── Timer ring ── */
                .timer-ring-wrap { display: flex; justify-content: center; margin-bottom: 24px; }
                .timer-ring {
                    width: 160px; height: 160px; border-radius: 50%;
                    border: 3px solid var(--border);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    gap: 8px; color: var(--text-muted);
                    transition: all 0.4s;
                    background: rgba(255,255,255,0.02);
                }
                .timer-ring.active {
                    border-color: #6366f1;
                    color: #6366f1;
                    box-shadow: 0 0 30px rgba(99,102,241,0.25);
                    animation: ringGlow 2s ease-in-out infinite alternate;
                }
                .timer-ring.done { border-color: #10b981; color: #10b981; box-shadow: 0 0 20px rgba(16,185,129,0.15); }
                @keyframes ringGlow { from { box-shadow: 0 0 15px rgba(99,102,241,0.15); } to { box-shadow: 0 0 35px rgba(99,102,241,0.35); } }
                .ring-timer { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; color: inherit; }
                .ring-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

                /* ── Time pills ── */
                .time-pills { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 22px; }
                .time-pill { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 64px; }
                .pill-icon { color: var(--text-muted); }
                .pill-icon.in  { color: #10b981; }
                .pill-icon.out { color: #ef4444; }
                .pill-label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.5px; }
                .pill-value { font-size: 15px; font-weight: 700; color: white; }
                .time-divider { width: 1px; height: 36px; background: var(--border); }

                /* ── Attendance action buttons ── */
                .attend-actions { display: flex; justify-content: center; }
                .attend-btn {
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    width: 100%; max-width: 260px;
                    padding: 14px 24px; border-radius: 12px;
                    font-size: 15px; font-weight: 700;
                    cursor: pointer; transition: all 0.25s;
                    border: none;
                }
                .checkin-btn  { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.35); }
                .checkin-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,0.45); }
                .checkout-btn { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; box-shadow: 0 4px 20px rgba(239,68,68,0.35); }
                .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(239,68,68,0.45); }
                .attend-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .shift-done-badge {
                    display: flex; align-items: center; gap: 10px;
                    background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
                    color: #10b981; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 14px;
                }

                /* ── Weekly card ── */
                .weekly-card { padding: 22px; }

                /* ── Leave balance card ── */
                .leave-balance-card { padding: 22px; }
                .balance-list { display: flex; flex-direction: column; gap: 14px; margin-top: 4px; }
                .balance-row { display: flex; align-items: center; gap: 12px; }
                .bal-type { width: 56px; font-size: 12px; font-weight: 600; color: var(--text-muted); }
                .bal-bar-wrap { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
                .bal-bar { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 10px; transition: width 0.6s ease; }
                .bal-count { font-size: 13px; font-weight: 700; min-width: 40px; text-align: right; }
                .bal-count small { font-size: 11px; color: var(--text-muted); font-weight: 400; }

                /* ── Recent leaves card ── */
                .recent-leaves-card { padding: 22px; }
                .leave-mini-list { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
                .leave-mini-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
                .leave-mini-row:last-child { border-bottom: none; }
                .lm-type { font-size: 13px; font-weight: 600; margin-right: 8px; }
                .lm-dates { font-size: 12px; }
                .lm-status { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
                .lm-status.pending  { background: rgba(245,158,11,0.1);  color: #f59e0b; }
                .lm-status.approved { background: rgba(16,185,129,0.1);  color: #10b981; }
                .lm-status.rejected { background: rgba(239,68,68,0.1);   color: #ef4444; }
                .lm-status.cancelled { background: rgba(100,116,139,0.1); color: #64748b; }

                /* ── Quick actions ── */
                .quick-card { padding: 22px; }
                .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .q-btn {
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                    padding: 16px 10px; border-radius: 12px;
                    background: rgba(255,255,255,0.04); border: 1px solid var(--border);
                    color: var(--text-muted); font-size: 12px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s; position: relative;
                }
                .q-btn:hover { background: rgba(99,102,241,0.1); border-color: var(--primary); color: var(--primary); }
                .q-badge { position: absolute; top: 8px; right: 8px; background: #ef4444; color: white; font-size: 10px; font-weight: 800; padding: 1px 5px; border-radius: 10px; }

                /* ── Loading ── */
                .emp-loading { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-muted); }
                .loader-spin { animation: spin 1s linear infinite; color: var(--primary); }

                @media (max-width: 1100px) {
                    .emp-main-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .emp-wrapper { padding: 15px; gap: 20px; }
                    .emp-header { flex-direction: column; gap: 15px; }
                    .emp-name { font-size: 24px; }
                    .notif-btn { display: none; }
                    .emp-stats { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                    .attend-card { padding: 16px; }
                    .timer-ring { width: 140px; height: 140px; }
                    .ring-timer { font-size: 18px; }
                    .time-pills { gap: 10px; }
                    .time-pill { min-width: 50px; }
                    .pill-value { font-size: 13px; }
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
};

export default EmployeeDashboard;
