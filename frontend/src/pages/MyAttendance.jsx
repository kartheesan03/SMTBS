import React, { useState, useEffect } from 'react';
import DataTable from '../components/Dashboard/DataTable';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Clock, Calendar, CheckCircle, Play, Square, Timer } from 'lucide-react';
import API from '../api/axios';

const MyAttendance = () => {
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState("0h 0m 0s");
    const [stats, setStats] = useState({ avg: '0h', present: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let interval;
        if (status && status.checkIn && !status.checkOut) {
            interval = setInterval(() => {
                const start = new Date(status.checkIn);
                const now = new Date();
                const diff = now - start;
                
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                
                setTimer(`${hours}h ${minutes}m ${seconds}s`);
            }, 1000);
        } else if (status && status.checkIn && status.checkOut) {
            const start = new Date(status.checkIn);
            const end = new Date(status.checkOut);
            const diff = end - start;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            setTimer(`${hours}h ${minutes}m`);
        } else {
            setTimer("0h 0m 0s");
        }
        return () => clearInterval(interval);
    }, [status]);

    const fetchData = async () => {
        try {
            const [statusRes, historyRes] = await Promise.all([
                API.get('/attendance/status'),
                API.get('/attendance/my-history')
            ]);
            setStatus(statusRes.data);
            setHistory(historyRes.data);
            
            // Calculate real stats from history
            if (historyRes.data.length > 0) {
                const presentDays = historyRes.data.filter(h => h.status === 'Present').length;
                // Real avg hours from records that have both checkIn and checkOut
                const withHours = historyRes.data.filter(h => h.checkIn && h.checkOut);
                const totalHours = withHours.reduce((sum, h) => {
                    return sum + (new Date(h.checkOut) - new Date(h.checkIn)) / 3600000;
                }, 0);
                const avg = withHours.length > 0
                    ? `${(totalHours / withHours.length).toFixed(1)}h`
                    : '0h';
                setStats({ present: presentDays, avg });
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            const { data } = await API.post('/attendance/check-in');
            setStatus(data);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            const { data } = await API.post('/attendance/check-out');
            setStatus(data);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-out failed');
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '-';
        const diff = new Date(checkOut) - new Date(checkIn);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    if (loading) return <div className="p-30">Loading attendance data...</div>;

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Attendance & Time Tracking</h1>
                    <p className="text-muted">Manage your daily presence and monitor work sessions.</p>
                </div>
                <div className="header-actions">
                    {!status?.checkIn ? (
                        <button onClick={handleCheckIn} className="btn-primary flex-center gap-10">
                            <Play size={18} /> Check In Now
                        </button>
                    ) : !status?.checkOut ? (
                        <button onClick={handleCheckOut} className="btn-danger flex-center gap-10">
                            <Square size={18} /> Check Out
                        </button>
                    ) : (
                        <div className="status-badge-completed">Shift Completed</div>
                    )}
                </div>
            </header>

            <div className="attendance-grid">
                {/* Real-time Timer Card */}
                <div className="glass-card active-session-card">
                    <div className="session-info">
                        <div className="timer-icon-box">
                            <Timer size={32} className={status?.checkIn && !status?.checkOut ? "pulse" : ""} />
                        </div>
                        <div>
                            <span className="session-label">{status?.checkOut ? "Shift Duration" : status?.checkIn ? "Active Session" : "Ready to Start"}</span>
                            <h2 className="live-timer">{timer}</h2>
                        </div>
                    </div>
                    <div className="session-details">
                        <div className="detail">
                            <span className="label">Check In</span>
                            <span className="value">{formatTime(status?.checkIn)}</span>
                        </div>
                        <div className="detail">
                            <span className="label">Check Out</span>
                            <span className="value">{formatTime(status?.checkOut)}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card chart-box">
                    <h3>Work Hours Trend (Last 7 Days)</h3>
                    <div style={{ height: 200, width: '100%', marginTop: 20 }}>
                        <ResponsiveContainer>
                            <AreaChart data={(() => {
                                const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
                                return days.map(d => {
                                    const rec = history.find(h => {
                                        const dn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(h.date).getDay()];
                                        return dn === d;
                                    });
                                    if (!rec || !rec.checkIn || !rec.checkOut) return { n: d, h: 0 };
                                    const hrs = (new Date(rec.checkOut) - new Date(rec.checkIn)) / 3600000;
                                    return { n: d, h: parseFloat(hrs.toFixed(1)) };
                                });
                            })()}>
                                <defs>
                                    <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="n" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                                <Area type="monotone" dataKey="h" stroke="#6366f1" fill="url(#colorH)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="summary-section">
                    <div className="glass-card s-box">
                        <CheckCircle color="#10b981" size={24} />
                        <div className="s-text">
                            <h4>Avg. Work Hours</h4>
                            <p>{stats.avg} / Day</p>
                        </div>
                    </div>
                    <div className="glass-card s-box">
                        <Calendar color="#6366f1" size={24} />
                        <div className="s-text">
                            <h4>Days Present</h4>
                            <p>{stats.present} This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="module-content mt-30">
                <DataTable 
                    title="Recent Daily Logs"
                    headers={['Date', 'Check In', 'Check Out', 'Total Hours', 'Status']}
                    data={history}
                    renderRow={(a) => (
                        <>
                            <td><strong>{new Date(a.date).toLocaleDateString()}</strong></td>
                            <td>{formatTime(a.checkIn)}</td>
                            <td>{formatTime(a.checkOut)}</td>
                            <td>{calculateDuration(a.checkIn, a.checkOut)}</td>
                            <td><span className={`status-pill ${a.status.toLowerCase()}`}>{a.status}</span></td>
                        </>
                    )}
                />
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; gap: 20px; }
                
                .attendance-grid { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 20px; }
                
                .active-session-card { padding: 25px; display: flex; flex-direction: column; justify-content: space-between; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); }
                .session-info { display: flex; align-items: center; gap: 20px; }
                .timer-icon-box { background: var(--glass); width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; color: var(--primary); border: 1px solid var(--border); flex-shrink: 0; }
                .session-label { font-size: 13px; color: var(--text-muted); display: block; }
                .live-timer { font-size: 32px; font-weight: 800; color: white; margin-top: 5px; font-variant-numeric: tabular-nums; }
                .session-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border); }
                .detail .label { display: block; font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 5px; }
                .detail .value { font-size: 15px; font-weight: 600; }

                .chart-box { padding: 25px; }
                .summary-section { display: flex; flex-direction: column; gap: 20px; }
                .s-box { display: flex; align-items: center; gap: 20px; padding: 20px; }
                .s-text h4 { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
                .s-text p { font-size: 18px; font-weight: 700; color: var(--text-main); }
                
                .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-pill.present { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.late { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                
                .pulse { animation: pulse-red 2s infinite; color: #10b981; }
                @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

                .status-badge-completed { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; border: 1px solid rgba(16, 185, 129, 0.2); }
                .btn-danger { background: #ef4444; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 600; }
                .btn-danger:hover { background: #dc2626; }
                
                .mt-30 { margin-top: 30px; }

                @media (max-width: 1200px) {
                    .attendance-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .module-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .header-actions { width: 100%; }
                    .header-actions button { width: 100%; }
                    .live-timer { font-size: 24px; }
                    .summary-section { flex-direction: row; flex-wrap: wrap; }
                    .s-box { flex: 1; min-width: 200px; }
                }

                @media (max-width: 480px) {
                    .summary-section { flex-direction: column; }
                    .s-box { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default MyAttendance;
