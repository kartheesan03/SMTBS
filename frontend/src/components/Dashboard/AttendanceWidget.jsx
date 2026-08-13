import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Play, Square, Timer, Calendar, CheckCircle2, MapPin, Clock } from 'lucide-react';

const AttendanceWidget = ({ onStatusChange }) => {
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
        if (onStatusChange) {
            onStatusChange(status);
        }
    }, [status, onStatusChange]);

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
                
                // Format nicely: 01h 05m 09s
                const pad = (num) => num.toString().padStart(2, '0');
                setTimer(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
            }, 1000);
        } else if (status && status.checkIn && status.checkOut) {
            const start = parseDateTime(status.checkIn, status.date);
            const end = parseDateTime(status.checkOut, status.date);
            if (start && end) {
                const diff = end - start;
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const pad = (num) => num.toString().padStart(2, '0');
                setTimer(`${pad(hours)}h ${pad(minutes)}m`);
            } else {
                setTimer("-");
            }
        } else {
            setTimer("00h 00m 00s");
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
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', minHeight: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const isActive = status?.checkIn && !status?.checkOut;
    const isCompleted = status?.checkIn && status?.checkOut;

    return (
        <div style={{
            background: isActive ? 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)' : '#ffffff',
            border: isActive ? '1px solid #bae6fd' : '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: isActive ? '0 10px 25px -5px rgba(56, 189, 248, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            
            {/* Background Decorative Element */}
            {isActive && (
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0
                }} />
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: isActive ? '#38bdf8' : isCompleted ? '#10b981' : '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive || isCompleted ? '#fff' : '#64748b',
                            boxShadow: isActive ? '0 8px 16px -4px rgba(56, 189, 248, 0.4)' : 'none'
                        }}>
                            {isCompleted ? <CheckCircle2 size={28} /> : <Timer size={28} />}
                        </div>
                        
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: isActive ? '#0ea5e9' : '#64748b' }}>
                                    {isCompleted ? "Shift Completed" : isActive ? "Active Session" : "Ready to Start"}
                                </span>
                                {isActive && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '800', color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: '12px' }}>
                                        <div style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', animation: 'pulseLive 2s infinite' }}></div>
                                        LIVE
                                    </span>
                                )}
                            </div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px', lineHeight: '1.1' }}>
                                {timer}
                            </h2>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        {!status?.checkIn ? (
                            <button 
                                onClick={handleCheckIn}
                                disabled={actionLoading}
                                style={{
                                    background: '#0f172a',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 24px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)',
                                    transition: 'all 0.2s',
                                    opacity: actionLoading ? 0.7 : 1
                                }}
                                onMouseOver={(e) => !actionLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseOut={(e) => !actionLoading && (e.currentTarget.style.transform = 'none')}
                            >
                                <Play size={18} fill="currentColor" /> {actionLoading ? 'Processing...' : 'Check In Now'}
                            </button>
                        ) : !status?.checkOut ? (
                            <button 
                                onClick={handleCheckOut} 
                                disabled={actionLoading}
                                style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 24px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
                                    transition: 'all 0.2s',
                                    opacity: actionLoading ? 0.7 : 1
                                }}
                                onMouseOver={(e) => !actionLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseOut={(e) => !actionLoading && (e.currentTarget.style.transform = 'none')}
                            >
                                <Square size={18} fill="currentColor" /> {actionLoading ? 'Processing...' : 'Check Out'}
                            </button>
                        ) : (
                            <div style={{
                                background: '#f0fdf4',
                                color: '#166534',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                fontWeight: '700',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid #bbf7d0'
                            }}>
                                <CheckCircle2 size={18} /> Shift Logged
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div style={{ 
                    display: 'flex', 
                    gap: '40px', 
                    marginTop: '24px', 
                    paddingTop: '20px', 
                    borderTop: isActive ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #f1f5f9',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isActive ? 'rgba(255,255,255,0.6)' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <Clock size={16} />
                        </div>
                        <div>
                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: '700' }}>CHECK IN</span>
                            <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>{formatTime(status?.checkIn, status?.date)}</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isActive ? 'rgba(255,255,255,0.6)' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <Clock size={16} />
                        </div>
                        <div>
                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: '700' }}>CHECK OUT</span>
                            <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>{formatTime(status?.checkOut, status?.date)}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isActive ? 'rgba(255,255,255,0.6)' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <MapPin size={16} />
                        </div>
                        <div>
                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: '700' }}>STATUS</span>
                            <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>
                                {status?.checkIn && !status?.checkOut ? 'Present (Active)' : status?.checkOut ? 'Present (Completed)' : 'Not Started'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes pulseLive {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    );
};

export default AttendanceWidget;