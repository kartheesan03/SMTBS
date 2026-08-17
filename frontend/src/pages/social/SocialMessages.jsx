import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, Phone, Video, MoreVertical, Image as ImageIcon, Paperclip, Smile, Send, MessageSquare } from 'lucide-react';
import './SocialMessages.css';

const SocialMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Placeholder API response format for conversations
                const mockConvs = [
                    { id: 1, name: 'Alice Smith', lastMessage: 'See you tomorrow!', time: '10:30 AM', unread: 2, presence: 'online' },
                    { id: 2, name: 'Bob Jones', lastMessage: 'Can you send the report?', time: 'Yesterday', unread: 0, presence: 'away' },
                    { id: 3, name: 'Marketing Team', lastMessage: 'Great job everyone.', time: 'Tue', unread: 0, presence: 'offline' },
                ];
                setConversations(mockConvs);
                setActiveConv(mockConvs[0]);
            } catch (error) {
                console.error('Error fetching conversations', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConv) {
            const fetchMessages = async () => {
                try {
                    const { data } = await API.get(`/social/messages/${activeConv.id}`);
                    setMessages(Array.isArray(data) ? data : [
                        { id: 101, content: 'Hey, are we still meeting tomorrow?', senderId: activeConv.id, createdAt: new Date(Date.now() - 3600000).toISOString() },
                        { id: 102, content: 'Yes, 10 AM works for me!', senderId: 1, createdAt: new Date(Date.now() - 3500000).toISOString() }
                    ]);
                } catch (error) {
                    console.error('Error fetching messages', error);
                }
            };
            fetchMessages();
        }
    }, [activeConv]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeConv) return;
        try {
            // Optimistic update for demo
            const optimisticMsg = {
                id: Date.now(),
                content: newMessage,
                senderId: 1,
                createdAt: new Date().toISOString()
            };
            setMessages([...messages, optimisticMsg]);
            setNewMessage('');
            
            await API.post(`/social/messages/${activeConv.id}`, {
                content: newMessage,
                recipientId: activeConv.id
            });
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    return (
        <div className="social-messages-container">
            <div className="messages-layout">
                {/* Left Sidebar: Conversations */}
                <div className="messages-sidebar">
                    <div className="messages-header">
                        <h2>Messages</h2>
                    </div>
                    <div className="messages-search">
                        <Search size={16} />
                        <input type="text" placeholder="Search..." />
                    </div>
                    <div className="conversation-list">
                        {loading ? (
                            <div className="conv-loading">Loading...</div>
                        ) : (
                            conversations.map(conv => (
                                <div 
                                    key={conv.id} 
                                    className={`conversation-item ${activeConv?.id === conv.id ? 'active' : ''}`}
                                    onClick={() => setActiveConv(conv)}
                                >
                                    <div className="conv-avatar-wrapper">
                                        <div className="conv-avatar">{conv.name.charAt(0)}</div>
                                        <span className={`presence-dot ${conv.presence}`}></span>
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-name-time">
                                            <h4>{conv.name}</h4>
                                            <span>{conv.time}</span>
                                        </div>
                                        <div className="conv-last-msg">
                                            <p className={conv.unread ? 'unread' : ''}>{conv.lastMessage}</p>
                                            {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="messages-main">
                    {activeConv ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-recipient-info">
                                    <div className="chat-avatar-wrapper">
                                        <div className="chat-avatar">{activeConv.name.charAt(0)}</div>
                                        <span className={`presence-dot ${activeConv.presence}`}></span>
                                    </div>
                                    <div>
                                        <h3>{activeConv.name}</h3>
                                        <span className="chat-status">{activeConv.presence === 'online' ? 'Active now' : activeConv.presence === 'away' ? 'Away' : 'Offline'}</span>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button><Phone size={18} /></button>
                                    <button><Video size={18} /></button>
                                    <button><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            <div className="chat-history">
                                {messages.length === 0 ? (
                                    <div className="chat-empty">No messages yet. Say hello!</div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isOutgoing = msg.senderId === 1;
                                        return (
                                            <div key={idx} className={`chat-bubble-wrapper ${isOutgoing ? 'sent' : 'received'}`}>
                                                {!isOutgoing && (
                                                    <div className="chat-message-avatar">
                                                        {activeConv.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="chat-message-content">
                                                    <div className="chat-bubble">
                                                        {msg.content}
                                                    </div>
                                                    <span className="chat-time">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            <div className="chat-input-area">
                                <div className="chat-input-wrapper">
                                    <button className="icon-btn"><Smile size={20} /></button>
                                    <button className="icon-btn"><Paperclip size={20} /></button>
                                    <button className="icon-btn"><ImageIcon size={20} /></button>
                                    <input 
                                        type="text" 
                                        placeholder="Type a new message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button className={`send-btn ${newMessage.trim() ? 'active' : ''}`} onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="chat-placeholder">
                            <MessageSquare size={48} className="placeholder-icon" />
                            <h3>Your Messages</h3>
                            <p>Select a conversation or start a new one</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialMessages;
