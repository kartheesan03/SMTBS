import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';
import { Search, Filter, MessageSquare, Send, Paperclip, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminTickets.css'; // Shared CSS

const MyTickets = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

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
                isInternal: false
            });
            setMessages([...messages, res.data]);
            setNewMessage("");
            toast.success("Reply sent!");
            
            // Refetch tickets to update status if it changed
            fetchTickets();
            
            // update local selected ticket status to Open if it was waiting for user
            if(selectedTicket.status === 'Waiting for User') {
                setSelectedTicket({...selectedTicket, status: 'Open'});
            }
        } catch (error) {
            toast.error("Failed to send message");
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
            <PageHeader title="My Support Tickets" subtitle="View and track your submitted complaints and requests." badge="SUPPORT" />
            
            <div className="tickets-layout">
                {/* Left Side: Ticket List */}
                <div className="tickets-list-section">
                    <div className="tickets-filters">
                        <div className="search-box">
                            <Search size={16} className="search-icon" />
                            <input type="text" placeholder="Search my tickets..." />
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
                            <div className="td-header">
                                <div>
                                    <h2>{selectedTicket.subject}</h2>
                                    <p className="td-meta">Ticket: {selectedTicket.ticketNumber} • Category: {selectedTicket.category}</p>
                                </div>
                                <div>
                                    {getStatusBadge(selectedTicket.status)}
                                </div>
                            </div>
                            
                            <div className="td-messages">
                                {/* Original Complaint */}
                                <div className="message-bubble message-user">
                                    <div className="msg-header">
                                        <strong>{selectedTicket.submittedBy?.name || 'You'}</strong>
                                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="msg-body">{selectedTicket.description}</div>
                                    {selectedTicket.attachment && (
                                        <div className="msg-attachment">
                                            <Paperclip size={14}/> <a href={selectedTicket.attachment} target="_blank" rel="noreferrer">Attachment</a>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Replies */}
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender?._id === user._id || msg.sender?.id === user.id;
                                    return (
                                        <div key={idx} className={`message-bubble ${isMe ? 'message-user' : 'message-admin'}`}>
                                            <div className="msg-header">
                                                <strong>{msg.sender?.name} {msg.isInternal && '(Internal Note)'}</strong>
                                                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="msg-body">{msg.message}</div>
                                            {msg.attachment && (
                                                <div className="msg-attachment">
                                                    <Paperclip size={14}/> <a href={msg.attachment} target="_blank" rel="noreferrer">Attachment</a>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <form className="td-reply-box" onSubmit={handleSendMessage}>
                                <textarea 
                                    placeholder="Type your reply here..." 
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                ></textarea>
                                <div className="reply-actions">
                                    <button type="submit" className="btn-send"><Send size={16}/> Send Reply</button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="td-empty">
                            <MessageSquare size={48} />
                            <h3>Select a ticket</h3>
                            <p>Choose a ticket from the list to view its details and conversation history.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MyTickets;
