import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import {
    Bell, BellOff, CheckCircle, AlertTriangle, Info, Package,
    Users, ShoppingCart, Settings, Trash2, Check, RefreshCw, Loader
} from 'lucide-react';

// Map category → icon component
const CATEGORY_ICONS = {
    stock:   <Package size={20} />,
    hr:      <Users size={20} />,
    order:   <ShoppingCart size={20} />,
    system:  <Settings size={20} />,
    general: <Bell size={20} />,
};

// Map type → accent color token
const TYPE_COLOR = {
    warning: '#f59e0b',
    info:    'var(--primary)',
    success: '#10b981',
    error:   '#ef4444',
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [loading, setLoading]             = useState(true);
    const [seeding, setSeeding]             = useState(false);
    const [filter, setFilter]               = useState('all'); // 'all' | 'unread' | 'read'
    const [toast, setToast]                 = useState(null); // { msg, ok }

    // ─── helpers ────────────────────────────────────────────────────────────
    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/notifications');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to load notifications.', false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // ─── actions ─────────────────────────────────────────────────────────────
    const handleMarkOne = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            showToast('Notification marked as read.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to mark as read.', false);
        }
    };

    const handleMarkAll = async () => {
        try {
            await API.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            showToast('All notifications marked as read.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to mark all as read.', false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/notifications/${id}`);
            const removed = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (removed && !removed.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            showToast('Notification deleted.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete.', false);
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

    // ─── derived list ────────────────────────────────────────────────────────
    const displayed = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read')   return n.isRead;
        return true;
    });

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1)  return 'Just now';
        if (m < 60) return `${m} min${m !== 1 ? 's' : ''} ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h} hour${h !== 1 ? 's' : ''} ago`;
        const d = Math.floor(h / 24);
        return `${d} day${d !== 1 ? 's' : ''} ago`;
    };

    // ─── render ──────────────────────────────────────────────────────────────
    return (
        <div className="module-container">

            {/* ── Toast ── */}
            {toast && (
                <div className={`n-toast ${toast.ok ? 'ok' : 'err'}`}>
                    {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">System Notifications</h1>
                    <p className="text-muted">
                        Stay updated with critical alerts and operational activities.
                        {unreadCount > 0 && (
                            <span className="unread-badge">{unreadCount} unread</span>
                        )}
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        id="btn-refresh-notifications"
                        className="n-action-btn"
                        onClick={handleSeed}
                        disabled={seeding}
                        title="Sync live notifications (Admin)"
                    >
                        {seeding
                            ? <Loader size={15} className="spin" />
                            : <RefreshCw size={15} />
                        }
                        Sync
                    </button>
                    {unreadCount > 0 && (
                        <button
                            id="btn-mark-all-read"
                            className="n-action-btn primary"
                            onClick={handleMarkAll}
                        >
                            <Check size={15} /> Mark all as read
                        </button>
                    )}
                </div>
            </header>

            {/* ── Filter Tabs ── */}
            <div className="n-filter-tabs">
                {['all', 'unread', 'read'].map(tab => (
                    <button
                        key={tab}
                        id={`tab-${tab}`}
                        className={`n-tab ${filter === tab ? 'active' : ''}`}
                        onClick={() => setFilter(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab === 'unread' && unreadCount > 0 && (
                            <span className="tab-badge">{unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── List ── */}
            {loading ? (
                <div className="n-loading">
                    <Loader size={32} className="spin" />
                    <p>Loading notifications…</p>
                </div>
            ) : displayed.length === 0 ? (
                <div className="n-empty glass-card">
                    <BellOff size={40} />
                    <p>
                        {filter === 'unread'
                            ? 'No unread notifications — you\'re all caught up!'
                            : 'No notifications yet.'}
                    </p>
                    {notifications.length === 0 && (
                        <button className="n-action-btn primary" onClick={handleSeed}>
                            <RefreshCw size={15} /> Load notifications
                        </button>
                    )}
                </div>
            ) : (
                <div className="notif-list">
                    {displayed.map((n) => (
                        <div
                            key={n._id}
                            id={`notif-${n._id}`}
                            className={`notif-card glass-card ${n.type} ${n.isRead ? 'read' : 'unread'}`}
                            style={{ '--accent': TYPE_COLOR[n.type] || 'var(--primary)' }}
                        >
                            {/* Unread dot */}
                            {!n.isRead && <span className="unread-dot" />}

                            <div className="n-icon-box">
                                {CATEGORY_ICONS[n.category] || <Bell size={20} />}
                            </div>

                            <div className="n-content">
                                <div className="n-meta">
                                    <h3>{n.title}</h3>
                                    <span className="time">{timeAgo(n.createdAt)}</span>
                                </div>
                                <p>{n.message}</p>
                            </div>

                            {/* Per-card actions */}
                            <div className="n-card-actions">
                                {!n.isRead && (
                                    <button
                                        id={`mark-read-${n._id}`}
                                        className="n-icon-btn read-btn"
                                        title="Mark as read"
                                        onClick={() => handleMarkOne(n._id)}
                                    >
                                        <CheckCircle size={17} />
                                    </button>
                                )}
                                <button
                                    id={`delete-${n._id}`}
                                    className="n-icon-btn del-btn"
                                    title="Delete notification"
                                    onClick={() => handleDelete(n._id)}
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                /* ── Layout ── */
                .module-container { padding: 30px; position: relative; }
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

                /* ── Unread badge in subtitle ── */
                .unread-badge {
                    display: inline-block;
                    margin-left: 10px;
                    background: var(--primary);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 9px;
                    border-radius: 20px;
                    vertical-align: middle;
                }

                /* ── Action buttons in header ── */
                .n-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .n-action-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .n-action-btn.primary {
                    background: rgba(99,102,241,0.15);
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .n-action-btn.primary:hover { background: var(--primary); color: #fff; }
                .n-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                /* ── Filter tabs ── */
                .n-filter-tabs {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 22px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 14px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                .n-tab {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    padding: 7px 18px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .n-tab:hover { background: rgba(255,255,255,0.06); color: #fff; }
                .n-tab.active {
                    background: rgba(99,102,241,0.15);
                    color: var(--primary);
                }
                .tab-badge {
                    background: var(--primary);
                    color: #fff;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 800;
                    padding: 1px 7px;
                    line-height: 1.6;
                }

                /* ── Notification list ── */
                .notif-list { display: flex; flex-direction: column; gap: 12px; }

                /* ── Individual card ── */
                .notif-card {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    padding: 18px 20px;
                    border-left: 4px solid var(--accent);
                    position: relative;
                    transition: transform 0.2s, opacity 0.2s, background 0.25s;
                    overflow: visible;
                }
                .notif-card:hover { transform: translateX(4px); }
                .notif-card.read { opacity: 0.55; }
                .notif-card.read:hover { opacity: 0.85; }

                /* ── Unread dot ── */
                .unread-dot {
                    position: absolute;
                    top: 18px;
                    right: 18px;
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                    background: var(--accent);
                    box-shadow: 0 0 6px var(--accent);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.5; transform: scale(1.4); }
                }

                /* ── Icon box ── */
                .n-icon-box {
                    flex-shrink: 0;
                    width: 46px;
                    height: 46px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent);
                }

                /* ── Content ── */
                .n-content { flex: 1; min-width: 0; }
                .n-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                    gap: 12px;
                }
                .n-meta h3 { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .time { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
                .n-content p { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

                /* ── Per-card action buttons ── */
                .n-card-actions {
                    display: flex;
                    gap: 6px;
                    flex-shrink: 0;
                    transition: opacity 0.2s;
                }
                .notif-card:hover .n-card-actions { opacity: 1; }
                .n-icon-btn {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.18s;
                }
                .n-icon-btn.read-btn { color: #10b981; }
                .n-icon-btn.read-btn:hover { background: rgba(16,185,129,0.2); border-color: #10b981; }
                .n-icon-btn.del-btn  { color: var(--text-muted); }
                .n-icon-btn.del-btn:hover  { background: rgba(239,68,68,0.18); border-color: #ef4444; color: #ef4444; }

                /* ── Loading / empty states ── */
                .n-loading, .n-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 60px 20px;
                    color: var(--text-muted);
                    text-align: center;
                }
                .n-empty { border-radius: 16px; }

                /* ── Spinner ── */
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── Toast ── */
                .n-toast {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    z-index: 9999;
                    animation: slideUp 0.3s ease-out;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                }
                .n-toast.ok  { background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; }
                .n-toast.err { background: rgba(239,68,68,0.15);  border: 1px solid #ef4444; color: #ef4444; }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .module-header { flex-direction: column; align-items: flex-start; }
                    .header-actions { width: 100%; flex-direction: column; }
                    .n-action-btn { width: 100%; justify-content: center; }
                    .n-tab { flex: 1; justify-content: center; }
                    .notif-card { padding: 15px; gap: 12px; }
                    .n-icon-box { width: 40px; height: 40px; }
                    .n-meta { flex-direction: column; align-items: flex-start; gap: 4px; }
                    .n-card-actions { opacity: 1; }
                    .n-toast { left: 20px; right: 20px; bottom: 20px; }
                }
            `}</style>
        </div>
    );
};

export default NotificationsPage;
