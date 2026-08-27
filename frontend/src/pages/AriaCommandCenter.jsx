import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Paperclip, 
    ArrowRight, 
    Plus, 
    Briefcase, 
    LayoutDashboard, 
    BarChart2, 
    Users, 
    FileText, 
    Clock, 
    ChevronRight,
    Download,
    Edit2,
    Activity,
    X,
    Bot,
    Maximize2,
    Minimize2
} from 'lucide-react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { AriaContext } from '../context/AriaContext';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { io } from 'socket.io-client';
import DynamicRenderer from '../components/DynamicRenderer';
import './AriaCommandCenter.css';

const StreamingText = ({ content, isStreaming, onComplete, className }) => {
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
        }, 10);
        return () => clearInterval(interval);
    }, [content, isStreaming]);

    return (
        <div className={className}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {displayedContent}
            </ReactMarkdown>
        </div>
    );
};

// DynamicTable removed, moved to DynamicRenderer.jsx

const AriaCommandCenter = () => {
    const { user } = useContext(AuthContext);
    const { isOpen, isMaximized, toggleMaximize, minimizeAria, closeAria } = useContext(AriaContext);
    const navigate = useNavigate();
    
    const [input, setInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // History & Threads
    const [analyses, setAnalyses] = useState(() => {
        try {
            const saved = localStorage.getItem('aria_intelligence_history');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map(analysis => ({
                    ...analysis,
                    threads: analysis.threads.map(thread => {
                        if (thread.status === 'loading') {
                            return { ...thread, status: 'error', error: 'Request cancelled or timed out.' };
                        }
                        return thread;
                    })
                }));
            }
        } catch (e) {
            console.error(e);
        }
        return [];
    });
    
    const [activeAnalysisId, setActiveAnalysisId] = useState(null);
    const activeAnalysis = analyses.find(a => a.id === activeAnalysisId);
    
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    const endOfThreadRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('aria_intelligence_history', JSON.stringify(analyses));
    }, [analyses]);

    useEffect(() => {
        // Initialize WebSocket connection
        socketRef.current = io(window.location.origin.replace('3000', '5000'), {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('erp_update', (data) => {
            // When an ERP update happens, we could re-trigger the active query
            // if it matches the module that was updated.
            console.log('Real-time ERP update received:', data);
            
            setAnalyses(prev => {
                const active = prev.find(a => a.id === activeAnalysisId);
                if (active && active.threads.length > 0) {
                    const lastThread = active.threads[active.threads.length - 1];
                    // Very simplified logic: if the last thread's query is somewhat related to the update type
                    // In a production app, we would track subscriptions or the current visible tool's data type.
                    if (lastThread.status === 'complete' && 
                        (lastThread.category?.toLowerCase() === data.module || 
                         lastThread.query?.toLowerCase().includes(data.module))) {
                        // Re-trigger silently
                        // To keep this pure, we'd dispatch an event or call a function outside this setter.
                        // For now we'll dispatch a custom window event to handle it outside
                        window.dispatchEvent(new CustomEvent('aria_refresh_active_query', { detail: { queryText: lastThread.query, analysisId: activeAnalysisId } }));
                    }
                }
                return prev;
            });
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [activeAnalysisId]);

    useEffect(() => {
        const handleSilentRefresh = async (e) => {
            const { queryText, analysisId } = e.detail;
            if (queryText && analysisId) {
                // Silently refresh data
                try {
                    const res = await API.post('/assistant/query', {
                        message: queryText,
                        history: getChatHistory(analysisId)
                    });
                    const data = res.data;
                    const intelligence = {
                        title: data.title || 'INTELLIGENCE',
                        insight: data.reply || 'Data retrieved.',
                        isStreaming: false, // Don't stream on refresh
                        visualData: data
                    };
                    updateLastThread(analysisId, { status: 'complete', intelligence });
                } catch (error) {
                    console.error("Silent refresh failed", error);
                }
            }
        };
        window.addEventListener('aria_refresh_active_query', handleSilentRefresh);
        return () => window.removeEventListener('aria_refresh_active_query', handleSilentRefresh);
    }, [analyses]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [activeAnalysisId]);

    useEffect(() => {
        endOfThreadRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeAnalysis?.threads, isAnalyzing]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = '24px';
            const scrollHeight = inputRef.current.scrollHeight;
            inputRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleNewAnalysis = () => {
        setActiveAnalysisId(null);
        setInput('');
        if (inputRef.current) inputRef.current.focus();
    };

    const determineCategory = (query) => {
        const text = query.toLowerCase();
        if (text.includes('order')) return 'Orders';
        if (text.includes('stock') || text.includes('inventory')) return 'Inventory';
        if (text.includes('sale') || text.includes('revenue')) return 'Sales';
        if (text.includes('employee') || text.includes('attendance') || text.includes('payroll')) return 'HR';
        if (text.includes('customer')) return 'Customers';
        if (text.includes('document') || text.includes('invoice') || text.includes('receipt') || text.includes('ocr')) return 'Documents';
        if (text.includes('material')) return 'Materials';
        return 'General';
    };

    const createOrUpdateAnalysis = (newThread, existingAnalysisId) => {
        const isNew = !existingAnalysisId;
        const analysisId = isNew ? Date.now().toString() : existingAnalysisId;
        
        setAnalyses(prev => {
            let updated = [...prev];
            
            if (isNew) {
                updated.unshift({
                    id: analysisId,
                    title: newThread.query.substring(0, 40) + (newThread.query.length > 40 ? '...' : ''),
                    category: determineCategory(newThread.query),
                    updatedAt: Date.now(),
                    threads: [newThread]
                });
            } else {
                const idx = updated.findIndex(a => a.id === analysisId);
                if (idx !== -1) {
                    const analysis = { ...updated[idx] };
                    analysis.threads = [...analysis.threads, newThread];
                    analysis.updatedAt = Date.now();
                    updated.splice(idx, 1);
                    updated.unshift(analysis);
                }
            }
            return updated;
        });

        if (isNew) {
            setActiveAnalysisId(analysisId);
        }
        
        return analysisId;
    };

    const updateLastThread = (analysisId, updates) => {
        setAnalyses(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(a => a.id === analysisId);
            if (idx !== -1) {
                const analysis = { ...updated[idx] };
                const threads = [...analysis.threads];
                if (threads.length > 0) {
                    threads[threads.length - 1] = { ...threads[threads.length - 1], ...updates };
                }
                analysis.threads = threads;
                updated[idx] = analysis;
            }
            return updated;
        });
    };

    const getChatHistory = (analysisId) => {
        const analysis = analyses.find(a => a.id === analysisId);
        if (!analysis) return [];
        let history = [];
        analysis.threads.forEach(t => {
            if (t.query) history.push({ role: 'user', content: t.query });
            if (t.intelligence && t.intelligence.insight) history.push({ role: 'assistant', content: t.intelligence.insight });
        });
        return history;
    };

    const generateIntelligenceReport = async (queryText, currentAnalysisId) => {
        const threadId = 't_' + Date.now();
        const newThread = {
            id: threadId,
            query: queryText,
            status: 'loading',
            category: determineCategory(queryText)
        };
        
        const analysisId = createOrUpdateAnalysis(newThread, currentAnalysisId);
        const history = getChatHistory(analysisId);

        try {
            const res = await API.post('/assistant/query', {
                message: queryText,
                history: history
            });

            const data = res.data;
            
            const intelligence = {
                title: data.title || 'INTELLIGENCE',
                insight: data.reply || 'Data retrieved.',
                isStreaming: true,
                visualData: data // Pass all structured data directly to the renderer
            };

            updateLastThread(analysisId, { status: 'complete', intelligence });

        } catch (error) {
            console.error("Aria error:", error);
            updateLastThread(analysisId, { 
                status: 'error', 
                error: "Aria is temporarily unavailable. Please try again." 
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const messageText = input.trim();
        if (!messageText || isAnalyzing) return;

        setInput('');
        setIsAnalyzing(true);
        await generateIntelligenceReport(messageText, activeAnalysisId);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsAnalyzing(true);
        const queryText = `Analyze document: ${file.name}`;
        
        const newThread = {
            id: 't_' + Date.now(),
            query: queryText,
            status: 'loading',
            category: 'Documents'
        };
        const analysisId = createOrUpdateAnalysis(newThread, activeAnalysisId);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await API.post('/ocr/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const intelligence = {
                title: 'DOCUMENT INTELLIGENCE',
                insight: `Document processed successfully.`,
                isStreaming: true,
                visualData: res.data ? {
                    type: 'document_extraction',
                    modelName: file.name,
                    data: res.data
                } : null
            };

            updateLastThread(analysisId, { status: 'complete', intelligence });

        } catch (error) {
            toast.error("Failed to process document.");
            updateLastThread(analysisId, { 
                status: 'error', 
                error: "Document analysis failed." 
            });
        } finally {
            setIsAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const deleteAnalysis = (id, e) => {
        e.stopPropagation();
        setAnalyses(prev => prev.filter(a => a.id !== id));
        if (activeAnalysisId === id) setActiveAnalysisId(null);
    };

    const handleCategoryClick = async (category) => {
        if (isAnalyzing) return;
        let queryText = `Show ${category.toLowerCase()}`;
        setIsAnalyzing(true);
        // Do not create a thread here, just clear active analysis and let generateIntelligenceReport create it
        setActiveAnalysisId(null);
        await generateIntelligenceReport(queryText, null);
    };

    if (!isOpen) return null;

    return (
        <div className={`aria-console-layout aria-open ${isMaximized ? 'aria-maximized' : 'aria-floating'}`}>
            <div className="aria-app-header">
                <div className="aria-app-header-left">
                    <Bot size={18} className="nav-icon-blue" />
                    <h2>Aria Intelligence</h2>
                    <span>AI-powered ERP Assistant</span>
                </div>
                <div className="aria-app-header-controls">
                    {!isMaximized && <button className="aria-header-btn" onClick={toggleMaximize}><Maximize2 size={16} /></button>}
                    {isMaximized && <button className="aria-header-btn" onClick={minimizeAria}><Minimize2 size={16} /></button>}
                    <button className="aria-header-btn close-btn" onClick={closeAria}><X size={16} /></button>
                </div>
            </div>

            <div className="aria-console-inner">
                {isMaximized && (
                    <div className="aria-console-sidebar">
                        <button className="aria-console-new-btn" onClick={handleNewAnalysis}><Plus size={14} /> New Analysis</button>
                        <div className="aria-console-nav-section">
                            <h3>CATEGORIES</h3>
                            {['Orders', 'Inventory', 'Sales', 'Customers', 'Employees'].map(cat => (
                                <button key={cat} className="nav-item" onClick={() => handleCategoryClick(cat)}>{cat}</button>
                            ))}
                        </div>
                        <div className="aria-console-nav-section">
                            <h3>RECENT</h3>
                            {analyses.map(a => (
                                <div key={a.id} className="nav-item">
                                    <button onClick={() => setActiveAnalysisId(a.id)}>{a.title}</button>
                                    <button onClick={(e) => deleteAnalysis(a.id, e)}><X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="aria-console-main">
                    <div className="aria-console-scroll-area">
                        {!activeAnalysisId ? (
                            <div className="aria-console-empty-state">
                                <h1 className="hero-text">What are you working on?</h1>
                            </div>
                        ) : (
                            <div className="aria-console-threads">
                                {activeAnalysis?.threads.map(thread => (
                                    <div key={thread.id} className="intelligence-thread">
                                        <div className="chat-message user">
                                            <h3>{thread.query}</h3>
                                        </div>
                                        {thread.status === 'loading' && (
                                            <div className="chat-message bot thread-loading">
                                                <div className="loading-spinner"></div>
                                                Aria is checking your data...
                                            </div>
                                        )}
                                        {thread.status === 'error' && (
                                            <div className="chat-message bot thread-error">
                                                {thread.error}
                                            </div>
                                        )}
                                        {thread.status === 'complete' && (
                                            <div className="chat-message bot intelligence-report">
                                                <StreamingText content={thread.intelligence.insight} isStreaming={thread.intelligence.isStreaming} />
                                                {thread.intelligence.visualData && thread.intelligence.visualData.type && thread.intelligence.visualData.type !== 'document_extraction' && (
                                                    <DynamicRenderer data={thread.intelligence.visualData} />
                                                )}
                                                {thread.intelligence.visualData?.type === 'document_extraction' && (
                                                    <div className="document-extraction-results">
                                                        <pre>{JSON.stringify(thread.intelligence.visualData.data, null, 2)}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={endOfThreadRef} />
                            </div>
                        )}
                    </div>

                    <div className="aria-console-composer-wrapper">
                        <div className="aria-console-composer">
                            <button 
                                className="composer-attach-btn" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isAnalyzing}
                            >
                                <Paperclip size={18} />
                            </button>
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileUpload}
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                            />

                            <textarea
                                ref={inputRef}
                                className="composer-input"
                                placeholder="Ask Aria about your business..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                disabled={isAnalyzing}
                            />

                            <button 
                                className={`composer-send-btn ${input.trim() && !isAnalyzing ? 'active' : ''}`}
                                onClick={handleSend}
                                disabled={!input.trim() || isAnalyzing}
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                        
                        <div className="composer-commands">
                            <button onClick={() => { setInput("Show orders "); inputRef.current?.focus(); }}>orders</button>
                            <button onClick={() => { setInput("Show inventory "); inputRef.current?.focus(); }}>inventory</button>
                            <button onClick={() => { setInput("Show sales "); inputRef.current?.focus(); }}>sales</button>
                            <button onClick={() => { setInput("Show customers "); inputRef.current?.focus(); }}>customers</button>
                            <button onClick={() => { setInput("Show employees "); inputRef.current?.focus(); }}>employees</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AriaCommandCenter;
