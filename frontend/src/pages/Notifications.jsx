import React, { useState, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Bell, BellOff, CheckCircle, AlertTriangle, Info, Package,
    Users, ShoppingCart, Settings, Trash2, Check, RefreshCw, Loader,
    Search, Eye, AlertCircle, Clock, Zap, Filter, ChevronDown,
    DollarSign, Calendar, Briefcase, Shield
} from 'lucide-react';

// Map category → icon component & colors
// Map module → icon component & colors
const CATEGORY_CONFIG = {
    'Materials':      { icon: Package,       bg: '#f3e8ff', color: '#9333ea', label: 'Materials' },
    'Employees':      { icon: Users,         bg: '#ecfdf5', color: '#10b981', label: 'Employees' },
    'Orders':         { icon: ShoppingCart,  bg: '#eff6ff', color: '#3b82f6', label: 'Orders' },
    'system':         { icon: Settings,      bg: '#f8fafc', color: '#64748b', label: 'System' },
    'Payroll':        { icon: DollarSign,    bg: '#fef3c7', color: '#d97706', label: 'Payroll' },
    'Attendance':     { icon: Calendar,      bg: '#f0fdf4', color: '#16a34a', label: 'Attendance' },
    'Vendors':        { icon: Briefcase,     bg: '#eff6ff', color: '#3b82f6', label: 'Vendors' },
    'Customers':      { icon: Users,         bg: '#f1f5f9', color: '#475569', label: 'Customers' },
    'Leave Requests': { icon: Clock,         bg: '#fef3c7', color: '#d97706', label: 'Leave' },
    'Tickets':        { icon: Settings,      bg: '#f8fafc', color: '#64748b', label: 'Tickets' },
    'Tasks':          { icon: CheckCircle,   bg: '#ecfdf5', color: '#10b981', label: 'Tasks' },
};

// Map type → priority styling
const TYPE_STYLES = {
    error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', badge: 'Critical', badgeBg: '#fef2f2', badgeColor: '#dc2626' },
    warning: { bg: '#fffbeb', border: '#fed7aa', color: '#d97706', badge: 'Warning',  badgeBg: '#fffbeb', badgeColor: '#d97706' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', badge: 'Success',  badgeBg: '#f0fdf4', badgeColor: '#16a34a' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb', badge: 'Info',     badgeBg: '#eff6ff', badgeColor: '#2563eb' },
};

const NotificationsPage = () => {
    const { user } = useContext(AuthContext);
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useContext(NotificationContext);
    
    const [seeding, setSeeding]   = useState(false);
    const [filter, setFilter]     = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast]       = useState(null);
    const navigate                = useNavigate();

    // ─── helpers ────────────────────────────────────────────────────────────
    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    // ─── actions ─────────────────────────────────────────────────────────────
    const handleMarkOne = async (id) => {
        try {
            await markAsRead(id);
            showToast('Notification marked as read.');
        } catch (err) {
            showToast('Failed to mark as read.', false);
        }
    };

    const handleMarkAll = async () => {
        try {
            await markAllAsRead();
            showToast('All notifications marked as read.');
        } catch (err) {
            showToast('Failed to mark all as read.', false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            showToast('Notification deleted.');
        } catch (err) {
            showToast('Failed to delete.', false);
        }
    };

    const handleSeed = async () => {
        try {
            setSeeding(true);
            await API.post('/notifications/seed');
            await fetchNotifications();
            showToast('Notifications refreshed from live data.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Seed failed (Admin only).', false);
        } finally {
            setSeeding(false);
        }
    };

    const handleNotificationClick = (n) => {
        if (n.status === 'unread') handleMarkOne(n._id);
        if (n.module === 'Orders' && n.referenceId) {
            navigate('/erp?highlightOrder=' + n.referenceId);
        } else if (n.link) {
            navigate(n.link);
        }
    };

    // ─── derived data ────────────────────────────────────────────────────────
    const readCount = notifications.filter(n => n.status === 'read').length;
    const criticalCount = notifications.filter(n => n.type === 'error').length;

    const displayed = notifications
        .filter(n => {
            if (filter === 'unread') return n.status === 'unread';
            if (filter === 'read')   return n.status === 'read';
            if (['Payroll', 'Attendance', 'Orders', 'Materials', 'Employees', 'Tasks'].includes(filter)) return n.module === filter;
            return true;
        })
        .filter(n => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q));
        });

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1)  return 'Just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24);
        return `${d}d ago`;
    };

    const canAdmin = user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'HR';

    const filterTabs = [
        { key: 'all', label: 'All', count: notifications.length },
        { key: 'unread', label: 'Unread', count: unreadCount },
        { key: 'read', label: 'Read', count: readCount },
        { key: 'Payroll', label: 'Payroll' },
        { key: 'Attendance', label: 'Attendance' },
        { key: 'Orders', label: 'Orders' },
        { key: 'Materials', label: 'Materials' },
        { key: 'Tasks', label: 'Tasks' },
    ];

    // ─── render ──────────────────────────────────────────────────────────────
    return (
        <div className="main-content" style={{ paddingBottom: '40px' }}>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: toast.ok ? '#10b981' : '#ef4444', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
                    {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* ===== HEADER ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Notification Center</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Manage alerts, updates, and system notifications</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {canAdmin && (
                        <button onClick={handleSeed} disabled={seeding}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: seeding ? 'not-allowed' : 'pointer', opacity: seeding ? 0.6 : 1, transition: 'all 0.2s' }}>
                            {seeding ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                            Sync
                        </button>
                    )}
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAll}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid #3b82f6', background: '#eff6ff', fontSize: '13px', fontWeight: 600, color: '#3b82f6', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <CheckCircle size={14} /> Mark All Read
                        </button>
                    )}
                </div>
            </div>

            {/* ===== KPI STATS ROW ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                {[
                    { label: 'Total', value: notifications.length, icon: Bell, iconBg: '#f1f5f9', iconColor: '#475569' },
                    { label: 'Unread', value: unreadCount, icon: Clock, iconBg: '#eff6ff', iconColor: '#3b82f6' },
                    { label: 'Read', value: readCount, icon: CheckCircle, iconBg: '#ecfdf5', iconColor: '#10b981' },
                    { label: 'Critical', value: criticalCount, icon: AlertCircle, iconBg: '#fef2f2', iconColor: '#dc2626' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bento-card" style={{ borderRadius: '14px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: kpi.iconBg, color: kpi.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <kpi.icon size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{kpi.label}</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{kpi.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== SEARCH + FILTER BAR ===== */}
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 16px', width: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <Search size={16} color="#64748b" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: '#0f172a', width: '100%' }}
                    />
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                        {displayed.length} result{displayed.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                                borderColor: filter === tab.key ? '#3b82f6' : '#e2e8f0',
                                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                whiteSpace: 'nowrap', transition: 'all 0.2s',
                                background: filter === tab.key ? '#eff6ff' : '#fff',
                                color: filter === tab.key ? '#2563eb' : '#64748b',
                            }}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span style={{
                                    fontSize: '11px', fontWeight: 800, padding: '2px 6px',
                                    borderRadius: '10px', lineHeight: 1,
                                    background: filter === tab.key ? '#3b82f6' : '#f1f5f9',
                                    color: filter === tab.key ? '#fff' : '#64748b',
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ===== NOTIFICATION LIST ===== */}
            {displayed.length === 0 ? (
                <div className="bento-card" style={{ borderRadius: '14px', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#94a3b8', textAlign: 'center' }}>
                    <BellOff size={36} />
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#64748b' }}>
                            {filter === 'unread' ? 'All caught up!' : searchQuery ? 'No results found' : 'No notifications yet'}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px' }}>
                            {filter === 'unread' ? 'You have no unread notifications.' : searchQuery ? 'Try a different search term.' : 'Notifications will appear here as events occur.'}
                        </p>
                    </div>
                    {notifications.length === 0 && canAdmin && (
                        <button onClick={handleSeed}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '10px', border: '1px solid #3b82f6', background: '#eff6ff', fontSize: '13px', fontWeight: 600, color: '#3b82f6', cursor: 'pointer', marginTop: '8px' }}>
                            <RefreshCw size={14} /> Load Notifications
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {displayed.map((n) => {
                        const catConfig = CATEGORY_CONFIG[n.module] || CATEGORY_CONFIG.system;
                        const typeStyle = TYPE_STYLES[n.type] || TYPE_STYLES.info;
                        const CatIcon = catConfig.icon;

                        return (
                            <div
                                key={n._id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '14px 18px', borderRadius: '12px',
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderLeft: `4px solid ${typeStyle.color}`,
                                    minHeight: '76px',
                                    opacity: n.status === 'read' ? 0.6 : 1,
                                    transition: 'all 0.2s ease',
                                    cursor: (n.module === 'Orders' || n.link) ? 'pointer' : 'default',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = n.status === 'read' ? '0.6' : '1'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                                {/* Category Icon */}
                                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: catConfig.bg, color: catConfig.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <CatIcon size={20} strokeWidth={2.25} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }} onClick={() => handleNotificationClick(n)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</span>
                                        {/* Priority Badge */}
                                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', background: typeStyle.badgeBg, color: typeStyle.badgeColor, flexShrink: 0 }}>
                                            {typeStyle.badge}
                                        </span>
                                        {/* Unread Indicator */}
                                        {n.status === 'unread' && (
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeStyle.color, flexShrink: 0, boxShadow: `0 0 6px ${typeStyle.color}40`, marginLeft: 'auto' }}></span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                        <span style={{ fontSize: '13px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{n.message}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>
                                            <Clock size={12} /> {timeAgo(n.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                                    {n.status === 'unread' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMarkOne(n._id); }}
                                            title="Mark Read"
                                            style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#10b981', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.borderColor = '#10b981'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                        >
                                            <CheckCircle size={17} strokeWidth={2.25} />
                                        </button>
                                    )}
                                    {(n.module === 'Orders' || n.link) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleNotificationClick(n); }}
                                            title="View Details"
                                            style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b82f6', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                        >
                                            <Eye size={17} strokeWidth={2.25} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                                        title="Delete"
                                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                                    >
                                        <Trash2 size={17} strokeWidth={2.25} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Keyframe for spinner */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default NotificationsPage;
