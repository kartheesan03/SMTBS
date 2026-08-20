import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Search, Phone, Video, MoreVertical, Image as ImageIcon, Paperclip, Smile, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './SocialMessages.css';

const SocialMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();
    const newChatUser = location.state?.newChatUser;
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await API.get('/social/messages');
                let convs = Array.isArray(data) ? data : [];
                
                if (newChatUser) {
                    const existing = convs.find(c => c.id === newChatUser.id);
                    if (!existing) {
                        convs = [{
                            id: newChatUser.id,
                            name: newChatUser.name,
                            presence: 'online',
                            lastMessage: 'Start a conversation...',
                            time: '',
                            unread: 0
                        }, ...convs];
                    }
                    setConversations(convs);
                    setActiveConv(convs.find(c => c.id === newChatUser.id));
                } else {
                    setConversations(convs);
                    if (convs.length > 0) setActiveConv(convs[0]);
                }
            } catch (error) {
                console.error('Error fetching conversations', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [newChatUser]);

    useEffect(() => {
        if (activeConv) {
            const fetchMessages = async () => {
                try {
                    const { data } = await API.get(`/social/messages/${activeConv.id}`);
                    setMessages(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error('Error fetching messages', error);
                    setMessages([]);
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
                senderId: currentUser?.id || 1,
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
                    <div className="messages-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                            onClick={() => navigate('/social/network')} 
                            className="icon-btn" 
                            style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                            title="Back to Network"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ margin: 0 }}>Messages</h2>
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
                                </div>
                            </div>

                            <div className="chat-history">
                                {messages.length === 0 ? (
                                    <div className="chat-empty">No messages yet. Start the conversation.</div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isOutgoing = msg.senderId === (currentUser?.id || 1);
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
