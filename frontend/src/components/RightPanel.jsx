import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
    User, Calendar, Bell, Clock, CheckCircle, AlertTriangle,
    Package, ShoppingCart, Users, DollarSign, FileText, Plus,
    ChevronLeft, ChevronRight, Activity, Zap, ArrowRight,
    Briefcase, LifeBuoy, BarChart3
} from 'lucide-react';

const RightPanel = ({ isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [currentDate] = useState(new Date());
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // Fetch recent notifications for activity feed
    const fetchNotifications = useCallback(async () => {
        try {
            const { data } = await API.get('/notifications');
            const notifList = data?.notifications || data || [];
            setNotifications(Array.isArray(notifList) ? notifList.slice(0, 5) : []);
        } catch (err) {
            // Silently fail — panel still renders
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Calendar helpers
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
    const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));

    const isToday = (day) =>
        day === currentDate.getDate() &&
        calendarMonth.getMonth() === currentDate.getMonth() &&
        calendarMonth.getFullYear() === currentDate.getFullYear();

    // Time ago formatter
    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    // Activity icon/color by type
    const getActivityMeta = (type) => {
        const map = {
            'material': { icon: <Package size={14} />, color: '#3b82f6', bg: '#eff6ff' },
            'order': { icon: <ShoppingCart size={14} />, color: '#8b5cf6', bg: '#f5f3ff' },
            'employee': { icon: <Users size={14} />, color: '#10b981', bg: '#ecfdf5' },
            'leave': { icon: <Calendar size={14} />, color: '#f59e0b', bg: '#fffbeb' },
            'salary': { icon: <DollarSign size={14} />, color: '#14b8a6', bg: '#f0fdfa' },
            'task': { icon: <CheckCircle size={14} />, color: '#6366f1', bg: '#eef2ff' },
            'alert': { icon: <AlertTriangle size={14} />, color: '#ef4444', bg: '#fef2f2' },
            'ticket': { icon: <LifeBuoy size={14} />, color: '#ec4899', bg: '#fdf2f8' },
        };
        return map[type?.toLowerCase()] || { icon: <Bell size={14} />, color: '#64748b', bg: '#f8fafc' };
    };

    // Role-specific quick actions
    const getQuickActions = () => {
        const role = user?.role;
        if (role === 'Admin') return [
            { label: 'Add Material', icon: <Package size={16} />, path: '/materials', color: '#3b82f6' },
            { label: 'New Order', icon: <ShoppingCart size={16} />, path: '/erp', color: '#8b5cf6' },
            { label: 'Add Employee', icon: <Users size={16} />, path: '/hrms', color: '#10b981' },
            { label: 'Analytics', icon: <BarChart3 size={16} />, path: '/analytics', color: '#f59e0b' },
        ];
        if (role === 'HR') return [
            { label: 'Employees', icon: <Users size={16} />, path: '/hrms', color: '#3b82f6' },
            { label: 'Attendance', icon: <Clock size={16} />, path: '/attendance', color: '#10b981' },
            { label: 'Payroll', icon: <DollarSign size={16} />, path: '/payroll', color: '#8b5cf6' },
            { label: 'HR Reports', icon: <BarChart3 size={16} />, path: '/hr-reports', color: '#f59e0b' },
        ];
        if (role === 'Manager') return [
            { label: 'My Tasks', icon: <FileText size={16} />, path: '/my-tasks', color: '#3b82f6' },
            { label: 'Team', icon: <Users size={16} />, path: '/team-performance', color: '#10b981' },
            { label: 'Materials', icon: <Package size={16} />, path: '/materials', color: '#8b5cf6' },
            { label: 'Reports', icon: <BarChart3 size={16} />, path: '/analytics', color: '#f59e0b' },
        ];
        if (role === 'Sales') return [
            { label: 'Leads', icon: <Briefcase size={16} />, path: '/crm', color: '#3b82f6' },
            { label: 'Customers', icon: <Users size={16} />, path: '/customers', color: '#10b981' },
            { label: 'Pipeline', icon: <BarChart3 size={16} />, path: '/sales-pipeline', color: '#8b5cf6' },
            { label: 'Follow-ups', icon: <Clock size={16} />, path: '/follow-ups', color: '#f59e0b' },
        ];
        // Employee
        return [
            { label: 'My Tasks', icon: <FileText size={16} />, path: '/my-tasks', color: '#3b82f6' },
            { label: 'Attendance', icon: <Clock size={16} />, path: '/my-attendance', color: '#10b981' },
            { label: 'Leave', icon: <Calendar size={16} />, path: '/leave-management', color: '#8b5cf6' },
            { label: 'My Salary', icon: <DollarSign size={16} />, path: '/my-salary', color: '#f59e0b' },
        ];
    };

    const calendarDays = getDaysInMonth(calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarMonth);
    const quickActions = getQuickActions();

    return (
        <aside className={`right-panel ${isOpen ? 'right-panel-open' : ''}`}>
            <div className="right-panel-inner">

                {/* ── User Profile Card ── */}
                <div className="rp-profile-card" onClick={() => navigate('/settings')}>
                    <div className="rp-avatar-ring">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563eb&color=fff&bold=true`}
                            alt="Avatar"
                        />
                        <span className="rp-online-dot"></span>
                    </div>
                    <div className="rp-user-info">
                        <h4 className="rp-user-name">{user?.name || 'User'}</h4>
                        <span className="rp-user-role">{user?.role === 'Admin' ? 'Super Admin' : user?.role || 'Employee'}</span>
                    </div>
                    <ArrowRight size={16} className="rp-profile-arrow" />
                </div>

                {/* ── Mini Calendar ── */}
                <div className="rp-section-card">
                    <div className="rp-cal-header">
                        <button className="rp-cal-nav" onClick={prevMonth}>
                            <ChevronLeft size={16} />
                        </button>
                        <span className="rp-cal-month">
                            {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                        </span>
                        <button className="rp-cal-nav" onClick={nextMonth}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="rp-cal-grid">
                        {dayLabels.map(d => (
                            <span key={d} className="rp-cal-day-label">{d}</span>
                        ))}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <span key={`empty-${i}`} className="rp-cal-empty"></span>
                        ))}
                        {Array.from({ length: calendarDays }).map((_, i) => (
                            <span
                                key={i + 1}
                                className={`rp-cal-day ${isToday(i + 1) ? 'rp-cal-today' : ''}`}
                            >
                                {i + 1}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="rp-section-card">
                    <h3 className="rp-section-title">
                        <Zap size={15} />
                        Quick Actions
                    </h3>
                    <div className="rp-actions-grid">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                className="rp-action-btn"
                                onClick={() => navigate(action.path)}
                            >
                                <span className="rp-action-icon" style={{ color: action.color, backgroundColor: `${action.color}15` }}>
                                    {action.icon}
                                </span>
                                <span className="rp-action-label">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Live Activity Feed ── */}
                <div className="rp-section-card rp-activity-card">
                    <div className="rp-section-header">
                        <h3 className="rp-section-title">
                            <Activity size={15} />
                            Activity
                        </h3>
                        <button className="rp-view-all" onClick={() => navigate('/notifications')}>
                            View All
                        </button>
                    </div>
                    <div className="rp-activity-list">
                        {notifications.length === 0 ? (
                            <div className="rp-empty-state">
                                <Bell size={24} className="rp-empty-icon" />
                                <span>No recent activity</span>
                            </div>
                        ) : (
                            notifications.map((n, idx) => {
                                const meta = getActivityMeta(n.type);
                                return (
                                    <div key={n._id || idx} className="rp-activity-item">
                                        <div className="rp-activity-dot" style={{ color: meta.color, backgroundColor: meta.bg }}>
                                            {meta.icon}
                                        </div>
                                        <div className="rp-activity-content">
                                            <p className="rp-activity-text">
                                                {n.title || n.message || 'Notification'}
                                            </p>
                                            <span className="rp-activity-time">
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── System Info Footer ── */}
                <div className="rp-sys-footer">
                    <div className="rp-sys-row">
                        <span className="rp-sys-label">System</span>
                        <span className="rp-sys-val">SMTBMS v1.0</span>
                    </div>
                    <div className="rp-sys-row">
                        <span className="rp-sys-label">Status</span>
                        <span className="rp-sys-online">
                            <span className="rp-sys-dot"></span>
                            All Systems Operational
                        </span>
                    </div>
                </div>

            </div>

            <style jsx="true">{`
                .right-panel {
                    width: var(--right-panel-width, 320px);
                    height: 100vh;
                    position: fixed;
                    right: 0;
                    top: 0;
                    background: var(--bg-card);
                    border-left: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    z-index: 990;
                    transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
                }

                .right-panel-inner {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .right-panel-inner::-webkit-scrollbar {
                    width: 4px;
                }
                .right-panel-inner::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                /* ── Profile Card ── */
                .rp-profile-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px;
                    background: var(--primary-light, #eef2ff);
                    border: 1px solid var(--primary-100, #e0e7ff);
                    border-radius: var(--radius-lg, 16px);
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                }
                .rp-profile-card:hover {
                    border-color: var(--primary);
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                }

                .rp-avatar-ring {
                    position: relative;
                    flex-shrink: 0;
                }
                .rp-avatar-ring img {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 2px solid #ffffff;
                    box-shadow: var(--shadow-sm);
                }
                .rp-online-dot {
                    position: absolute;
                    bottom: 1px;
                    right: 1px;
                    width: 10px;
                    height: 10px;
                    background: var(--success);
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    box-shadow: 0 0 6px var(--success);
                }

                .rp-user-info {
                    flex: 1;
                    min-width: 0;
                }
                .rp-user-name {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .rp-user-role {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .rp-profile-arrow {
                    color: var(--primary);
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                .rp-profile-card:hover .rp-profile-arrow {
                    transform: translateX(3px);
                }

                /* ── Section Cards ── */
                .rp-section-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 18px;
                    box-shadow: var(--shadow-xs);
                    transition: box-shadow 0.2s;
                }
                .rp-section-card:hover {
                    box-shadow: var(--shadow-sm);
                }

                .rp-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .rp-section-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 16px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .rp-section-header .rp-section-title {
                    margin-bottom: 0;
                }

                .rp-view-all {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: background 0.2s;
                }
                .rp-view-all:hover {
                    background: var(--primary-light);
                }

                /* ── Calendar ── */
                .rp-cal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .rp-cal-month {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .rp-cal-nav {
                    background: var(--bg-hover);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .rp-cal-nav:hover {
                    background: var(--primary-light);
                    color: var(--primary);
                    border-color: var(--primary-100);
                }

                .rp-cal-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                    text-align: center;
                }
                .rp-cal-day-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    padding: 4px 0;
                    letter-spacing: 0.5px;
                }
                .rp-cal-empty {
                    padding: 4px 0;
                }
                .rp-cal-day {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    padding: 6px 0;
                    border-radius: 8px;
                    cursor: default;
                    transition: all 0.15s;
                }
                .rp-cal-day:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }
                .rp-cal-today {
                    background: var(--primary) !important;
                    color: #ffffff !important;
                    font-weight: 700;
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
                }

                /* ── Quick Actions Grid ── */
                .rp-actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .rp-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }
                .rp-action-btn:hover {
                    background: #ffffff;
                    border-color: var(--primary-100);
                    box-shadow: var(--shadow-sm);
                    transform: translateY(-1px);
                }
                .rp-action-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.2s ease;
                }
                .rp-action-btn:hover .rp-action-icon {
                    transform: scale(1.08);
                }
                .rp-action-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                /* ── Activity Feed ── */
                .rp-activity-card {
                    flex: 1;
                    min-height: 0;
                }
                .rp-activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .rp-activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    padding: 10px;
                    border-radius: var(--radius-md, 12px);
                    transition: background 0.15s;
                    cursor: default;
                }
                .rp-activity-item:hover {
                    background: var(--bg-hover);
                }
                .rp-activity-dot {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .rp-activity-content {
                    flex: 1;
                    min-width: 0;
                }
                .rp-activity-text {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin: 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .rp-activity-time {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--text-muted);
                    margin-top: 4px;
                    display: inline-block;
                }

                .rp-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    padding: 30px 0;
                    color: var(--text-muted);
                    font-size: 13px;
                    font-weight: 500;
                }
                .rp-empty-icon {
                    opacity: 0.5;
                }

                /* ── System Footer ── */
                .rp-sys-footer {
                    padding: 16px 20px;
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .rp-sys-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .rp-sys-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                .rp-sys-val {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .rp-sys-online {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--success);
                }
                .rp-sys-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--success);
                    box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
                    animation: rp-pulse 2s ease-in-out infinite;
                }

                @keyframes rp-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* ── Responsive ── */
                @media (max-width: 1199px) {
                    .right-panel {
                        transform: translateX(100%);
                    }
                    .right-panel.right-panel-open {
                        transform: translateX(0);
                        box-shadow: var(--shadow-xl);
                    }
                }
            `}</style>
        </aside>
    );
};

export default RightPanel;
