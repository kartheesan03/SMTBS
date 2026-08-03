import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AriaContext } from '../../context/AriaContext';
import { X, Send, Sparkles, Square, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import './AriaSidePanel.css';
const StreamingMessage = ({ content, isStreaming, onComplete }) => {
    const [displayedContent, setDisplayedContent] = useState(isStreaming ? '' : content);
    const indexRef = useRef(0);
    useEffect(() => {
        if (!isStreaming) {
            setDisplayedContent(content);
            return;
        }
        indexRef.current = 0;
        setDisplayedContent('');
        const interval = setInterval(() => {
            if (indexRef.current < content.length) {
                setDisplayedContent(content.substring(0, indexRef.current + 1));
                indexRef.current++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 15);
        return () => clearInterval(interval);
    }, [content, isStreaming]);
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayedContent}
        </ReactMarkdown>
    );
};
const getSuggestions = (type) => {
    switch(type) {
        case 'Material':
            return [
                { title: "Show stock history", desc: "Show stock history" },
                { title: "Which vendors supply this?", desc: "Which vendors supply this?" },
                { title: "Set reorder alert", desc: "Set reorder alert" }
            ];
        case 'Vendor':
            return [
                { title: "Show delivery performance", desc: "Show delivery performance" },
                { title: "List active orders", desc: "List active orders" },
                { title: "Show contact info", desc: "Show contact info" }
            ];
        case 'Order':
            return [
                { title: "Show approval status", desc: "Show approval status" },
                { title: "Who approved this?", desc: "Who approved this?" },
                { title: "Generate order summary", desc: "Generate order summary" }
            ];
        default:
            return [];
    }
};
const AriaSidePanel = () => {
    const { isOpen, contextData, closeAria } = useContext(AriaContext);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const sessionIdRef = useRef(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);
    useEffect(() => {
        if (isOpen && contextData) {
            const sid = Date.now().toString();
            sessionIdRef.current = sid;
            const initialMsg = {
                id: Date.now(),
                role: 'assistant',
                content: `I've pulled up ${contextData.name} (Item #${contextData.id}). What would you like to know?`,
                suggestions: getSuggestions(contextData.type),
                isStreaming: true
            };
            setMessages([initialMsg]);
        }
    }, [isOpen, contextData]);
    useEffect(() => {
        if (sessionIdRef.current && messages.length > 0) {
            const stored = JSON.parse(localStorage.getItem('aria_sessions') || '[]');
            const existingIdx = stored.findIndex(s => s.id === sessionIdRef.current);
            const sessionObj = {
                id: sessionIdRef.current,
                title: contextData ? `Context: ${contextData.name}` : (messages[0]?.content.substring(0, 30) || 'New Chat'),
                messages: messages,
                updatedAt: Date.now()
            };
            if (existingIdx >= 0) {
                stored[existingIdx] = sessionObj;
            } else {
                stored.unshift(sessionObj);
            }
            localStorage.setItem('aria_sessions', JSON.stringify(stored));
        }
    }, [messages, contextData]);
    const handleSend = async (forcedText = null) => {
        const messageText = forcedText || input;
        if (!messageText.trim() || isLoading) return;
        const userMsg = { role: 'user', content: messageText, id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setIsLoading(true);
        try {
            const res = await API.post('/chat', {
                message: messageText,
                history: messages,
                context: contextData
            });
            const aiMsg = { 
                role: 'assistant', 
                content: res.data.reply || "I'm sorry, I couldn't process that.",
                id: Date.now() + 1,
                isStreaming: true,
                suggestions: res.data.suggestions || null
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsStreaming(true);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error("Failed to connect to Aria.");
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm having trouble connecting to my servers right now.",
                id: Date.now() + 1 
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    if (!isOpen && !contextData) return null;
    return (
        <>
            <div className={`aria-panel-backdrop ${isOpen ? 'open' : ''}`} onClick={closeAria}></div>
            <div className={`aria-side-panel ${isOpen ? 'open' : ''}`}>
                <div className="aria-sp-header">
                    <div className="aria-sp-brand">
                        <Sparkles size={18} className="aria-sp-icon" />
                        <h2>Ask Aria</h2>
                    </div>
                    <div className="aria-sp-actions">
                        <button onClick={() => { closeAria(); navigate('/ai-assistant'); }} title="Open in full screen">
                            <Maximize2 size={16} />
                        </button>
                        <button onClick={closeAria} title="Close">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                {contextData && (
                    <div className="aria-sp-context-chip">
                        <div className="chip-content">
                            <span className="chip-icon">📦</span>
                            <span className="chip-text">Discussing: {contextData.name} (ID: {contextData.id})</span>
                        </div>
                    </div>
                )}
                <div className="aria-sp-chat-area">
                    <div className="aria-sp-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`aria-sp-msg-wrapper ${msg.role}`}>
                                {msg.role === 'assistant' && (
                                    <div className="aria-sp-avatar"><Sparkles size={14} /></div>
                                )}
                                <div className="aria-sp-msg-content">
                                    {msg.role === 'assistant' ? (
                                        <>
                                            <StreamingMessage 
                                                content={msg.content} 
                                                isStreaming={msg.isStreaming}
                                                onComplete={() => {
                                                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStreaming: false } : m));
                                                    setIsStreaming(false);
                                                }}
                                            />
                                            {msg.suggestions && !msg.isStreaming && (
                                                <div className="aria-sp-suggestions">
                                                    {msg.suggestions.map((s, i) => (
                                                        <button key={i} className="aria-sp-chip" onClick={() => handleSend(s.desc)}>
                                                            {s.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="aria-sp-user-bubble">
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="aria-sp-msg-wrapper assistant">
                                <div className="aria-sp-avatar"><Sparkles size={14} /></div>
                                <div className="aria-sp-msg-content">
                                    <div className="dot-typing"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="aria-sp-input-area">
                    <div className="aria-sp-input-wrapper">
                        <textarea
                            ref={textareaRef}
                            className="aria-sp-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Message Aria..."
                            rows={1}
                        />
                        <button 
                            className={`aria-sp-send-btn ${input.trim() ? 'active' : ''}`}
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
export default AriaSidePanel;
