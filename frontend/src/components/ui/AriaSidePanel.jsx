import React, { useContext, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AriaContext } from '../../context/AriaContext';
import { X, Send, Sparkles, Paperclip, Maximize2, Minimize2, Plus, MessageSquare, Trash2, Database, Info, LayoutTemplate, StopCircle } from 'lucide-react';
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
        { title: "Show low-stock products", desc: "Show low stock products" },
        { title: "Which orders are pending?", desc: "Which orders are pending?" },
        { title: "Today's revenue", desc: "What is today's revenue?" }
    ];
};

const AriaSidePanel = () => {
    const { isOpen, contextData, closeAria, openMaximized } = useContext(AriaContext);
    const location = useLocation();
    
    // Window State
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Sync maximized state when panel opens
    useEffect(() => {
        if (isOpen) {
            setIsMaximized(openMaximized || false);
            setIsMinimized(false);
        }
    }, [isOpen, openMaximized]);
    
    // Chat State
    const [historyList, setHistoryList] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeContext, setActiveContext] = useState(null); // Right panel data
    
    // API State
    const [isLive, setIsLive] = useState(true);
    const abortControllerRef = useRef(null);
    
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Initialize Local Storage History
    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem('aria_history') || '[]');
        setHistoryList(savedHistory);
        checkApiStatus();
    }, []);

    const checkApiStatus = async () => {
        try {
            await API.get('/health');
            setIsLive(true);
        } catch {
            setIsLive(false);
        }
    };

    // Save history when messages change
    useEffect(() => {
        if (messages.length > 0 && currentChatId) {
            const updatedList = historyList.map(h => 
                h.id === currentChatId ? { ...h, messages } : h
            );
            if (!historyList.some(h => h.id === currentChatId)) {
                const firstUserMessage = messages.find(m => m.role === 'user')?.content;
                const genTitle = firstUserMessage ? (firstUserMessage.length > 25 ? firstUserMessage.substring(0, 25) + '...' : firstUserMessage) : 'New Conversation';
                
                updatedList.unshift({
                    id: currentChatId,
                    title: genTitle,
                    messages,
                    date: new Date().toISOString()
                });
            }
            setHistoryList(updatedList);
            localStorage.setItem('aria_history', JSON.stringify(updatedList));
        }
    }, [messages, currentChatId]);

    const createNewChat = () => {
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        setMessages([{
            id: Date.now(),
            role: 'assistant',
            content: "Hi! I'm Aria, your ERP Copilot. What can I help you find or accomplish today?",
            suggestions: getContextualSuggestions(location.pathname),
            isStreaming: true
        }]);
        setActiveContext(null);
    };

    // Open/Close effect
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            if (historyList.length > 0) {
                loadChat(historyList[0].id);
            } else {
                createNewChat();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (messagesEndRef.current && !isMinimized) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, isMinimized]);

    const loadChat = (id) => {
        const chat = historyList.find(h => h.id === id);
        if (chat) {
            setCurrentChatId(id);
            setMessages(chat.messages.map(m => ({ ...m, isStreaming: false })));
            setActiveContext(null);
        }
    };

    const deleteChat = (e, id) => {
        e.stopPropagation();
        const updated = historyList.filter(h => h.id !== id);
        setHistoryList(updated);
        localStorage.setItem('aria_history', JSON.stringify(updated));
        if (currentChatId === id) {
            setMessages([]);
            setCurrentChatId(null);
            createNewChat();
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Generation stopped.",
                id: Date.now() + 1
            }]);
        }
    };

    const handleSend = async (forcedText = null) => {
        const messageText = forcedText || input;
        if (!messageText.trim() || isLoading) return;
        
        const userMsg = { role: 'user', content: messageText, id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setIsLoading(true);
        setActiveContext(null);

        abortControllerRef.current = new AbortController();

        try {
            const res = await API.post('/chat', {
                message: messageText,
                history: messages.map(m => ({ role: m.role, content: m.content })),
                context: contextData
            }, { signal: abortControllerRef.current.signal });

            let aiText = res.data.reply;
            if ((!aiText || aiText === "Done.") && res.data.visualData) {
                const count = res.data.visualData.data?.length || 0;
                aiText = `Here is the data you requested.\n\n${count} records found.`;
            } else if (!aiText) {
                aiText = "I couldn't find any data for that request.";
            }

            const aiMsg = { 
                role: 'assistant', 
                content: aiText,
                id: Date.now() + 1,
                isStreaming: true,
                suggestions: res.data.suggestions || null,
                visualData: res.data.visualData || null
            };
            
            if (res.data.visualData) {
                setActiveContext({
                    model: res.data.visualData.modelName,
                    records: res.data.visualData.data?.length || 0,
                    type: res.data.visualData.type,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
            
            setMessages(prev => [...prev, aiMsg]);
            setIsLive(true);
        } catch (error) {
            if (error.name === 'CanceledError') return;
            console.error('Chat error:', error);
            setIsLive(false);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Unable to retrieve live ERP data.",
                id: Date.now() + 1,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const userMsg = { role: 'user', content: `Attached document: ${file.name}`, id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await API.post('/ocr/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && res.data.tables && res.data.tables.length > 0) {
                setActiveContext({
                    model: `OCR Extraction (${file.name})`,
                    records: res.data.tables[0].length || 0,
                    type: 'table',
                    timestamp: new Date().toLocaleTimeString()
                });
                
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I've successfully extracted the structured data from your document.",
                    id: Date.now() + 1,
                    isStreaming: true,
                    visualData: {
                        type: 'table',
                        modelName: `Extracted from ${file.name}`,
                        data: res.data.tables[0]
                    }
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I processed the document, but couldn't find any structured tables.",
                    id: Date.now() + 1,
                    isStreaming: true
                }]);
            }
        } catch (error) {
            console.error('OCR error:', error);
            toast.error("Failed to process document.");
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I had trouble processing that document. Please try again.",
                id: Date.now() + 1,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={`aria-panel-backdrop ${isOpen ? 'open' : ''}`} onClick={closeAria}></div>
            <div className={`aria-side-panel ${isOpen ? 'open' : ''} ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}>
                
                {/* HEADER */}
                <div className="aria-sp-header">
                    <div className="aria-sp-brand">
                        <div className="aria-sp-brand-icon">
                            <Sparkles size={18} />
                        </div>
                        <div className="aria-sp-brand-text" style={{ display: isMinimized ? 'none' : 'flex' }}>
                            <h2>Aria ERP Copilot</h2>
                            <span>AI-powered ERP Assistant</span>
                        </div>
                    </div>
                    
                    {!isMinimized && (
                        <div className={`aria-sp-status ${isLive ? 'live' : 'offline'}`}>
                            <div className="dot"></div>
                            {isLive ? 'Live Data' : 'Offline — Cached Data'}
                        </div>
                    )}

                    <div className="aria-sp-controls">
                        {isMinimized ? (
                            <button onClick={() => setIsMinimized(false)} title="Restore">
                                <Maximize2 size={16} />
                            </button>
                        ) : (
                        <>
                                <button onClick={() => setIsMinimized(true)} title="Minimize">
                                    <Minimize2 size={16} />
                                </button>
                                <button onClick={() => setIsMaximized(!isMaximized)} title="Maximize">
                                    <LayoutTemplate size={16} />
                                </button>
                            </>
                        )}
                        <button className="close" onClick={closeAria} title="Close (ESC)">
                            <X size={18} />
                        </button>
                    </div>
                </div>
                
                {/* BODY (3-Panel) */}
                <div className="aria-sp-body">
                    
                    {/* LEFT PANEL: HISTORY */}
                    <div className="aria-sp-left">
                        <button className="aria-sp-new-chat" onClick={createNewChat}>
                            <Plus size={16} /> New Chat
                        </button>
                        <div className="aria-sp-history-list">
                            {historyList.map(h => (
                                <div 
                                    key={h.id} 
                                    className={`aria-sp-history-item ${currentChatId === h.id ? 'active' : ''}`}
                                    onClick={() => loadChat(h.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MessageSquare size={14} />
                                        {h.title}
                                    </div>
                                    <button 
                                        className="aria-sp-history-delete"
                                        onClick={(e) => deleteChat(e, h.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CENTER PANEL: CHAT */}
                    <div className="aria-sp-center">
                        <div className="aria-sp-chat-area">
                            <div className="aria-sp-messages">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`aria-sp-msg-wrapper ${msg.role}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="aria-sp-avatar"><Sparkles size={16} /></div>
                                        )}
                                        <div className="aria-sp-msg-content" style={{ maxWidth: msg.visualData ? '100%' : '85%' }}>
                                            {msg.isError ? (
                                                <div className="aria-sp-error">
                                                    {msg.content}
                                                    <button onClick={() => handleSend(messages[messages.length-2].content)} style={{background:'white',border:'1px solid #fecaca',padding:'4px 8px',borderRadius:'4px',cursor:'pointer',color:'#991b1b',fontSize:'0.8rem',marginLeft:'8px'}}>Retry</button>
                                                </div>
                                            ) : msg.role === 'assistant' ? (
                                                <>
                                                    <StreamingMessage 
                                                        content={msg.content} 
                                                        isStreaming={msg.isStreaming}
                                                        onComplete={() => {
                                                            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStreaming: false } : m));
                                                        }}
                                                    />
                                                    
                                                    {/* SMART VISUALIZATION EMBEDDED IN CHAT */}
                                                    {msg.visualData && (
                                                        <AriaVisualizer visualData={msg.visualData} />
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
                                                    {msg.content || '-'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="aria-sp-msg-wrapper assistant">
                                        <div className="aria-sp-avatar"><Sparkles size={16} /></div>
                                        <div className="aria-sp-msg-content">
                                            <div className="dot-typing"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* INPUT AREA */}
                        <div className="aria-sp-input-area">
                            <div className="aria-sp-input-container">
                                <div className="aria-sp-input-wrapper">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        style={{ display: 'none' }} 
                                        onChange={handleFileUpload}
                                        accept=".pdf,.png,.jpg,.jpeg"
                                    />
                                    <button 
                                        className="aria-sp-attach-btn" 
                                        title="Attach Document (OCR)"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip size={18} />
                                    </button>
                                    <textarea
                                        ref={textareaRef}
                                        className="aria-sp-input"
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = (e.target.scrollHeight) + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Ask Aria or use /slash commands..."
                                        rows={1}
                                    />
                                    {isLoading ? (
                                        <button className="aria-sp-send-btn loading" onClick={handleStop} title="Stop generation">
                                            <StopCircle size={18} />
                                        </button>
                                    ) : (
                                        <button 
                                            className={`aria-sp-send-btn ${input.trim() ? 'active' : ''}`}
                                            onClick={() => handleSend()}
                                            disabled={!input.trim()}
                                        >
                                            <Send size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: INSIGHTS */}
                    <div className={`aria-sp-right ${activeContext ? '' : 'collapsed'}`}>
                        {activeContext && (
                            <div className="aria-sp-insights">
                                <div className="aria-insight-card">
                                    <h4><Database size={14} style={{display:'inline', marginRight:'6px', verticalAlign:'middle'}}/> Data Source</h4>
                                    <p style={{fontSize:'0.9rem', color:'#1e293b', margin:'0 0 8px 0'}}>
                                        <strong>{activeContext.model || 'ERP Database'}</strong>
                                    </p>
                                    <p style={{fontSize:'0.85rem', color:'#64748b', margin:0}}>
                                        Records Processed: {activeContext.records}
                                    </p>
                                    <p style={{fontSize:'0.85rem', color:'#64748b', margin:'4px 0 0 0'}}>
                                        Query Time: {activeContext.timestamp}
                                    </p>
                                </div>
                                <div className="aria-insight-card">
                                    <h4><Info size={14} style={{display:'inline', marginRight:'6px', verticalAlign:'middle'}}/> Key Insights</h4>
                                    <p style={{fontSize:'0.85rem', color:'#334155', lineHeight:'1.5', margin:0}}>
                                        Data is currently synchronized in live mode. You can export this view to CSV or continue refining your search using the chat above.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
        </>
    );
};

export default AriaSidePanel;
