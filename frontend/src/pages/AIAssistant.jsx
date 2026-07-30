import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ChatSidebar from '../components/AIAssistant/ChatSidebar';
import ChatMessage from '../components/AIAssistant/ChatMessage';
import ChatInput from '../components/AIAssistant/ChatInput';
import './AIAssistant.css';
import { Bot, AlertCircle, Download } from 'lucide-react';

const AIAssistant = () => {
    const { user } = React.useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch initial data
    useEffect(() => {
        fetchHistory();
        fetchPrompts();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const fetchHistory = async () => {
        try {
            const res = await API.get('/ai/history');
            if (Array.isArray(res.data)) {
                setSessions(res.data);
            } else {
                console.error('Expected array for history, got:', typeof res.data);
                setSessions([]);
            }
            if (res.data.length > 0) {
                // By default load the first session or leave it empty for a new chat
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    const fetchPrompts = async () => {
        try {
            const res = await API.get('/ai/prompts');
            if (Array.isArray(res.data)) {
                setPrompts(res.data);
            } else {
                console.error('Expected array for prompts, got:', typeof res.data);
                setPrompts([]);
            }
        } catch (err) {
            console.error('Error fetching prompts:', err);
        }
    };

    const handleSendMessage = async (text, attachment) => {
        if (!text.trim() && !attachment) return;

        const newMessage = { role: 'user', content: text, chartData: null };
        setMessages(prev => [...prev, newMessage]);
        setLoading(true);
        setError(null);

        try {
            let res;
            if (attachment) {
                // Upload logic
                res = await API.post('/ai/upload', {
                    prompt: text,
                    documentUrl: 'dummy_base64_or_url',
                    fileName: attachment.name
                });
                setMessages(prev => [...prev, { role: 'assistant', content: res.data.result }]);
            } else {
                // Chat logic
                res = await API.post('/ai/chat', {
                    message: text,
                    sessionId: activeSessionId
                });
                setActiveSessionId(res.data.sessionId);
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: res.data.message,
                    chartData: res.data.chartData 
                }]);
                
                // Refresh sidebar if it's a new session
                if (!activeSessionId) {
                    fetchHistory();
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.response?.data?.message || 'Failed to communicate with AI Assistant.');
            setMessages(prev => [...prev, { role: 'system', content: 'An error occurred while processing your request.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
    };

    const handleSelectSession = async (sessionId) => {
        // In a real app, you would fetch the messages for this session ID
        // For now, we'll just mock it or keep it simple
        setActiveSessionId(sessionId);
        setMessages([{ role: 'assistant', content: 'Loaded session ' + sessionId }]);
    };

    const handleExport = () => {
        if (messages.length === 0) return;
        const textContent = messages.map(m => `${m.role.toUpperCase()}:\n${m.content}`).join('\n\n');
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${activeSessionId || 'new'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="ai-assistant-layout">
            <ChatSidebar 
                sessions={sessions} 
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
            />
            
            <div className="ai-chat-area">
                <div className="ai-chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Bot size={24} className="text-primary-600" />
                        <h2>AI Assistant</h2>
                    </div>
                    {messages.length > 0 && (
                        <button onClick={handleExport} className="ai-export-btn" title="Export Conversation">
                            <Download size={18} />
                        </button>
                    )}
                </div>
                
                <div className="ai-messages-container">
                    {messages.length === 0 ? (
                        <div className="ai-empty-state">
                            <Bot size={48} className="ai-empty-icon" />
                            <h3>How can I help you today, {user?.name}?</h3>
                            <div className="ai-suggested-prompts">
                                {prompts.map((p, i) => (
                                    <button key={i} onClick={() => handleSendMessage(p)} className="ai-prompt-btn">
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))
                    )}
                    
                    {loading && (
                        <div className="ai-loading-indicator">
                            <div className="dot-typing"></div>
                        </div>
                    )}
                    {error && (
                        <div className="ai-error-banner">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
            </div>
        </div>
    );
};

export default AIAssistant;
