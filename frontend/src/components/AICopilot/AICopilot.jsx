import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Table as TableIcon, BarChart2, Loader2, Sparkles, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import API from '../../api/axios';
import './AICopilot.css';

const AICopilot = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello! I am your AI Copilot. I can query your data based on your role. How can I help you today?", type: 'text' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        setInput('');
        const newMsgId = Date.now();
        setMessages(prev => [...prev, { id: newMsgId, sender: 'user', text: userText, type: 'text' }]);
        setLoading(true);

        try {
            const res = await API.post('/ai/query', { question: userText });
            const data = res.data;

            if (data.success) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: data.explanation || 'Here is the data you requested:',
                    type: data.type, // 'text', 'table', or 'chart'
                    data: data.data // The actual array of objects from DB
                }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.message || "I encountered an error processing that request.", type: 'text' }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                sender: 'ai', 
                text: error.response?.data?.message || "Oops! Something went wrong communicating with the AI Copilot.", 
                type: 'text' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderData = (message) => {
        if (!message.data || message.data.length === 0) {
            return <div className="ai-no-data">No data returned for this query.</div>;
        }

        const sample = message.data[0];
        const keys = Object.keys(sample);

        if (message.type === 'table') {
            return (
                <div className="ai-data-table-wrapper">
                    <table className="ai-data-table">
                        <thead>
                            <tr>{keys.map(k => <th key={k}>{k}</th>)}</tr>
                        </thead>
                        <tbody>
                            {message.data.map((row, idx) => (
                                <tr key={idx}>
                                    {keys.map(k => <td key={k}>{row[k]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else if (message.type === 'chart') {
            // Best effort chart rendering. Assume first numeric key is Y, first string is X.
            let xKey = keys.find(k => typeof sample[k] === 'string') || keys[0];
            let yKey = keys.find(k => typeof sample[k] === 'number') || keys[1] || keys[0];

            return (
                <div className="ai-chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={message.data}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey={xKey} tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} />
                            <Tooltip />
                            <Bar dataKey={yKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }
        return null;
    };

    if (!isOpen) {
        return (
            <button className="ai-copilot-fab" onClick={() => setIsOpen(true)}>
                <Sparkles size={24} color="#fff" />
            </button>
        );
    }

    return (
        <div className="ai-copilot-window">
            <div className="ai-copilot-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={20} color="#fff" />
                    <span>AI Copilot</span>
                </div>
                <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                    <X size={20} color="#fff" />
                </button>
            </div>
            
            <div className="ai-messages-container">
                {messages.map((msg) => (
                    <div key={msg.id} className={`ai-message-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}>
                        {msg.sender === 'ai' && (
                            <div className="ai-avatar">
                                <Bot size={16} color="#8b5cf6" />
                            </div>
                        )}
                        <div className={`ai-message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                            <div className="ai-message-text">{msg.text}</div>
                            {msg.sender === 'ai' && msg.type !== 'text' && renderData(msg)}
                        </div>
                        {msg.sender === 'user' && (
                            <div className="user-avatar">
                                <User size={16} color="#fff" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="ai-message-row ai-row">
                        <div className="ai-avatar"><Bot size={16} color="#8b5cf6" /></div>
                        <div className="ai-message-bubble ai-bubble ai-loading-bubble">
                            <Loader2 size={16} className="spin-animation" color="#8b5cf6" />
                            <span>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="ai-input-form" onSubmit={handleSend}>
                <input 
                    type="text" 
                    placeholder="Ask a question about your data..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={!input.trim() || loading}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default AICopilot;
