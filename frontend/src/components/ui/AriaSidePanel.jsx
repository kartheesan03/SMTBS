import React, { useContext, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AriaContext } from '../../context/AriaContext';
import { X, Send, Sparkles, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import './AriaSidePanel.css';
import AriaVisualizer from './AriaVisualizer';

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

// Route-aware suggestions
const getContextualSuggestions = (pathname) => {
    if (pathname.includes('/inventory') || pathname.includes('/materials')) {
        return [
            { title: "Show low stock products", desc: "Show low-stock products" },
            { title: "Pending restock requests", desc: "Show pending restock requests" }
        ];
    }
    if (pathname.includes('/sales') || pathname.includes('/orders')) {
        return [
            { title: "Show today's sales", desc: "Show today's sales" },
            { title: "Pending orders", desc: "Which orders are pending?" }
        ];
    }
    if (pathname.includes('/hrms') || pathname.includes('/attendance')) {
        return [
            { title: "Pending leave requests", desc: "Who has pending leave requests?" },
            { title: "Attendance summary", desc: "Show attendance summary" }
        ];
    }
    return [
        { title: "Show low-stock products", desc: "Show low-stock products." },
        { title: "Which orders are pending?", desc: "Which orders are pending?" },
        { title: "Today's revenue", desc: "Show today's revenue." }
    ];
};

const AriaSidePanel = () => {
    const { isOpen, contextData, closeAria } = useContext(AriaContext);
    const location = useLocation();
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeVisualData, setActiveVisualData] = useState(null);
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const initialMsg = {
                id: Date.now(),
                role: 'assistant',
                content: "Hi! I'm Aria, your ERP Copilot. What can I help you find or accomplish today?",
                suggestions: getContextualSuggestions(location.pathname),
                isStreaming: true
            };
            setMessages([initialMsg]);
        }
    }, [isOpen, location.pathname, messages.length]);

    const handleSend = async (forcedText = null) => {
        const messageText = forcedText || input;
        if (!messageText.trim() || isLoading) return;
        
        const userMsg = { role: 'user', content: messageText, id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setIsLoading(true);
        setActiveVisualData(null); // Clear previous visual data on new query

        try {
            const res = await API.post('/chat', {
                message: messageText,
                history: messages,
                context: contextData
            });

            if (res.data.visualData) {
                setActiveVisualData(res.data.visualData);
            }

            const aiMsg = { 
                role: 'assistant', 
                content: res.data.reply || "Done.",
                id: Date.now() + 1,
                isStreaming: true,
                suggestions: res.data.suggestions || null,
                hasVisual: !!res.data.visualData
            };
            
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error("Failed to connect to Aria.");
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm having trouble connecting to the database.",
                id: Date.now() + 1 
            }]);
        } finally {
            setIsLoading(false);
        }
    };



    if (!isOpen) return null;

    return (
        <>
            <div className={`aria-panel-backdrop open`} onClick={closeAria}></div>
            <div className={`aria-side-panel open ${activeVisualData ? 'split-view' : ''}`}>
                <div className="aria-sp-left">
                    <div className="aria-sp-header">
                        <div className="aria-sp-brand">
                            <Sparkles size={18} className="aria-sp-icon" />
                            <h2>Aria ERP Copilot</h2>
                        </div>
                        <div className="aria-sp-actions">
                            <button onClick={closeAria} title="Close (ESC)">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    
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
                                                    }}
                                                />
                                                {msg.hasVisual && (
                                                    <div className="aria-sp-visual-chip">
                                                        <span>Interactive data loaded</span>
                                                    </div>
                                                )}
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
                                placeholder="Ask Aria or use /slash commands..."
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

                {/* Split-View Visualizer Right Panel */}
                {activeVisualData && (
                    <div className="aria-sp-right">
                        <AriaVisualizer visualData={activeVisualData} />
                    </div>
                )}
            </div>
        </>
    );
};

export default AriaSidePanel;
