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
    Minimize2,
    Minus
} from 'lucide-react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { AriaContext } from '../context/AriaContext';
import { toast } from 'react-hot-toast';
import AriaVisualizer from '../components/ui/AriaVisualizer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AriaCommandCenter.css';
const LoadingSequence = () => {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setStep(1), 800);
        return () => clearTimeout(timer);
    }, []);
    return (
        <span>{step === 0 ? "Querying database..." : "Analyzing results..."}</span>
    );
};

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

const AriaCommandCenter = () => {
    const { user } = useContext(AuthContext);
    const { ariaState, isFab, isOpen, closeAria, collapseAria, expandAria } = useContext(AriaContext);
    const navigate = useNavigate();
    
    // State
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

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('aria_intelligence_history', JSON.stringify(analyses));
    }, [analyses]);

    // Auto focus input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [activeAnalysisId]);

    // Auto-scroll to bottom of thread
    useEffect(() => {
        endOfThreadRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeAnalysis?.threads, isAnalyzing]);

    // Auto-resize textarea
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
        if (text.includes('employee') || text.includes('attendance')) return 'HR';
        if (text.includes('document') || text.includes('invoice') || text.includes('receipt')) return 'Documents';
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

    const generateIntelligenceReport = async (queryText, currentAnalysisId) => {
        const threadId = 't_' + Date.now();
        const newThread = {
            id: threadId,
            query: queryText,
            status: 'loading',
            category: determineCategory(queryText)
        };
        
        const analysisId = createOrUpdateAnalysis(newThread, currentAnalysisId);

        // Get context from previous thread if it exists
        let currentContext = null;
        setAnalyses(prev => {
            const analysis = prev.find(a => a.id === analysisId);
            if (analysis && analysis.threads && analysis.threads.length > 1) {
                const prevThread = analysis.threads[analysis.threads.length - 2];
                if (prevThread?.intelligence?.context) {
                    currentContext = prevThread.intelligence.context;
                }
            }
            return prev;
        });

        try {
            const res = await API.post('/chat', {
                message: queryText,
                history: [],
                context: currentContext
            });
            
            console.log("[ARIA] API response:", res.data);

            const category = determineCategory(queryText);
            
            const intelligence = {
                title: `${category.toUpperCase()} INTELLIGENCE`,
                metrics: res.data.metrics || [],
                visualData: res.data.visualData,
                insight: res.data.reply,
                whyItMatters: res.data.whyItMatters || "This affects operational throughput.",
                action: getRecommendedAction(queryText, res.data.visualData),
                isStreaming: true,
                context: res.data.context
            };

            updateLastThread(analysisId, { status: 'complete', intelligence });

        } catch (error) {
            console.error("Aria error:", error);
            updateLastThread(analysisId, { 
                status: 'error', 
                error: "Intelligence generation failed." 
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
                metrics: [`File: ${file.name}`, `Type: Receipt/Invoice`],
                visualData: res.data ? {
                    type: 'document_extraction',
                    modelName: file.name,
                    data: res.data
                } : null,
                insight: `Document processed successfully.`,
                whyItMatters: "Digitizing enables automated reconciliation.",
                action: { label: "Process Invoice", path: null },
                isStreaming: true,
                isDocument: true
            };

            updateLastThread(analysisId, { status: 'complete', intelligence });

        } catch (error) {
            updateLastThread(analysisId, { 
                status: 'error', 
                error: "Document analysis failed." 
            });
        } finally {
            setIsAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getRecommendedAction = (queryText, visualData) => {
        const text = queryText.toLowerCase();
        if (text.includes("order")) return { label: "Open Orders", path: "/orders/purchase" };
        if (text.includes("sales")) return { label: "Create Invoice", path: "/orders/create/sales" };
        if (text.includes("inventory")) return { label: "Manage Inventory", path: "/materials" };
        return { label: "Export Report", path: null };
    };

    const handleActionClick = (action, visualData) => {
        if (action.path) {
            navigate(action.path);
        } else {
            toast.success(`${action.label} initiated`);
        }
    };

    const clearAllAnalyses = () => {
        setAnalyses([]);
        setActiveAnalysisId(null);
    };

    const deleteAnalysis = (id, e) => {
        e.stopPropagation();
        setAnalyses(prev => prev.filter(a => a.id !== id));
        if (activeAnalysisId === id) setActiveAnalysisId(null);
    };

    const handleCategoryClick = async (category) => {
        if (isAnalyzing) return;
        let queryText = `Analyze ${category}`;
        setIsAnalyzing(true);
        const newThread = { id: 't_' + Date.now(), query: queryText, status: 'loading' };
        const analysisId = createOrUpdateAnalysis(newThread, null);
        await generateIntelligenceReport(queryText, analysisId);
    };

    const getContextForCategory = (category) => {
        const contexts = {
            'Orders': { title: 'Order Fulfillment', tags: ['Pending', 'Completed'], filters: ['Date', 'Status'] },
            'Inventory': { title: 'Stock Levels', tags: ['Low Stock', 'Critical'], filters: ['Warehouse', 'Category'] },
            'Sales': { title: 'Revenue Tracking', tags: ['Q3 Goals', 'High Value'], filters: ['Region', 'Product'] },
            'HR': { title: 'Workforce', tags: ['Attendance', 'Leaves'], filters: ['Department', 'Role', 'Status'] },
            'General': { title: 'General Operations', tags: ['Overview'], filters: ['Timeframe'] }
        };
        return contexts[category] || contexts['General'];
    };

    // ── State 1: fully closed ──
    if (ariaState === 'closed') return null;

    // ── State 2: compact floating FAB ──
    if (ariaState === 'fab') {
        return (
            <button
                className="aria-fab"
                onClick={expandAria}
                title="Open Aria Assistant"
                aria-label="Open Aria Assistant"
            >
                <Bot size={20} />
                <span className="aria-fab-label">Aria</span>
            </button>
        );
    }

    return (
        <div className="aria-console-layout aria-open aria-maximized">
            <div className="aria-app-header">
                <div className="aria-app-header-left">
                    <Bot size={17} className="nav-icon-blue" />
                    <div className="aria-app-header-titles">
                        <h2>Aria Intelligence</h2>
                        <span>AI-powered ERP Assistant</span>
                    </div>
                </div>
                <div className="aria-app-header-controls">
                    <button className="aria-header-btn" onClick={collapseAria} title="Minimize to Aria Button">
                        <Minus size={13} />
                    </button>
                    <button className="aria-header-btn close-btn" onClick={closeAria} title="Close">
                        <X size={13} />
                    </button>
                </div>
            </div>

            <div className="aria-console-inner">
                <div className="aria-console-sidebar">
                    <button className="aria-console-new-btn" onClick={handleNewAnalysis}><Plus size={14} /> New Analysis</button>
                    <div className="aria-console-nav-section">
                        <h3>CATEGORIES</h3>
                        {['Orders', 'Inventory', 'Sales', 'Customers', 'Employees', 'Documents'].map(cat => (
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

                <div className="aria-console-main">
                    <div className="aria-console-scroll-area">
                        {!activeAnalysisId ? (
                            <div className="aria-console-empty-state" style={{ padding: '2rem' }}>
                                <h1 className="hero-text" style={{ marginBottom: '0.5rem', color: '#1f2937' }}>Hi, I'm Aria</h1>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>What would you like to know about your business today?</p>
                                
                                <div style={{ width: '100%', maxWidth: '600px', textAlign: 'left' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Try asking:</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                        {[
                                            "How many active employees are there?",
                                            "Show today's sales",
                                            "What materials are low in stock?",
                                            "Show the latest purchase orders",
                                            "Top customers by revenue",
                                            "Total inventory value"
                                        ].map((suggestion, idx) => (
                                            <button 
                                                key={idx}
                                                style={{ textAlign: 'left', padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#4b5563', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}
                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1d4ed8'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#4b5563'; }}
                                                onClick={() => {
                                                    setInput(suggestion);
                                                    if (inputRef.current) inputRef.current.focus();
                                                }}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
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
                                                <LoadingSequence />
                                            </div>
                                        )}
                                        {thread.status === 'error' && (
                                            <div className="chat-message bot thread-error">
                                                {thread.error}
                                            </div>
                                        )}
                                        {thread.status === 'complete' && (
                                            <div className="chat-message bot intelligence-report">
                                                <AriaVisualizer visualData={thread.intelligence.visualData} />
                                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6', marginTop: '0.5rem' }}>
                                                    <StreamingText content={thread.intelligence.insight} isStreaming={thread.intelligence.isStreaming} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                    {thread.intelligence.metrics && thread.intelligence.metrics.map((m, i) => (
                                                        <div key={i} className="live-data-badge">
                                                            {m === "Source: Live Database" ? <span className="live-dot"></span> : null}
                                                            {m}
                                                        </div>
                                                    ))}
                                                </div>
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
                                title="Attach document"
                            >
                                <Paperclip size={16} />
                            </button>
                            
                            <textarea
                                ref={inputRef}
                                className="composer-input"
                                placeholder="Ask Aria about your business…"
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
                                title="Send"
                            >
                                <ArrowRight size={15} />
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            accept="image/*,.pdf"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AriaCommandCenter;

