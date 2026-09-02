import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import {
    Search, MessageSquare, Send, Paperclip, AlertCircle,
    Clock, CheckCircle2, Activity, ChevronDown, X,
    RefreshCw, Plus, Lock, ArrowRight, Inbox, User, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { StatsCard, StatsGrid } from '../components/ui/StatsCard';
import './AdminTickets.css';

/* ─── Pill Dropdown ─── */
const PillDropdown = ({ value, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const dotClass = (val) => {
        const map = {
            'open': 'open', 'in-progress': 'in-progress', 'resolved': 'resolved',
            'closed': 'closed', 'waiting-for-user': 'waiting',
            'low': 'low', 'medium': 'medium', 'high': 'high',
            'critical': 'critical', 'urgent': 'critical',
        };
        return map[(val || '').toLowerCase().replace(/ /g, '-')] || 'low';
    };

    return (
        <div className="at-pill-dropdown" ref={ref}>
            <button type="button" className="at-pill-btn" onClick={() => setOpen(o => !o)}>
                <span className={`at-pill-dot ${dotClass(value)}`} />
                {value}
                <ChevronDown size={10} />
            </button>
            {open && (
                <div className="at-dropdown-menu">
                    {options.map(opt => (
                        <div key={opt} className="at-dropdown-item"
                            onClick={() => { onChange(opt); setOpen(false); }}>
                            <span className={`at-pill-dot ${dotClass(opt)}`} />
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Badge class helpers ─── */
const sBadge = (s) => ({ 'Open': 'open', 'In Progress': 'in-progress', 'Waiting for User': 'waiting', 'Resolved': 'resolved', 'Closed': 'closed' }[s] || 'default');
const pBadge = (p) => ({ 'Critical': 'critical', 'High': 'high', 'Medium': 'medium', 'Low': 'low' }[p] || 'default');
const sHeader = (s) => ({ 'Open': 'status-open', 'In Progress': 'status-in-progress', 'Resolved': 'status-resolved', 'Closed': 'status-closed', 'Waiting for User': 'status-waiting' }[s] || '');

const initials = (name) => (name || 'U').trim().split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase();
const fmt = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtT = (d) => d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/* ─── Skeleton ─── */
const Skeleton = () => (
    <>
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="at-skeleton-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div className="at-skeleton-line short" style={{ marginBottom: 0 }} />
                    <div className="at-skeleton-line" style={{ width: 60, height: 9, marginBottom: 0 }} />
                </div>
                <div className="at-skeleton-line wide" />
                <div className="at-skeleton-line medium" />
                <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
                    <div className="at-skeleton-line" style={{ width: 44, height: 14, borderRadius: 8, marginBottom: 0 }} />
                    <div className="at-skeleton-line" style={{ width: 44, height: 14, borderRadius: 8, marginBottom: 0 }} />
                </div>
            </div>
        ))}
    </>
);

/* ─── Main Component ─── */
const AdminTickets = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const [replyText, setReplyText] = useState('');
    const [isNote, setIsNote] = useState(false);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState('conversation');
    const [attachedFile, setAttachedFile] = useState(null); // { name, dataUrl }

    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    /* Stats */
    const stats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open' || t.status === 'Waiting for User').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
        critical: tickets.filter(t => t.priority === 'Critical').length,
    }), [tickets]);

    const categories = useMemo(() =>
        [...new Set(tickets.map(t => t.category).filter(Boolean))],
        [tickets]
    );

    /* Fetch */
    const fetchTickets = async () => {
        setLoading(true); setLoadError(false);
        try {
            const res = await api.get('/tickets');
            setTickets(res.data);
        } catch {
            setLoadError(true);
            toast.error('Unable to load tickets');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchTickets(); }, []);

    /* Select ticket */
    const selectTicket = async (ticket) => {
        setSelectedTicket(ticket);
        setActiveTab('conversation');
        setDetailLoading(true);
        setMessages([]);
        try {
            const res = await api.get(`/tickets/${ticket._id || ticket.id}`);
            setMessages(res.data.messages || []);
        } catch {
            toast.error('Unable to load ticket details');
        } finally {
            setDetailLoading(false);
        }
    };

    /* Auto-scroll conversation to bottom */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* Status update */
    const updateStatus = async (newStatus) => {
        const prev = { ...selectedTicket };
        setSelectedTicket(t => ({ ...t, status: newStatus }));
        setTickets(ts => ts.map(t => (t._id === prev._id || t.id === prev.id) ? { ...t, status: newStatus } : t));
        try {
            await api.put(`/tickets/${prev._id || prev.id}`, { status: newStatus });
            toast.success(`Status → ${newStatus}`);
        } catch {
            setSelectedTicket(prev);
            setTickets(ts => ts.map(t => (t._id === prev._id || t.id === prev.id) ? prev : t));
            toast.error('Failed to update status');
        }
    };

    /* Priority update */
    const updatePriority = async (newPriority) => {
        const prev = { ...selectedTicket };
        setSelectedTicket(t => ({ ...t, priority: newPriority }));
        setTickets(ts => ts.map(t => (t._id === prev._id || t.id === prev.id) ? { ...t, priority: newPriority } : t));
        try {
            await api.put(`/tickets/${prev._id || prev.id}`, { priority: newPriority });
            toast.success(`Priority → ${newPriority}`);
        } catch {
            setSelectedTicket(prev);
            setTickets(ts => ts.map(t => (t._id === prev._id || t.id === prev.id) ? prev : t));
            toast.error('Failed to update priority');
        }
    };

    /* Attach file — read as base64 data URL */
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return; }
        const reader = new FileReader();
        reader.onload = () => setAttachedFile({ name: file.name, dataUrl: reader.result });
        reader.readAsDataURL(file);
        // Reset so same file can be selected again
        e.target.value = '';
    };

    /* Send reply or note */
    const handleSend = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;
        setSending(true);
        try {
            const res = await api.post(`/tickets/${selectedTicket._id || selectedTicket.id}/messages`, {
                message: replyText,
                isInternal: isNote,
                attachment: attachedFile?.dataUrl || null,
            });
            setMessages(m => [...m, res.data]);
            setReplyText('');
            setAttachedFile(null);
            toast.success(isNote ? 'Internal note saved' : 'Reply sent');
            if (!isNote && selectedTicket.status === 'Open') updateStatus('In Progress');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    /* Filtered list */
    const filteredTickets = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return tickets
            .filter(t => {
                const mQ = !q || (t.ticketNumber || '').toLowerCase().includes(q) || (t.subject || '').toLowerCase().includes(q) || (t.submittedBy?.name || '').toLowerCase().includes(q);
                const mS = statusFilter === 'All' || t.status === statusFilter;
                const mP = priorityFilter === 'All' || t.priority === priorityFilter;
                const mC = categoryFilter === 'All' || t.category === categoryFilter;
                return mQ && mS && mP && mC;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

    const filtersActive = searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All';
    const clearFilters = () => { setSearchQuery(''); setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All'); };

    const selId = selectedTicket?._id || selectedTicket?.id;

    /* ── Render ── */
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
            className="at-page"
        >
            {/* ── Fixed Top Area: Header + Stats ── */}
            <div className="at-top-area">
                {/* Page header */}
                <PageHeader
                    title="Support Management"
                    badge="ADMIN"
                    subtitle="Centralized dashboard to manage all user complaints and requests."
                    actions={[{
                        label: 'Create Ticket',
                        icon: Plus,
                        primary: true,
                        onClick: () => navigate('/support'),
                    }]}
                />

                {/* Stats */}
                <StatsGrid columns={5} style={{ marginBottom: '16px' }}>
                    <StatsCard
                        title="Total Tickets"
                        value={loading ? '—' : stats.total}
                        icon={Inbox}
                        colorTheme="blue"
                        subtext="All tickets"
                    />
                    <StatsCard
                        title="Open"
                        value={loading ? '—' : stats.open}
                        icon={Activity}
                        colorTheme="amber"
                        trendPositive={false}
                        subtext="Needs attention"
                    />
                    <StatsCard
                        title="In Progress"
                        value={loading ? '—' : stats.inProgress}
                        icon={Clock}
                        colorTheme="teal"
                        trendPositive={true}
                        subtext="Being worked on"
                    />
                    <StatsCard
                        title="Resolved"
                        value={loading ? '—' : stats.resolved}
                        icon={CheckCircle2}
                        colorTheme="green"
                        trendPositive={true}
                        subtext="Completed"
                    />
                    <StatsCard
                        title="Critical"
                        value={loading ? '—' : stats.critical}
                        icon={AlertCircle}
                        colorTheme="red"
                        trendPositive={false}
                        subtext="High severity"
                    />
                </StatsGrid>
            </div>

            {/* ── Main Workspace ── */}
            <div className="at-workspace">

                {/* ── Left: Ticket List ── */}
                <div className="at-list-panel">
                    {/* Toolbar */}
                    <div className="at-list-toolbar">
                        <div className="at-toolbar-title-row">
                            <h2 className="at-toolbar-title">Tickets</h2>
                            <span className="at-toolbar-count">{loading ? '…' : filteredTickets.length}</span>
                        </div>
                        <div className="at-search-wrap">
                            <span className="at-search-icon"><Search size={13} /></span>
                            <input
                                className="at-search-input"
                                type="text"
                                placeholder="Search tickets, ID or user..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="at-filters-row">
                            <select className="at-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="All">Status: All</option>
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Waiting for User</option>
                                <option>Resolved</option>
                                <option>Closed</option>
                            </select>
                            <select className="at-filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                                <option value="All">Priority: All</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                            {categories.length > 0 && (
                                <select className="at-filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                                    <option value="All">Category: All</option>
                                    {categories.map(c => <option key={c}>{c}</option>)}
                                </select>
                            )}
                            {filtersActive && (
                                <button className="at-clear-btn" onClick={clearFilters}>
                                    <X size={10} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Ticket count */}
                    <div className="at-ticket-count">
                        {loading ? 'Loading…' : `${filteredTickets.length} ticket${filteredTickets.length !== 1 ? 's' : ''}`}
                    </div>

                    {/* Ticket list */}
                    <div className="at-ticket-list">
                        {loading ? <Skeleton /> : loadError ? (
                            <div className="at-list-state">
                                <div className="at-list-state-icon"><AlertCircle size={26} /></div>
                                <p className="at-list-state-title">Could not load tickets</p>
                                <p className="at-list-state-sub">Check your connection and try again.</p>
                                <button className="at-retry-btn" style={{ marginTop: 10 }} onClick={fetchTickets}>
                                    <RefreshCw size={12} /> Retry
                                </button>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="at-list-state">
                                <div className="at-list-state-icon"><Search size={24} /></div>
                                <p className="at-list-state-title">No tickets found</p>
                                <p className="at-list-state-sub">Try adjusting search or filter criteria.</p>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => {
                                const tid = ticket._id || ticket.id;
                                const active = tid === selId;
                                return (
                                    <div
                                        key={tid}
                                        className={`at-ticket-row${active ? ' active' : ''}`}
                                        onClick={() => selectTicket(ticket)}
                                    >
                                        <div className="at-ticket-row-top">
                                            <span className="at-ticket-id">{ticket.ticketNumber || `#${tid?.slice(-6)}`}</span>
                                            <span className="at-ticket-date">{fmt(ticket.createdAt)}</span>
                                        </div>
                                        <p className="at-ticket-subject" title={ticket.subject}>{ticket.subject}</p>
                                        <div className="at-ticket-user">
                                            <User size={11} /> {ticket.submittedBy?.name || 'Unknown User'}
                                        </div>
                                        <div className="at-ticket-badges">
                                            <span className={`at-badge ${sBadge(ticket.status)}`}>{ticket.status}</span>
                                            <span className={`at-badge ${pBadge(ticket.priority)}`}>{ticket.priority}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── Right: Ticket Detail ── */}
                <div className="at-detail-panel">
                    {!selectedTicket ? (
                        /* Empty state */
                        <div className="at-empty-state">
                            <div className="at-empty-icon-wrap">
                                <MessageSquare size={30} />
                            </div>
                            <h3 className="at-empty-title">Select a ticket</h3>
                            <p className="at-empty-subtitle">
                                Choose a ticket from the left panel to view its details, conversation, and available actions.
                            </p>
                            <span className="at-empty-hint">
                                <ArrowRight size={12} /> Select a ticket from the left panel to get started
                            </span>
                        </div>
                    ) : (
                        <>
                            {/* ── Detail Header ── */}
                            <div className={`at-detail-header ${sHeader(selectedTicket.status)}`}>
                                <div className="at-detail-header-top">
                                    <div className="at-detail-header-left">
                                        <h2 className="at-detail-subject">{selectedTicket.subject}</h2>
                                        <div className="at-detail-meta-row">
                                            <strong>{selectedTicket.ticketNumber}</strong>
                                            {selectedTicket.category && (
                                                <><span className="at-meta-sep">·</span>{selectedTicket.category}</>
                                            )}
                                            <span className="at-meta-sep">·</span>
                                            {fmtT(selectedTicket.createdAt)}
                                        </div>
                                        <div className="at-detail-submitter">
                                            <div className="at-submitter-avatar">{initials(selectedTicket.submittedBy?.name)}</div>
                                            <div className="at-submitter-info">
                                                <span className="at-submitter-name">{selectedTicket.submittedBy?.name || 'Unknown'}</span>
                                                <span className="at-submitter-sep">·</span>
                                                <span className="at-submitter-role">{selectedTicket.submittedBy?.role || 'User'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="at-detail-actions">
                                        <PillDropdown
                                            value={selectedTicket.status}
                                            options={['Open', 'In Progress', 'Waiting for User', 'Resolved', 'Closed']}
                                            onChange={updateStatus}
                                        />
                                        <PillDropdown
                                            value={selectedTicket.priority}
                                            options={['Low', 'Medium', 'High', 'Critical']}
                                            onChange={updatePriority}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Tabs ── */}
                            <div className="at-tabs">
                                {['conversation', 'details', 'attachments', 'history'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`at-tab${activeTab === tab ? ' active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* ── Conversation Tab ── */}
                            {activeTab === 'conversation' && (
                                <>
                                    <div className="at-conversation">
                                        {detailLoading ? (
                                            <div className="at-conv-loading">
                                                <div className="at-spinner" />
                                                Loading conversation…
                                            </div>
                                        ) : (
                                            <>
                                                {/* Original issue */}
                                                <div className="at-message from-user">
                                                    <div className="at-msg-avatar user-avatar">
                                                        {initials(selectedTicket.submittedBy?.name)}
                                                    </div>
                                                    <div className="at-msg-bubble user-bubble">
                                                        <div className="at-msg-header">
                                                            <div className="at-msg-sender">
                                                                <span className="at-msg-name">{selectedTicket.submittedBy?.name || 'User'}</span>
                                                                <span className="at-msg-role">{selectedTicket.submittedBy?.role || 'User'}</span>
                                                            </div>
                                                            <span className="at-msg-time">{fmtT(selectedTicket.createdAt)}</span>
                                                        </div>
                                                        <div className="at-msg-body">{selectedTicket.description || 'No description provided.'}</div>
                                                        {selectedTicket.attachment && (
                                                            <div className="at-msg-attachment">
                                                                <Paperclip size={12} />
                                                                <a href={selectedTicket.attachment} target="_blank" rel="noreferrer">View Attachment</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Replies */}
                                                {messages.map((msg, idx) => {
                                                    const isAdmin = ['Admin', 'Manager', 'HR', 'admin', 'manager', 'hr'].includes(msg.sender?.role);
                                                    const msgClass = msg.isInternal ? 'internal' : (isAdmin ? 'from-admin' : 'from-user');
                                                    const bubbleClass = msg.isInternal ? 'note-bubble' : (isAdmin ? 'admin-bubble' : 'user-bubble');
                                                    const avatarClass = msg.isInternal ? 'note-avatar' : (isAdmin ? 'admin-avatar' : 'user-avatar');
                                                    const roleClass = msg.isInternal ? 'note-role' : (isAdmin ? 'admin-role' : '');
                                                    return (
                                                        <div key={idx} className={`at-message ${msgClass}`}>
                                                            <div className={`at-msg-avatar ${avatarClass}`}>
                                                                {initials(msg.sender?.name)}
                                                            </div>
                                                            <div className={`at-msg-bubble ${bubbleClass}`}>
                                                                {msg.isInternal && (
                                                                    <div className="at-internal-label">
                                                                        <Lock size={8} /> Internal Note
                                                                    </div>
                                                                )}
                                                                <div className="at-msg-header">
                                                                    <div className="at-msg-sender">
                                                                        <span className="at-msg-name">{msg.sender?.name || 'Unknown'}</span>
                                                                        <span className={`at-msg-role ${roleClass}`}>
                                                                            {msg.isInternal ? 'Internal' : (msg.sender?.role || 'User')}
                                                                        </span>
                                                                    </div>
                                                                    <span className="at-msg-time">{fmtT(msg.createdAt)}</span>
                                                                </div>
                                                                <div className="at-msg-body">{msg.message}</div>
                                                                {msg.attachment && (
                                                                    <div className="at-msg-attachment">
                                                                        <Paperclip size={12} />
                                                                        <a href={msg.attachment} target="_blank" rel="noreferrer">View Attachment</a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div ref={bottomRef} />
                                            </>
                                        )}
                                    </div>

                                    {/* ── Reply Composer (compact, anchored at bottom) ── */}
                                    <form className="at-composer" onSubmit={handleSend}>
                                        <div className="at-composer-tabs">
                                            <button type="button" className={`at-composer-tab${!isNote ? ' active' : ''}`} onClick={() => setIsNote(false)}>
                                                Reply to User
                                            </button>
                                            <button type="button" className={`at-composer-tab${isNote ? ' note-active' : ''}`} onClick={() => setIsNote(true)}>
                                                <Lock size={10} /> Internal Note
                                            </button>
                                        </div>
                                        <div className={`at-composer-body${isNote ? ' is-note' : ''}`}>
                                            {isNote && (
                                                <div className="at-note-hint">
                                                    <Lock size={10} /> Only admins can see this note
                                                </div>
                                            )}
                                            <textarea
                                                className="at-composer-field"
                                                placeholder={isNote ? 'Add a private note for your team…' : 'Write your message here…'}
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                            />
                                            <div className="at-composer-actions">
                                                <div className="at-composer-left">
                                                    {/* Hidden file input */}
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                        style={{ display: 'none' }}
                                                        onChange={handleFileChange}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={`at-icon-btn${attachedFile ? ' has-attachment' : ''}`}
                                                        title="Attach file"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <Paperclip size={13} />
                                                    </button>
                                                    {attachedFile && (
                                                        <div className="at-file-chip">
                                                            <FileText size={10} />
                                                            <span className="at-file-chip-name" title={attachedFile.name}>{attachedFile.name}</span>
                                                            <button
                                                                type="button"
                                                                className="at-file-chip-remove"
                                                                onClick={() => setAttachedFile(null)}
                                                                title="Remove attachment"
                                                            >
                                                                <X size={9} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="submit"
                                                    className={`at-send-btn${isNote ? ' note-btn' : ''}`}
                                                    disabled={!replyText.trim() || sending}
                                                >
                                                    {sending
                                                        ? <><RefreshCw size={12} style={{ animation: 'at-spin 0.65s linear infinite' }} /> Sending…</>
                                                        : <><Send size={12} /> {isNote ? 'Save Note' : 'Send Reply'}</>
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </>
                            )}

                            {/* ── Details Tab ── */}
                            {activeTab === 'details' && (
                                <div className="at-details-tab">
                                    <p className="at-info-section-title">Ticket Information</p>
                                    <div className="at-info-grid">
                                        {[
                                            { label: 'Ticket ID', value: selectedTicket.ticketNumber || '—' },
                                            { label: 'Category', value: selectedTicket.category || '—' },
                                            { label: 'Submitted By', value: selectedTicket.submittedBy?.name || '—' },
                                            { label: 'Role', value: selectedTicket.submittedBy?.role || '—' },
                                            { label: 'Department', value: selectedTicket.submittedBy?.department || '—' },
                                            { label: 'Assigned To', value: selectedTicket.assignedTo?.name || 'Unassigned' },
                                            { label: 'Status', value: selectedTicket.status || '—' },
                                            { label: 'Priority', value: selectedTicket.priority || '—' },
                                            { label: 'Created', value: fmtT(selectedTicket.createdAt) },
                                            { label: 'Last Updated', value: fmtT(selectedTicket.updatedAt) },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="at-info-item">
                                                <span className="at-info-label">{label}</span>
                                                <span className="at-info-value">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Attachments Tab ── */}
                            {activeTab === 'attachments' && (
                                <div className="at-attachments-tab">
                                    <p className="at-info-section-title">Attachments</p>
                                    {selectedTicket.attachment ? (
                                        <div className="at-attachment-row">
                                            <div className="at-attachment-icon"><FileText size={20} /></div>
                                            <div className="at-attachment-info">
                                                <div className="at-attachment-name">Ticket Attachment</div>
                                                <a className="at-attachment-link" href={selectedTicket.attachment} target="_blank" rel="noreferrer">
                                                    View file
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="at-list-state" style={{ paddingTop: 40 }}>
                                            <div className="at-list-state-icon"><Paperclip size={26} /></div>
                                            <p className="at-list-state-title">No attachments</p>
                                            <p className="at-list-state-sub">No files have been attached to this ticket.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── History Tab ── */}
                            {activeTab === 'history' && (
                                <div className="at-history-tab">
                                    <p className="at-info-section-title">Activity Timeline</p>
                                    <div className="at-history-event">
                                        <div className="at-history-dot" />
                                        <div className="at-history-body">
                                            <div className="at-history-label">Ticket created by {selectedTicket.submittedBy?.name || 'Unknown'}</div>
                                            <div className="at-history-time">{fmtT(selectedTicket.createdAt)}</div>
                                        </div>
                                    </div>
                                    {messages.length > 0 && messages.map((msg, i) => (
                                        <div key={i} className="at-history-event">
                                            <div className="at-history-dot" style={{ background: msg.isInternal ? '#f59e0b' : '#2563eb', borderColor: msg.isInternal ? '#fde68a' : '#bfdbfe' }} />
                                            <div className="at-history-body">
                                                <div className="at-history-label">
                                                    {msg.isInternal
                                                        ? `Internal note added by ${msg.sender?.name || 'Admin'}`
                                                        : `Reply from ${msg.sender?.name || 'Unknown'}`}
                                                </div>
                                                <div className="at-history-time">{fmtT(msg.createdAt)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AdminTickets;
