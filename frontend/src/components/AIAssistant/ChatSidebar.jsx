import React, { useState } from 'react';
import { MessageSquare, Plus, Search } from 'lucide-react';

const ChatSidebar = ({ sessions, activeSessionId, onSelectSession, onNewChat }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const filteredSessions = safeSessions.filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="ai-sidebar">
            <button className="ai-new-chat-btn" onClick={onNewChat}>
                <Plus size={18} />
                <span>New Chat</span>
            </button>
            
            <div className="ai-sidebar-search">
                <Search size={14} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search chats..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="ai-history-list">
                <div className="ai-history-group-label">Recent</div>
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
        </div>
    );
};

export default ChatSidebar;
