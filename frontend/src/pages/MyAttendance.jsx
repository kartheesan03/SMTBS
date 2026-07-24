import React, { useState, useEffect, useContext } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
    Clock, Calendar, CheckCircle, Fingerprint, LogOut, FileText, Download, Target, 
    AlertCircle, Coffee, TrendingUp, ChevronRight, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './MyAttendance.css';
import PageHeader from '../components/PageHeader';

const AttendanceKPICard = ({ title, value, subtitle, icon: Icon, color }) => {
    const themeClass = color ? `ent-theme-${color}` : 'ent-theme-primary';
    return (
        <div className={`ent-module-card ${themeClass}`}>
            <div className="ent-card-icon-wrapper">
                {Icon && <Icon size={20} strokeWidth={2.5} />}
            </div>
            <div className="ent-card-title" title={title}>{title}</div>
            <div className="ent-card-value-area">
                <div className="ent-card-value">{value}</div>
                <div className="ent-card-status-badge" style={{ backgroundColor: 'transparent', padding: 0, color: 'var(--ent-text-secondary)', fontWeight: 500 }}>
                    {subtitle || 'Active Tracking'}
                </div>
            </div>
            <div className="ent-card-footer">
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '0px', backgroundColor: 'currentColor' }}></div>
                    Updated Today
                </div>
            </div>
        </div>
    );
};

const MyAttendance = () => {
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [timer, setTimer] = useState("00h 00m 00s");
    const [progressPercent, setProgressPercent] = useState(0);
    const [stats, setStats] = useState({ 
        present: 0, attendanceRate: '0%', avgHours: '0h', weeklyHours: '0h',
        leaveBalance: 12, streak: 5, late: 0, overtime: '4.5h'
    });
    
    const { user } = useContext(AuthContext);
    const firstName = user?.name ? user.name.split(' ')[0] : 'Karthik';
    const currentDate = new Date();

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
                
                setTimer(`${hours.toString().padStart(2,'0')}h ${minutes.toString().padStart(2,'0')}m ${seconds.toString().padStart(2,'0')}s`);
                
                const percent = Math.min(Math.round(((diff / 3600000) / 8) * 100), 100);
                setProgressPercent(percent);
            }, 1000);
        } else if (status && status.checkIn && status.checkOut) {
            const start = parseDateTime(status.checkIn, status.date);
            const end = parseDateTime(status.checkOut, status.date);
            if (start && end) {
                const diff = end - start;
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                setTimer(`${hours.toString().padStart(2,'0')}h ${minutes.toString().padStart(2,'0')}m 00s`);
                const percent = Math.min(Math.round((hours / 8) * 100), 100);
                setProgressPercent(percent);
            }
        } else {
            setTimer("00h 00m 00s");
            setProgressPercent(0);
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
            if (!historyRes.data.some(h => h.date && h.date.split('T')[0] === today)) {
                finalHistory = [{ date: today, status: statusRes.data?.status || '-' }, ...historyRes.data];
            }
            setHistory(finalHistory);
            
            if (historyRes.data.length > 0) {
                const presentDays = historyRes.data.filter(h => h.status === 'Present' || h.status === 'Late').length;
                const lateDays = historyRes.data.filter(h => h.status === 'Late').length;
                const withHours = historyRes.data.filter(h => h.checkIn && h.checkOut);
                
                let totalHours = 0;
                withHours.forEach(h => {
                    const start = parseDateTime(h.checkIn, h.date);
                    const end = parseDateTime(h.checkOut, h.date);
                    if (start && end) totalHours += (end - start) / 3600000;
                });
                
                const avgHours = withHours.length > 0 ? `${(totalHours / withHours.length).toFixed(1)}h` : '0h';
                const rate = Math.round((presentDays / (historyRes.data.length || 1)) * 100);
                
                setStats(prev => ({ 
                    ...prev,
                    present: presentDays, 
                    attendanceRate: `${rate}%`,
                    avgHours: avgHours,
                    weeklyHours: `${Math.min(totalHours, 40).toFixed(1)}h`,
                    late: lateDays
                }));
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
        try {
            const { data } = await API.post('/attendance/checkin');
            setStatus(data);
            fetchData();
            toast.success('Successfully checked in!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-in failed');
        } finally {
            setActionLoading(false);
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
        if (!timeStr) return '--:-- --';
        const d = parseDateTime(timeStr, baseDateStr);
        if (!d) return '--:-- --';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isShiftActive = status?.checkIn && !status?.checkOut;
    const isShiftCompleted = status?.checkIn && status?.checkOut;

    if (loading) return <div className="attendance-page-container">Loading...</div>;

    // Calendar days generation (real data)
    const calDays = Array.from({length: 14}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 7 + i);
        let s = 'empty';
        if (i > 7) {
            s = d.getDay() === 0 || d.getDay() === 6 ? 'weekend' : 'empty';
        } else {
            const historyRec = history.find(h => {
                if(!h.date) return false;
                const hd = new Date(h.date);
                return hd.getDate() === d.getDate() && hd.getMonth() === d.getMonth();
            });
            if (historyRec) {
                s = historyRec.status ? historyRec.status.toLowerCase() : 'empty';
            } else {
                s = d.getDay() === 0 || d.getDay() === 6 ? 'weekend' : 'empty';
            }
            if (i === 7) {
                s = `today ${s}`;
            }
        }
        return { date: d.getDate(), status: s };
    });
    
    const getExpectedCheckout = () => {
        if (!status?.checkIn) return '--:-- --';
        const start = parseDateTime(status.checkIn, status.date);
        if (!start) return '--:-- --';
        start.setHours(start.getHours() + 8);
        start.setMinutes(start.getMinutes() + 30);
        return start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#111827', color: '#fff', padding: '8px 12px', borderRadius: 0, fontSize: 12 }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>{label}</p>
                    <p style={{ margin: 0, color: '#10B981' }}>{`${payload[0].value} Hours`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="attendance-page-container"
        >
            <PageHeader title="My Attendance" badge="HRMS" subtitle={`Your personal attendance records · ${firstName}`} />
            <div className="att-main-grid">
                
                {/* ── LEFT COLUMN: HERO ── */}
                <div className="att-left-col">
                    <div className="att-card att-hero-card">
                        <div className="att-hero-top">
                            <div className="att-avatar">{firstName.charAt(0)}</div>
                            <h2 className="att-greeting">Good Afternoon, {firstName}</h2>
                            <p className="att-date">Today: {currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            
                            <div className={`att-status-pill ${isShiftActive ? 'active' : isShiftCompleted ? 'completed' : 'offline'}`}>
                                {isShiftActive && <div className="att-status-dot"></div>}
                                {isShiftActive ? "Working" : isShiftCompleted ? "Completed" : "Offline"}
                            </div>
                        </div>

                        <div className="att-divider"></div>

                        <div className="att-hero-mid">
                            <h4>Today's Session</h4>
                            
                            <div className="att-hero-metrics">
                                <div className="att-hero-metric">
                                    <span>Checked In</span>
                                    <span>{formatTime(status?.checkIn, status?.date)}</span>
                                </div>
                                <div className="att-hero-metric">
                                    <span>Working Time</span>
                                    <span className="live-timer">{timer}</span>
                                </div>
                                <div className="att-hero-metric">
                                    <span>Expected Checkout</span>
                                    <span>{getExpectedCheckout()}</span>
                                </div>
                            </div>

                            <div className="att-hero-goal">
                                <div className="att-hero-goal-header">
                                    <span>Today's Goal</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="att-progress-bar-container">
                                    <div className="att-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="att-divider"></div>

                        <div className="att-hero-bottom">
                            {!status?.checkIn ? (
                                <button className="att-hero-btn primary" onClick={handleCheckIn} disabled={actionLoading}>
                                    <Fingerprint size={16} /> Check In
                                </button>
                            ) : !status?.checkOut ? (
                                <>
                                    <button className="att-hero-btn danger" onClick={handleCheckOut} disabled={actionLoading}>
                                        <LogOut size={16} /> Check Out
                                    </button>
                                    <button className="att-hero-btn outline">
                                        <Coffee size={16} /> Break
                                    </button>
                                </>
                            ) : (
                                <button className="att-hero-btn outline" disabled>
                                    <CheckCircle size={16} className="text-green" /> Shift Completed
                                </button>
                            )}
                            <button className="att-hero-btn outline" style={{marginTop: !isShiftActive && !isShiftCompleted ? 0 : 8}}>
                                <FileText size={16} /> Request Leave
                            </button>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY */}
                    <div className="att-card" style={{marginTop: 24}}>
                        <h3 className="att-section-title"><Activity size={18} /> Recent Activity</h3>
                        <div className="att-feed-item">
                            <div className="att-feed-icon text-green"><CheckCircle size={14} /></div>
                            <div className="att-feed-content">
                                <p>Checked In</p>
                                <span>Today, 08:58 AM</span>
                            </div>
                        </div>
                        <div className="att-feed-item">
                            <div className="att-feed-icon text-amber"><Coffee size={14} /></div>
                            <div className="att-feed-content">
                                <p>Break Started</p>
                                <span>Today, 10:45 AM</span>
                            </div>
                        </div>
                        <div className="att-feed-item">
                            <div className="att-feed-icon text-indigo"><CheckCircle size={14} /></div>
                            <div className="att-feed-content">
                                <p>Leave Approved</p>
                                <span>Yesterday, 03:20 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: DASHBOARD ── */}
                <div className="att-right-col">
                    
                    {/* TOP SUMMARY KPIs */}
                    <div className="att-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <AttendanceKPICard title="Present" value={stats.present} subtitle="Days logged" icon={Calendar} color="success" />
                        <AttendanceKPICard title="Attendance %" value={stats.attendanceRate} subtitle="Overall rate" icon={Target} color="info" />
                        <AttendanceKPICard title="Weekly Hours" value={stats.weeklyHours} subtitle="Hours worked" icon={Clock} color="primary" />
                        <AttendanceKPICard title="Leave Balance" value={stats.leaveBalance} subtitle="Available days" icon={FileText} color="warning" />
                        <AttendanceKPICard title="Current Streak" value={stats.streak} subtitle="Days in a row" icon={Activity} color="warning" />
                        <AttendanceKPICard title="Late Arrivals" value={stats.late} subtitle="This month" icon={AlertCircle} color="danger" />
                        <AttendanceKPICard title="Overtime" value={stats.overtime} subtitle="Extra hours" icon={Activity} color="info" />
                        
                        <div className="ent-module-card" style={{justifyContent: 'center', alignItems: 'center', background: 'var(--ent-bg-page)', borderStyle: 'dashed', cursor: 'pointer', minHeight: 155}}>
                            <span style={{fontSize: 13, fontWeight: 600, color: 'var(--ent-color-primary)'}}>View All Metrics <ChevronRight size={14} style={{verticalAlign: 'middle'}}/></span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {/* TODAY TIMELINE */}
                        <div className="att-card">
                            <h3 className="att-section-title"><Clock size={18} /> Today Timeline</h3>
                            <div className="att-timeline-container">
                                <div className="att-timeline-item">
                                    <div className="att-timeline-dot"></div>
                                    <span className="att-timeline-time">08:58 AM</span>
                                    <span className="att-timeline-desc">Checked In</span>
                                </div>
                                <div className="att-timeline-item">
                                    <div className="att-timeline-dot" style={{background: '#f59e0b'}}></div>
                                    <span className="att-timeline-time">10:45 AM</span>
                                    <span className="att-timeline-desc">Break Started</span>
                                </div>
                                <div className="att-timeline-item">
                                    <div className="att-timeline-dot"></div>
                                    <span className="att-timeline-time">11:00 AM</span>
                                    <span className="att-timeline-desc">Back to Work</span>
                                </div>
                                <div className="att-timeline-item">
                                    <div className="att-timeline-dot" style={{background: '#3b82f6'}}></div>
                                    <span className="att-timeline-time">01:30 PM</span>
                                    <span className="att-timeline-desc">Team Meeting</span>
                                </div>
                                {isShiftCompleted && (
                                    <div className="att-timeline-item">
                                        <div className="att-timeline-dot" style={{background: '#ef4444'}}></div>
                                        <span className="att-timeline-time">{formatTime(status?.checkOut, status?.date)}</span>
                                        <span className="att-timeline-desc">Checked Out</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* WORK PROGRESS & CALENDAR */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="att-card">
                                <h3 className="att-section-title"><Target size={18} /> Work Progress</h3>
                                <div className="att-progress-card-content">
                                    <span>Today's Target</span>
                                    <div className="att-progress-bar-container" style={{height: 12}}>
                                        <div className="att-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    <h1>{(progressPercent / 100 * 8).toFixed(1)} <span>/ 8 Hours</span></h1>
                                    <span style={{fontSize: 13, color: '#475569'}}>Remaining: {Math.max(8 - (progressPercent / 100 * 8), 0).toFixed(1)} Hours</span>
                                </div>
                            </div>

                            <div className="att-card">
                                <h3 className="att-section-title"><Calendar size={18} /> Attendance Calendar</h3>
                                <div className="att-calendar-grid">
                                    {['M','T','W','T','F','S','S'].map((d,i) => <div key={i} className="att-cal-day-header">{d}</div>)}
                                    {calDays.map((d, i) => (
                                        <div key={i} className={`att-cal-day ${d.status}`}>
                                            {d.status !== 'empty' ? d.date : ''}
                                        </div>
                                    ))}
                                </div>
                                <div style={{display: 'flex', gap: 12, marginTop: 16, fontSize: 11, color: '#64748b', justifyContent: 'center', flexWrap: 'wrap'}}>
                                    <span style={{display: 'flex', alignItems: 'center', gap: 4}}><div style={{width: 8, height: 8, borderRadius: 0, background: '#dcfce7', border: '1px solid #16a34a'}}></div> Present</span>
                                    <span style={{display: 'flex', alignItems: 'center', gap: 4}}><div style={{width: 8, height: 8, borderRadius: 0, background: '#fee2e2', border: '1px solid #ef4444'}}></div> Absent</span>
                                    <span style={{display: 'flex', alignItems: 'center', gap: 4}}><div style={{width: 8, height: 8, borderRadius: 0, background: '#ffedd5', border: '1px solid #f97316'}}></div> Leave</span>
                                    <span style={{display: 'flex', alignItems: 'center', gap: 4}}><div style={{width: 8, height: 8, borderRadius: 0, background: '#dbeafe', border: '1px solid #2563eb'}}></div> Holiday</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCTIVITY & QUICK ACTIONS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                        <div className="att-card">
                            <h3 className="att-section-title"><Activity size={18} /> Productivity Analytics</h3>
                            <div className="att-chart-container">
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
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.5}/>
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="n" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                                        <Area type="monotone" dataKey="h" stroke="#4F46E5" strokeWidth={3} fill="url(#colorHours)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div>
                            <h3 className="att-section-title"><Fingerprint size={18} /> Quick Actions</h3>
                            <div className="att-quick-actions-row">
                                <div className="att-action-pill" onClick={() => window.location.href = '/leave-management/apply'} style={{cursor: 'pointer'}}>
                                    <FileText size={24} />
                                    <span>Leave Request</span>
                                </div>
                                <div className="att-action-pill" onClick={() => window.location.href = '/leave-management/history'} style={{cursor: 'pointer'}}>
                                    <Calendar size={24} />
                                    <span>Leave History</span>
                                </div>
                                <div className="att-action-pill">
                                    <Download size={24} />
                                    <span>Download Report</span>
                                </div>
                                <div className="att-action-pill">
                                    <Timer size={24} />
                                    <span>Overtime Form</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default MyAttendance;
