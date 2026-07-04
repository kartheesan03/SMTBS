import React, { useState, useEffect, useContext } from 'react';
import DataTable from '../components/Dashboard/DataTable';
import AttendanceHistoryTable from '../components/Dashboard/AttendanceHistoryTable';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Clock, Calendar, CheckCircle, Play, Square, Timer, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './MyAttendance.css';

const MyAttendance = () => {
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [timer, setTimer] = useState("0h 0m 0s");
    const [stats, setStats] = useState({ avg: '0h', present: 0 });
    const { user } = useContext(AuthContext);

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

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let interval;
        if (status && status.checkIn && !status.checkOut) {
            interval = setInterval(() => {
                const start = parseDateTime(status.checkIn, status.date);
                if (!start) return;
                const now = new Date();
                const diff = now - start;
                
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                
                setTimer(`${hours}h ${minutes}m ${seconds}s`);
            }, 1000);
        } else if (status && status.checkIn && status.checkOut) {
            const start = parseDateTime(status.checkIn, status.date);
            const end = parseDateTime(status.checkOut, status.date);
            if (start && end) {
                const diff = end - start;
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                setTimer(`${hours}h ${minutes}m`);
            } else {
                setTimer("-");
            }
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
            
            let finalHistory = historyRes.data;
            const today = new Date().toISOString().split('T')[0];
            const hasToday = historyRes.data.some(h => h.date && h.date.split('T')[0] === today);
            
            if (!hasToday) {
                finalHistory = [{ date: today, status: statusRes.data?.status || '-' }, ...historyRes.data];
            }
            
            setHistory(finalHistory);
            
            if (historyRes.data.length > 0) {
                const presentDays = historyRes.data.filter(h => h.status === 'Present' || h.status === 'Late').length;
                const withHours = historyRes.data.filter(h => h.checkIn && h.checkOut);
                const totalHours = withHours.reduce((sum, h) => {
                    const start = parseDateTime(h.checkIn, h.date);
                    const end = parseDateTime(h.checkOut, h.date);
                    if (start && end) {
                        return sum + (end - start) / 3600000;
                    }
                    return sum;
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
        if (actionLoading) return;
        setActionLoading(true);
        
        const performCheckIn = async (location = null) => {
            try {
                const { data } = await API.post('/attendance/checkin', { location });
                setStatus(data);
                fetchData();
                toast.success('Successfully checked in!');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Check-in failed');
            } finally {
                setActionLoading(false);
            }
        };

        if (user?.role === 'Sales') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        performCheckIn({ lat: position.coords.latitude, lng: position.coords.longitude });
                    },
                    (err) => {
                        toast.error('Location access denied. Sales must provide location.');
                        setActionLoading(false);
                    }
                );
            } else {
                toast.error('Geolocation not supported');
                setActionLoading(false);
            }
        } else {
            performCheckIn();
        }
    };

    const handleCheckOut = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            const { data } = await API.post('/attendance/checkout');
            setStatus(data);
            fetchData();
            toast.success('Successfully checked out!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-out failed');
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (timeStr, baseDateStr) => {
        if (!timeStr) return '-';
        const d = parseDateTime(timeStr, baseDateStr);
        if (!d) return '-';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return (
        <div className="attendance-loading-screen">
            <div className="attendance-loader"></div>
            <p>Loading attendance data...</p>
        </div>
    );

    const isShiftActive = status?.checkIn && !status?.checkOut;
    const isShiftCompleted = status?.checkIn && status?.checkOut;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip">
                    <p className="chart-tooltip-label">{label}</p>
                    <p className="chart-tooltip-value">
                        <span className="dot"></span>
                        {`${payload[0].value} Hours`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="attendance-page-container"
        >
            <header className="attendance-page-header">
                <div className="header-text-group">
                    <h1 className="page-title">Attendance & Time Tracking</h1>
                    <p className="page-subtitle">Manage your daily presence and monitor work sessions in real-time.</p>
                </div>
                <div className="header-actions">
                    {!status?.checkIn ? (
                        <button 
                            className="btn-action btn-checkin"
                            onClick={handleCheckIn}
                            disabled={actionLoading}
                        >
                            <Play size={18} fill="currentColor" /> {actionLoading ? 'Processing...' : 'Check In Now'}
                        </button>
                    ) : !status?.checkOut ? (
                        <button 
                            onClick={handleCheckOut} 
                            className="btn-action btn-checkout pulse-button-red"
                            disabled={actionLoading}
                        >
                            <Square size={18} fill="currentColor" /> {actionLoading ? 'Processing...' : 'Check Out Now'}
                        </button>
                    ) : (
                        <div className="badge-completed">
                            <CheckCircle size={18} /> Shift Completed
                        </div>
                    )}
                </div>
            </header>

            <div className="attendance-bento-grid">
                {/* Hero Session Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className={`bento-card hero-session-card ${isShiftActive ? 'active-shift' : isShiftCompleted ? 'completed-shift' : ''}`}
                >
                    <div className="session-card-content">
                        <div className="session-status-header">
                            <div className="icon-ring">
                                <Timer size={28} className={isShiftActive ? "spin-slow" : ""} />
                            </div>
                            <span className="session-status-text">
                                {isShiftCompleted ? "Shift Duration" : isShiftActive ? "Active Session" : "Ready to Start"}
                            </span>
                        </div>
                        
                        <div className="timer-display-wrapper">
                            <h2 className="live-timer-text">{timer}</h2>
                            {isShiftActive && <div className="live-indicator">LIVE</div>}
                        </div>

                        <div className="session-timeline">
                            <div className="timeline-point">
                                <span className="point-label">CHECK IN</span>
                                <span className="point-time">{formatTime(status?.checkIn, status?.date)}</span>
                            </div>
                            <div className="timeline-divider">
                                <div className="line"></div>
                            </div>
                            <div className="timeline-point">
                                <span className="point-label">CHECK OUT</span>
                                <span className="point-time">{formatTime(status?.checkOut, status?.date)}</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="glass-blob blob-1"></div>
                    <div className="glass-blob blob-2"></div>
                </motion.div>

                {/* KPI Cards */}
                <div className="kpi-vertical-stack">
                    <div className="bento-card kpi-card blue-glow">
                        <div className="kpi-icon-wrap text-blue-500 bg-blue-500/10">
                            <Activity size={24} />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-label">Average Work Hours</span>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{stats.avg}</h3>
                                <span className="kpi-suffix">/ Day</span>
                            </div>
                        </div>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                        className="bento-card kpi-card emerald-glow"
                    >
                        <div className="kpi-icon-wrap text-emerald-500 bg-emerald-500/10">
                            <Calendar size={24} />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-label">Days Present</span>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{stats.present}</h3>
                                <span className="kpi-suffix">This Month</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Work Hours Trend Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="bento-card chart-card"
                >
                    <div className="chart-header">
                        <TrendingUp size={20} className="text-indigo-500" />
                        <h3 className="chart-title">Work Hours Trend (Last 7 Days)</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={(() => {
                                const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
                                return days.map(d => {
                                    const rec = history.find(h => {
                                        const dn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(h.date).getDay()];
                                        return dn === d;
                                    });
                                    if (!rec || !rec.checkIn || !rec.checkOut) return { n: d, h: 0 };
                                    const start = parseDateTime(rec.checkIn, rec.date);
                                    const end = parseDateTime(rec.checkOut, rec.date);
                                    if (!start || !end) return { n: d, h: 0 };
                                    const hrs = (end - start) / 3600000;
                                    return { n: d, h: parseFloat(hrs.toFixed(1)) };
                                });
                            })()} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="n" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="h" stroke="#4f46e5" strokeWidth={3} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* History Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="bento-card table-card"
            >
                <AttendanceHistoryTable isEmployeeView={true} />
            </motion.div>
        </motion.div>
    );
};

export default MyAttendance;
