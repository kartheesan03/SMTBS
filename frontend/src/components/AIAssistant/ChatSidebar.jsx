import React, { useState } from 'react';
import { MessageSquare, Plus, Search, Sparkles, Settings } from 'lucide-react';

const ChatSidebar = ({ sessions, activeSessionId, onSelectSession, onNewChat, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const filteredSessions = safeSessions.filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="ai-sidebar">
            <div className="ai-sidebar-header">
                <div className="ai-sidebar-logo">
                    <Sparkles size={20} color="white" />
                </div>
                <h3>SMTBMS</h3>
            </div>

            <button className="ai-new-chat-btn" onClick={onNewChat}>
                <Plus size={18} />
                <span>New Chat</span>
            </button>
            
            <div className="ai-sidebar-search">
                <Search size={14} color="rgba(255, 255, 255, 0.4)" />
                <input 
                    type="text" 
                    placeholder="Search history..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="ai-history-list">
                <div className="ai-history-group-label">Recent Chats</div>
                {filteredSessions.map(session => (
                    <div 
                        key={session.id} 
                        className={`ai-history-item ${activeSessionId === session.id ? 'active' : ''}`}
                        onClick={() => onSelectSession(session.id)}
                    >
                        <MessageSquare size={16} />
                        <span className="ai-history-title">{session.title}</span>
                    </div>
                ))}
            </div>

            <div className="ai-pro-card">
                <div className="ai-pro-content">
                    <h4>Upgrade to AI Pro</h4>
                    <p>Unlock advanced analytics and deeper business insights.</p>
                </div>
                <Sparkles size={24} color="white" style={{ position: 'absolute', right: '1rem', opacity: 0.5 }} />
            </div>

            <div className="ai-sidebar-user">
                <div className="ai-sidebar-user-info">
                    <div className="ai-sidebar-avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="ai-sidebar-name">
                        <span>{user?.name || 'User'}</span>
                        <span>{user?.role || 'Admin'}</span>
                    </div>
                </div>
                <button className="ai-settings-btn">
                    <Settings size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatSidebar;
