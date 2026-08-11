import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { MessageSquare, X, Send, Minus } from 'lucide-react';
import './LiveChatWidget.css';

const LiveChatWidget = ({ isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatTicket, setChatTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check if there's an active Live Chat ticket for this user
    useEffect(() => {
        if (isOpen && !chatTicket) {
            findOrCreateActiveChat();
        }
    }, [isOpen]);

    // Polling for new messages
    useEffect(() => {
        let interval;
        if (isOpen && !isMinimized && chatTicket) {
            interval = setInterval(() => {
                fetchMessages(chatTicket._id || chatTicket.id);
            }, 5000); // poll every 5 seconds
        }
        return () => clearInterval(interval);
    }, [isOpen, isMinimized, chatTicket]);

    const findOrCreateActiveChat = async () => {
        try {
            setLoading(true);
            const res = await api.get('/tickets');
            // Look for an Open or In Progress ticket with category 'Live Chat'
            const existingChat = res.data.find(
                t => t.category === 'Live Chat' && 
                (t.status === 'Open' || t.status === 'In Progress' || t.status === 'Waiting for User')
            );

            if (existingChat) {
                setChatTicket(existingChat);
                await fetchMessages(existingChat._id || existingChat.id);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error finding chat:", error);
            setLoading(false);
        }
    };

    const fetchMessages = async (ticketId) => {
        try {
            const res = await api.get(`/tickets/${ticketId}`);
            if (res.data && res.data.messages) {
                // Filter out internal messages
                const publicMessages = res.data.messages.filter(m => !m.isInternal);
                
                // Construct original complaint as first message
                const firstMsg = {
                    _id: 'initial',
                    message: res.data.ticket.description,
                    sender: res.data.ticket.submittedBy,
                    createdAt: res.data.ticket.createdAt
                };
                
                setMessages([firstMsg, ...publicMessages]);
            }
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            let activeTicketId = chatTicket ? (chatTicket._id || chatTicket.id) : null;

            // If no active chat ticket, create one first
            if (!activeTicketId) {
                const res = await api.post('/tickets', {
                    subject: 'Live Chat Support',
                    category: 'Live Chat',
                    priority: 'Medium',
                    description: newMessage
                });
                setChatTicket(res.data);
                
                // Add first message locally
                setMessages([{
                    _id: 'initial',
                    message: newMessage,
                    sender: res.data.submittedBy,
                    createdAt: res.data.createdAt
                }]);
                setNewMessage('');
                return;
            }

            // Existing ticket, add message
            const currentMsg = newMessage;
            setNewMessage(''); // optimistic clear
            
            const res = await api.post(`/tickets/${activeTicketId}/messages`, {
                message: currentMsg,
                isInternal: false
            });
            
            setMessages(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`live-chat-widget ${isMinimized ? 'minimized' : ''}`}>
            <div className="lc-header" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="lc-header-title">
                    <MessageSquare size={16} />
                    <span>Live Support</span>
                </div>
                <div className="lc-header-actions">
                    <button className="lc-btn" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                        <Minus size={16} />
                    </button>
                    <button className="lc-btn lc-close-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                        <X size={16} />
                    </button>
                </div>
            </div>
            
            {!isMinimized && (
                <>
                    <div className="lc-body">
                        {loading ? (
                            <div className="lc-loading">Loading chat...</div>
                        ) : messages.length === 0 ? (
                            <div className="lc-empty">
                                <p>Hi there! 👋</p>
                                <p>How can we help you today?</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.sender?._id === user._id || msg.sender?.id === user.id;
                                return (
                                    <div key={idx} className={`lc-msg-bubble ${isMe ? 'lc-msg-user' : 'lc-msg-admin'}`}>
                                        <div className="lc-msg-content">{msg.message}</div>
                                        <div className="lc-msg-time">
                                            {msg.sender?.name || 'Unknown'} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form className="lc-footer" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="lc-send-btn" disabled={!newMessage.trim()}>
                            <Send size={16} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default LiveChatWidget;
