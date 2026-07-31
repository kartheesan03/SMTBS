import React, { useState, useRef, useEffect } from 'react';
import { Search, Command, ArrowRight, Loader, Zap, CheckCircle, FileText, BarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ReportPreviewCard, ApprovalCard } from './RichResponseCard';
import './CommandCenter.css';

const CommandCenter = ({ onQuery, isProcessing, result, clearResult }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    // Auto-focus input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim() && !isProcessing) {
            onQuery(query);
        }
    };

    const handleAction = (action, type) => {
        console.log(`Action triggered: ${action} for ${type}`);
    };

    return (
        <div className="command-center-overlay">
            {/* The Main Command Palette */}
            <div className={`command-palette-container ${result ? 'has-result' : ''}`}>
                
                {/* Search Bar */}
                <form onSubmit={handleSubmit} className="command-search-bar">
                    <Search className="search-icon" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask SMTBMS AI or type a command..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (result) clearResult();
                        }}
                        disabled={isProcessing}
                    />
                    {isProcessing ? (
                        <div className="command-status processing">
                            <Loader className="animate-spin text-blue-500" size={20} />
                        </div>
                    ) : (
                        <div className="command-shortcuts">
                            <span className="kbd"><Command size={12}/></span>
                            <span className="kbd">K</span>
                        </div>
                    )}
                </form>

                {/* Suggestions (when empty) */}
                {!query && !result && !isProcessing && (
                    <div className="command-suggestions">
                        <div className="suggestion-group">
                            <h4>Quick Commands</h4>
                            <button onClick={() => setQuery("Show yesterday's sales report")} className="cmd-item">
                                <FileText size={16}/> Show yesterday's sales report
                            </button>
                            <button onClick={() => setQuery("Are there any pending approvals?")} className="cmd-item">
                                <CheckCircle size={16}/> View pending approvals
                            </button>
                            <button onClick={() => setQuery("What is our current inventory status?")} className="cmd-item">
                                <BarChart2 size={16}/> Check inventory status
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Result Widget */}
                {result && (
                    <div className="command-result-widget">
                        {/* Render rich cards if metadata exists */}
                        {result.metadata?.reportPreview ? (
                            <div className="widget-rich-content">
                                <ReportPreviewCard 
                                    title={result.metadata.reportPreview.title}
                                    data={result.metadata.reportPreview.data}
                                    onAction={handleAction}
                                />
                            </div>
                        ) : result.metadata?.approval ? (
                            <div className="widget-rich-content">
                                <ApprovalCard 
                                    data={result.metadata.approval}
                                    onAction={handleAction}
                                />
                            </div>
                        ) : (
                            /* Fallback to markdown text */
                            <div className="widget-text-content">
                                <ReactMarkdown>{result.content}</ReactMarkdown>
                            </div>
                        )}
                        
                        <div className="widget-footer">
                            <span>Press Esc to dismiss or type to start a new command</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandCenter;
