import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';
import { Search, Filter, MessageSquare, Send, Paperclip, AlertCircle, Clock, CheckCircle2, User, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminTickets.css';

const AdminTickets = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isInternalNote, setIsInternalNote] = useState(false);

    // Stats
    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open' || t.status === 'Waiting for User').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
        critical: tickets.filter(t => t.priority === 'Critical').length
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/tickets');
            setTickets(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load tickets", error);
            setLoading(false);
        }
    };

    const handleSelectTicket = async (ticket) => {
        setSelectedTicket(ticket);
        try {
            const res = await api.get(`/tickets/${ticket._id || ticket.id}`);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await api.post(`/tickets/${selectedTicket._id || selectedTicket.id}/messages`, {
                message: newMessage,
                isInternal: isInternalNote
            });
            setMessages([...messages, res.data]);
            setNewMessage("");
            setIsInternalNote(false);
            toast.success(isInternalNote ? "Internal note added!" : "Reply sent to user!");
            
            // Auto change status if replying to user and ticket is open
            if(!isInternalNote && selectedTicket.status === 'Open') {
                updateStatus('In Progress');
            }
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            await api.put(`/tickets/${selectedTicket._id || selectedTicket.id}`, { status: newStatus });
            setSelectedTicket({...selectedTicket, status: newStatus});
            toast.success(`Status updated to ${newStatus}`);
            fetchTickets(); // Refresh list
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const updatePriority = async (newPriority) => {
        try {
            await api.put(`/tickets/${selectedTicket._id || selectedTicket.id}`, { priority: newPriority });
            setSelectedTicket({...selectedTicket, priority: newPriority});
            toast.success(`Priority updated to ${newPriority}`);
            fetchTickets(); // Refresh list
        } catch (error) {
            toast.error("Failed to update priority");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Open': return <span className="ticket-badge badge-warning">Open</span>;
            case 'In Progress': return <span className="ticket-badge badge-info">In Progress</span>;
            case 'Waiting for User': return <span className="ticket-badge badge-alert">Waiting for User</span>;
            case 'Resolved': 
            case 'Closed': return <span className="ticket-badge badge-success">{status}</span>;
            default: return <span className="ticket-badge">{status}</span>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High':
            case 'Critical': return <span className="ticket-badge badge-danger">{priority}</span>;
            case 'Medium': return <span className="ticket-badge badge-warning">Medium</span>;
            default: return <span className="ticket-badge badge-info">{priority}</span>;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-tickets-container">
            <PageHeader title="Support Management" subtitle="Centralized dashboard to manage all user complaints and requests." badge="ADMIN" />
            
            {/* KPI Stats */}
            <div className="ticket-stats-row">
                <div className="stat-card">
                    <span className="sc-label">Total Tickets</span>
                    <span className="sc-value">{stats.total}</span>
                </div>
                <div className="stat-card">
                    <span className="sc-label"><Activity size={14}/> Open</span>
                    <span className="sc-value text-warning">{stats.open}</span>
                </div>
                <div className="stat-card">
                    <span className="sc-label"><Clock size={14}/> In Progress</span>
                    <span className="sc-value text-info">{stats.inProgress}</span>
                </div>
                <div className="stat-card">
                    <span className="sc-label"><CheckCircle2 size={14}/> Resolved</span>
                    <span className="sc-value text-success">{stats.resolved}</span>
                </div>
                <div className="stat-card">
                    <span className="sc-label"><AlertCircle size={14}/> Critical</span>
                    <span className="sc-value text-danger">{stats.critical}</span>
                </div>
            </div>

            <div className="tickets-layout">
                {/* Left Side: Ticket List */}
                <div className="tickets-list-section">
                    <div className="tickets-filters">
                        <div className="search-box">
                            <Search size={16} className="search-icon" />
                            <input type="text" placeholder="Search by ticket or user..." />
                        </div>
                    </div>
                    
                    <div className="tickets-scroll-area">
                        {loading ? <p style={{padding:'20px'}}>Loading tickets...</p> : 
                            tickets.length === 0 ? <p style={{padding:'20px'}}>No tickets found.</p> :
                            tickets.map(ticket => (
                                <div 
                                    key={ticket._id || ticket.id} 
                                    className={`ticket-card ${selectedTicket?.id === (ticket._id || ticket.id) ? 'active' : ''}`}
                                    onClick={() => handleSelectTicket(ticket)}
                                >
                                    <div className="tc-header">
                                        <span className="tc-id">{ticket.ticketNumber}</span>
                                        <span className="tc-date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="tc-subject">{ticket.subject}</h4>
                                    <div className="tc-user"><User size={12}/> {ticket.submittedBy?.name || 'Unknown User'}</div>
                                    <div className="tc-footer">
                                        {getStatusBadge(ticket.status)}
                                        {getPriorityBadge(ticket.priority)}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Right Side: Ticket Details & Chat */}
                <div className="ticket-details-section">
                    {selectedTicket ? (
                        <>
                            <div className="td-header admin-td-header">
                                <div className="td-header-left">
                                    <h2>{selectedTicket.subject}</h2>
                                    <p className="td-meta">Ticket: {selectedTicket.ticketNumber} • Category: {selectedTicket.category}</p>
                                    <p className="td-user">Submitted by: <strong>{selectedTicket.submittedBy?.name || 'Unknown'}</strong> ({selectedTicket.submittedBy?.role})</p>
                                </div>
                                <div className="td-header-right">
                                    <select 
                                        className="status-select" 
                                        value={selectedTicket.status} 
                                        onChange={(e) => updateStatus(e.target.value)}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Waiting for User">Waiting for User</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                    <select 
                                        className="priority-select" 
                                        value={selectedTicket.priority} 
                                        onChange={(e) => updatePriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="td-messages">
                                {/* Original Complaint */}
                                <div className="message-bubble message-user">
                                    <div className="msg-header">
                                        <strong>{selectedTicket.submittedBy?.name || 'User'}</strong>
                                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="msg-body">{selectedTicket.description}</div>
                                    {selectedTicket.attachment && (
                                        <div className="msg-attachment">
                                            <Paperclip size={14}/> <a href={selectedTicket.attachment} target="_blank" rel="noreferrer">View Attachment</a>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Replies */}
                                {messages.map((msg, idx) => {
                                    const isAdminReply = ['Admin', 'Manager', 'HR'].includes(msg.sender?.role);
                                    return (
                                        <div key={idx} className={`message-bubble ${msg.isInternal ? 'message-internal' : (isAdminReply ? 'message-admin' : 'message-user')}`}>
                                            <div className="msg-header">
                                                <strong>{msg.sender?.name} {msg.isInternal && <span className="internal-badge">INTERNAL NOTE</span>}</strong>
                                                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="msg-body">{msg.message}</div>
                                            {msg.attachment && (
                                                <div className="msg-attachment">
                                                    <Paperclip size={14}/> <a href={msg.attachment} target="_blank" rel="noreferrer">View Attachment</a>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <form className="td-reply-box" onSubmit={handleSendMessage}>
                                <div className="reply-options">
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} />
                                        Private Internal Note
                                    </label>
                                </div>
                                <textarea 
                                    placeholder={isInternalNote ? "Type a private note for other admins..." : "Type your reply to the user..."} 
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    className={isInternalNote ? 'internal-textarea' : ''}
                                ></textarea>
                                <div className="reply-actions">
                                    <button type="submit" className={`btn-send ${isInternalNote ? 'btn-send-internal' : ''}`}>
                                        <Send size={16}/> {isInternalNote ? 'Add Note' : 'Send Reply'}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="td-empty">
                            <MessageSquare size={48} />
                            <h3>Select a ticket</h3>
                            <p>Choose a ticket to review and manage the complaint.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AdminTickets;
