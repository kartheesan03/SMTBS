import React, { useState, useEffect, useRef, useContext } from 'react';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TicketDetailView = ({ ticketId, onBack }) => {
    const { user } = useContext(AuthContext);
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (ticketId) {
            fetchTicketDetails();
        }
    }, [ticketId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tickets/${ticketId}`);
            setTicket(res.data.ticket);
            
            // Filter out internal messages just in case (backend usually protects this, but better safe)
            const publicMessages = (res.data.messages || []).filter(m => !m.isInternal);
            
            // Reconstruct the first message from the original complaint
            const firstMsg = {
                _id: 'initial',
                message: res.data.ticket.description,
                attachment: res.data.ticket.attachment,
                sender: res.data.ticket.submittedBy,
                createdAt: res.data.ticket.createdAt
            };
            
            setMessages([firstMsg, ...publicMessages]);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching ticket details:", error);
            toast.error("Failed to load ticket details.");
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await api.post(`/tickets/${ticketId}/messages`, {
                message: newMessage,
                isInternal: false
            });
            
            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="ticket-detail-loading">Loading ticket details...</div>;
    }

    if (!ticket) {
        return <div className="ticket-detail-error">Ticket not found. <button onClick={onBack}>Go Back</button></div>;
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Open': return <span className="td-badge badge-warning">Open</span>;
            case 'In Progress': return <span className="td-badge badge-info">In Progress</span>;
            case 'Waiting for User': return <span className="td-badge badge-alert">Waiting for User</span>;
            case 'Resolved': 
            case 'Closed': return <span className="td-badge badge-success">{status}</span>;
            default: return <span className="td-badge">{status}</span>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High':
            case 'Critical': return <span className="td-badge badge-danger">{priority}</span>;
            case 'Medium': return <span className="td-badge badge-warning">Medium</span>;
            default: return <span className="td-badge badge-info">{priority}</span>;
        }
    };

    return (
        <div className="ticket-detail-container">
            <div className="td-top-bar">
                <button className="btn-back" onClick={onBack}>
                    <ArrowLeft size={16} /> Back to My Complaints
                </button>
            </div>
            
            <div className="td-header">
                <div className="td-header-left">
                    <h2>{ticket.subject}</h2>
                    <p className="td-meta">
                        Ticket: <strong>{ticket.ticketNumber}</strong> &nbsp;•&nbsp; 
                        Created: {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="td-header-right">
                    <div className="td-meta-item">
                        <span>Category:</span>
                        <strong>{ticket.category}</strong>
                    </div>
                    <div className="td-meta-item">
                        <span>Status:</span>
                        {getStatusBadge(ticket.status)}
                    </div>
                    <div className="td-meta-item">
                        <span>Priority:</span>
                        {getPriorityBadge(ticket.priority)}
                    </div>
                </div>
            </div>

            <div className="td-conversation-area">
                <h3 className="conversation-title">Conversation</h3>
                <div className="td-messages-list">
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender && user && (msg.sender._id === user._id || msg.sender.id === user.id);
                        return (
                            <div key={idx} className={`td-msg-bubble ${isMe ? 'msg-mine' : 'msg-admin'}`}>
                                <div className="msg-header">
                                    <strong>{isMe ? 'You' : 'Admin Support'}</strong>
                                    <span className="msg-time">{new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="msg-body">{msg.message}</div>
                                {msg.attachment && (
                                    <div className="msg-attachment">
                                        <Paperclip size={14}/> <a href={msg.attachment} target="_blank" rel="noreferrer">View Attachment</a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {ticket.status !== 'Closed' && ticket.status !== 'Resolved' ? (
                    <form className="td-reply-form" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <button type="submit" className="btn-send-reply" disabled={isSubmitting || !newMessage.trim()}>
                            <Send size={16} /> Send
                        </button>
                    </form>
                ) : (
                    <div className="td-closed-notice">
                        This ticket is marked as {ticket.status}. No further replies can be added.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetailView;
