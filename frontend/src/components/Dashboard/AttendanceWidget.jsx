import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Play, Square, Timer, Calendar } from 'lucide-react';

const AttendanceWidget = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [timer, setTimer] = useState("0h 0m 0s");

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

    const fetchStatus = async () => {
        try {
            const res = await API.get('/attendance/status');
            setStatus(res.data);
        } catch (error) {
            console.error('Error fetching attendance status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        let interval;
        if (status && status.checkIn && !status.checkOut) {
            interval = setInterval(() => {
                const start = parseDateTime(status.checkIn, status.date);
                if (!start) return;
                const now = new Date();
                const diff = Math.max(0, now - start);
                
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

    const handleCheckIn = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            const { data } = await API.post('/attendance/checkin', { location: null });
            setStatus(data);
            toast.success("Checked in successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-in failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (actionLoading) return;
        if (!window.confirm('Are you sure you want to check out? You cannot check back in today.')) return;
        
        setActionLoading(true);
        try {
            const { data } = await API.post('/attendance/checkout', { location: null });
            setStatus(data);
            toast.success("Checked out successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-out failed');
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (timeStr, baseDateStr) => {
        if (!timeStr) return '-';
        const d = parseDateTime(timeStr, baseDateStr);
        if (!d) return timeStr;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="premium-card active-session-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px' }}>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="premium-card active-session-card" style={{ marginBottom: '24px' }}>
            <div className="session-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="timer-icon-box" style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: '12px' }}>
                        <Timer size={32} className={status?.checkIn && !status?.checkOut ? "pulse text-primary" : "text-secondary"} />
                    </div>
                    <div>
                        <span className="session-label" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {status?.checkOut ? "Shift Duration" : status?.checkIn ? "Active Session" : "Ready to Start"}
                        </span>
                        <h2 className="live-timer" style={{ color: 'var(--text-heading)', margin: 0, fontSize: '24px' }}>{timer}</h2>
                    </div>
                </div>
                
                <div className="header-actions">
                    {!status?.checkIn ? (
                        <button 
                            className="btn btn-primary check-btn"
                            onClick={handleCheckIn}
                            disabled={actionLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Play size={18} /> {actionLoading ? 'Processing...' : 'Check In Now'}
                        </button>
                    ) : !status?.checkOut ? (
                        <button 
                            onClick={handleCheckOut} 
                            className="btn btn-danger"
                            disabled={actionLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <Square size={18} /> {actionLoading ? 'Processing...' : 'Check Out'}
                        </button>
                    ) : (
                        <div className="status-badge-completed" style={{ background: '#f0fdf4', color: '#166534', padding: '8px 16px', borderRadius: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} /> Shift Completed
                        </div>
                    )}
                </div>
            </div>
            
            {status?.checkIn && (
                <div className="session-details" style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="detail">
                        <span className="label" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Check In Time</span>
                        <span className="value" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{formatTime(status?.checkIn, status?.date)}</span>
                    </div>
                    {status?.checkOut && (
                        <div className="detail">
                            <span className="label" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Check Out Time</span>
                            <span className="value" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{formatTime(status?.checkOut, status?.date)}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendanceWidget;
